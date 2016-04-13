package org.domeos.framework.api.service.auth.impl;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.*;
import org.apache.shiro.subject.Subject;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.GitlabTokenException;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.consolemodel.auth.ChangeUserPassword;
import org.domeos.framework.api.consolemodel.auth.UserPassword;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.LoginType;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.auth.related.UserState;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.model.global.LdapInfo;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.service.auth.UserService;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.coderepo.GitlabApiWrapper;
import org.domeos.framework.shiro.token.MultiAuthenticationToken;
import org.domeos.util.CryptoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by zhenfengchen on 15-11-16.
 */
@Service("userService")
public class UserServiceImpl implements UserService {

    protected static Logger logger = Logger.getLogger(UserServiceImpl.class);
    @Autowired
    AuthBiz authBiz;
    @Autowired
    ProjectBiz projectBiz;
    @Autowired
    GlobalBiz globalBiz;

    /**
     * Verify current user has permission to modify user info related to
     * this 'username'
     *
     * @param username user name
     * @return
     */
    private boolean verify(String username) {
        Subject subject = SecurityUtils.getSubject();
        if (subject.hasRole(Role.ADMINISTRATOR.name())) {
            // if it's ADMINISTRATOR
            return true;
        } else {
            if (username.equals(((String) subject.getPrincipal()))) {
                // normal user can only modify own info
                return true;
            }
        }
        return false;
    }

    @Override
    public HttpResponseTemp<?> normalLogin(UserPassword userPass) {
        Subject subject = SecurityUtils.getSubject();
        String ldapEmailSuffix = null;
        if (userPass.getLoginType() != null && userPass.getLoginType().equals(LoginType.LDAP)) {
            LdapInfo ldapInfo = globalBiz.getLdapInfo();
            if (ldapInfo == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "ldap info must be set");
            }
            ldapEmailSuffix = ldapInfo.getEmailSuffix();
            String userName = userPass.getUsername();
            if (ldapEmailSuffix != null && !userName.endsWith(ldapEmailSuffix)) {
                userPass.setUsername(userName + ldapEmailSuffix);
            }
        }
        UsernamePasswordToken token = new MultiAuthenticationToken(userPass.getUsername(), userPass.getPassword(), userPass.getLoginType());
        try {
            subject.login(token);
        } catch (UnknownAccountException e) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("username wrong");
        } catch (IncorrectCredentialsException e) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("password wrong");
        } catch (ExcessiveAttemptsException e) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("login wrong too many times");
        } catch (AuthenticationException e) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("other reasons");
        }

        if (userPass.getLoginType() != null && userPass.getLoginType().equals(LoginType.LDAP)) {
            User user = new User();
            user.setUsername(userPass.getUsername());
            user.setLoginType(LoginType.LDAP);
            boolean firstTime = createUserForLDAP(user);
            // remove the email suffix to avoid acquire duplicate tokens
            String userName = user.getUsername();
            if (ldapEmailSuffix != null && userName.endsWith(ldapEmailSuffix)) {
                userName = userName.substring(0, userName.length() - ldapEmailSuffix.length());
            }
            if (firstTime || !checkGitlabInfo(user.getId(), userName)) {
                setGitlabInfo(user.getId(), userName, userPass.getPassword());
            }
            logger.info("ldap login success, user=" + userPass.getUsername());
        } else {
            logger.info("jdbc login success, user=" + userPass.getUsername());
        }
        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> createUser(int userId, User user, boolean flag) {
        if (flag) {
            if (!AuthUtil.isAdmin(userId)) {
                return ResultStat.USER_NOT_LEGAL.wrap("must be admin");
            }
        }
        if (user == null) {
            return ResultStat.USER_NOT_LEGAL.wrap(null, "user info is null");
        }

        if (!StringUtils.isBlank(user.checkLegality())) {
            return ResultStat.USER_NOT_LEGAL.wrap(null, user.checkLegality());
        }

        if (authBiz.getUserByName(user.getUsername()) != null) {
            return ResultStat.USER_EXISTED.wrap(null);
        }

        CryptoUtil.encryptPassword(user);
        user.setCreateTime(System.currentTimeMillis());

        authBiz.addUser(user);
        return ResultStat.OK.wrap(null);
    }

    public boolean createUserForLDAP(User user) {
        if (user == null) {
            return false;
        }
        User existUser = authBiz.getUserByName(user.getUsername());
        if (existUser == null) {
            user.setCreateTime(System.currentTimeMillis());
            user.setState(UserState.NORMAL);
            user.setPassword("NULL");
            authBiz.addUser(user);
            return true;
        } else {
            existUser.setUpdateTime(System.currentTimeMillis());
            authBiz.modifyUser(existUser);
            user.setId(existUser.getId());
            return false;
        }
    }

    @Override
    public HttpResponseTemp<?> createUser(int userId, User user) {
        return createUser(userId, user, true);
    }

    @Override
    public HttpResponseTemp<?> deleteUser(int userId, String username) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.USER_NOT_LEGAL.wrap("must be admin");
        }
        User user = authBiz.getUserByName(username);
        if (user == null) {
            return ResultStat.USER_NOT_EXIST.wrap(null);
        }
        user.setUpdateTime(System.currentTimeMillis());
        user.setState(UserState.DELETED);
        authBiz.deleteUser(user);
        return ResultStat.OK.wrap("");
    }

    @Override
    public HttpResponseTemp<?> modifyUser(int userId, String username, String email) {
        User user = getUser(username);
        if (user == null) {
            return ResultStat.USER_NOT_EXIST.wrap("user is null");
        }
        if (AuthUtil.isAdmin(userId) || user.getId() == userId) {
            if (email != null) {
                user.setEmail(email);
            }
            return modifyUser(user);
        } else {
            return ResultStat.USER_NOT_LEGAL.wrap("");
        }
    }

    @Override
    public HttpResponseTemp<?> modifyUser(User user) {
        if (user == null) {
            return ResultStat.USER_NOT_LEGAL.wrap("user is null");
        }
        user.setUpdateTime(System.currentTimeMillis());
        authBiz.modifyUser(user);
        return ResultStat.OK.wrap("");
    }

    @Override
    public HttpResponseTemp<?> changePassword(ChangeUserPassword changeUserPassword) {
        if (changeUserPassword == null) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("change password fail");
        }
        // modify to newpassword only if oldpassword is matched
        UserPassword userPass = new UserPassword(changeUserPassword.getUsername(), changeUserPassword.getOldpassword());
        userPass.setLoginType(LoginType.USER);
        HttpResponseTemp<?> res = normalLogin(userPass);
        if (res == null) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("change password fail");
        }
        if (res.getResultCode() == ResultStat.OK.responseCode) {
            User user = new User(changeUserPassword.getUsername(), changeUserPassword.getNewpassword());
            CryptoUtil.encryptPassword(user);
            authBiz.changePassword(user);
            Subject subject = SecurityUtils.getSubject();
            subject.logout();
            return ResultStat.OK.wrap("");
        } else {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("change password fail");
        }
    }

    @Override
    public HttpResponseTemp<?> changePasswordByAdmin(int userId, UserPassword userPassword) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.USER_NOT_LEGAL.wrap("must be admin");
        }
        if (userPassword == null) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("userPassword is null");
        }
        User user = new User(userPassword.getUsername(), userPassword.getPassword());
        CryptoUtil.encryptPassword(user);
        authBiz.changePassword(user);
        return ResultStat.OK.wrap("");
    }

    @Override
    public HttpResponseTemp<List<User>> listAllUserInfo() {
        List<User> userInfos = authBiz.listAllUser();
        return ResultStat.OK.wrap(userInfos);
    }

    @Override
    public HttpResponseTemp<?> getUserInfo(String username) {
        if (!verify(username)) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap(null);
        }
        User userInfo = authBiz.getUserByName(username);
        if (userInfo == null) {
            return ResultStat.USER_NOT_EXIST.wrap(null);
        }
        return ResultStat.OK.wrap(userInfo);
    }

    /**
     * Super Admin's role
     * from sys_admin_roles
     * @param username
     * @return
     */
//    private List<String> getRole(String username) {
//        List<String> roles = authBiz.getRole(username);
//        return roles;
//    }

    /**
     * User's role in a project
     * from sys_user_project_roles
     *
     * @param username
     * @return
     */
    private List<String> getProjectRole(String username) {
        List<String> roles = authBiz.getRole(username);
        return roles;
    }

    public Set<String> findRoles(String username) {
        HashSet<String> roles = new HashSet<>();
        roles.addAll(authBiz.getRole(username));

        return roles;
    }

    public Set<String> findPermissions(String username) {
        return null;
    }

    public int getUserId(String username) {
        User user = authBiz.getUserByName(username);
        if (user == null) {
            return -1;
        }
        return user.getId();
    }

    @Override
    public User getUser(String username) {
        return authBiz.getUserByName(username);
    }

    public boolean checkGitlabInfo(int userId, String username) {
        List<GitlabUser> gitlabs = projectBiz.getGitlabInfoByUserId(userId);
        if (gitlabs == null) {
            return false;
        }
        for (GitlabUser gitlab : gitlabs) {
            if (gitlab.getName().equals(username)) {
                return true;
            }
        }
        return false;
    }

    @Async
    public boolean setGitlabInfo(int userId, String userName, String password) {
        GlobalInfo gitConfig = globalBiz.getGlobalInfoByType(GlobalType.GITLAB);
        if (gitConfig != null) {
            GitlabApiWrapper gitlabApiWrapper = new GitlabApiWrapper(gitConfig.getValue(), null);
            try {
                String token = gitlabApiWrapper.getToken(userName, password);
                if (StringUtils.isBlank(token)) {
                    throw new GitlabTokenException("can not get token");
                }
                GitlabUser user = new GitlabUser();
                user.setUserId(userId);
                user.setName(userName);
                user.setToken(token);
                user.setCreateTime(System.currentTimeMillis());
                projectBiz.addGitlabInfo(user);
                return true;
            } catch (Exception e) {
                logger.warn("get user token error, message is " + e.getMessage());
                return false;
            }
        } else {
            return false;
        }
    }
}
