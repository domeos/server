package org.domeos.framework.api.service.auth.impl;

import org.domeos.framework.api.model.auth.related.UserInfo;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.domeos.framework.api.controller.exception.ApiException;
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
import org.domeos.global.CurrentThreadInfo;
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
@Service
public class UserServiceImpl implements UserService {

    protected static Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
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
            throw ApiException.wrapMessage(ResultStat.USER_NOT_AUTHORIZED, "username wrong");
        } catch (IncorrectCredentialsException e) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_AUTHORIZED, "password wrong");
        } catch (ExcessiveAttemptsException e) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_AUTHORIZED, "login wrong too many times");
        } catch (AuthenticationException e) {
            throw ApiException.wrapUnknownException(e);
        }

        if (userPass.getLoginType() != null && userPass.getLoginType().equals(LoginType.LDAP)) {
            User user = new User();
            user.setUsername(userPass.getUsername());
            user.setLoginType(LoginType.LDAP);
            createUserForLDAP(user);
            logger.info("ldap login success, user=" + userPass.getUsername());
        } else {
            logger.info("jdbc login success, user=" + userPass.getUsername());
        }
        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> createUser(User user, boolean flag) {
        int userId = CurrentThreadInfo.getUserId();
        if (flag) {
            if (!AuthUtil.isAdmin(userId)) {
                throw ApiException.wrapMessage(ResultStat.USER_NOT_LEGAL, "must be admin");
            }
        }
        if (user == null) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_LEGAL, "user info is null");
        }

        if (!StringUtils.isBlank(user.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_LEGAL, user.checkLegality());
        }

        if (authBiz.getUserByName(user.getUsername()) != null) {
            throw ApiException.wrapResultStat(ResultStat.USER_EXISTED);
        }

        CryptoUtil.encryptPassword(user);
        user.setCreateTime(System.currentTimeMillis());

        authBiz.addUser(user);
        return ResultStat.OK.wrap(user);
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
            LdapInfo ldapInfo = globalBiz.getLdapInfo();
            if (ldapInfo != null) {
                String ldapEmailSuffix = ldapInfo.getEmailSuffix();
                if (!StringUtils.isBlank(ldapEmailSuffix)) {
                    user.setEmail(user.getUsername());
                }
            }
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
    public HttpResponseTemp<?> createUser(User user) {
        return createUser(user, true);
    }

    @Override
    public HttpResponseTemp<?> deleteUser(int id) {
        int userId = CurrentThreadInfo.getUserId();
        if (!AuthUtil.isAdmin(userId)) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_LEGAL, "must be admin");
        }
        User user = authBiz.getUserById(id);
        if (user == null) {
            throw ApiException.wrapResultStat(ResultStat.USER_NOT_EXIST);
        }
        user.setUpdateTime(System.currentTimeMillis());
        user.setState(UserState.DELETED);
        authBiz.deleteUser(user);
        return ResultStat.OK.wrap("");
    }

    @Override
    public HttpResponseTemp<?> modifyUser(User user) {
        int userId = CurrentThreadInfo.getUserId();
        if (user == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "user is blank");
        }
        User currentUser = authBiz.getUserById(user.getId());
        if (currentUser == null) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_EXIST, "user not exists");
        }
        if (AuthUtil.isAdmin(userId) || user.getId() == userId) {
            if (user.getEmail() != null) {
                currentUser.setEmail(user.getEmail());
            }
            if (user.getPhone() != null) {
                currentUser.setPhone(user.getPhone());
            }
            currentUser.setUpdateTime(System.currentTimeMillis());
            authBiz.modifyUser(currentUser);
            return ResultStat.OK.wrap(null);
        } else {
            throw ApiException.wrapResultStat(ResultStat.USER_NOT_LEGAL);
        }
    }

    @Override
    public HttpResponseTemp<?> changePassword(ChangeUserPassword changeUserPassword) {
        if (changeUserPassword == null) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_AUTHORIZED, "change password fail");
        }
        // modify to newpassword only if oldpassword is matched
        UserPassword userPass = new UserPassword(changeUserPassword.getUsername(), changeUserPassword.getOldpassword());
        userPass.setLoginType(LoginType.USER);
        HttpResponseTemp<?> res = normalLogin(userPass);
        if (res == null) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_AUTHORIZED, "change password fail");
        }
        if (res.getResultCode() == ResultStat.OK.responseCode) {
            User user = new User(changeUserPassword.getUsername(), changeUserPassword.getNewpassword());
            CryptoUtil.encryptPassword(user);
            authBiz.changePassword(user);
            Subject subject = SecurityUtils.getSubject();
            subject.logout();
            return ResultStat.OK.wrap("");
        } else {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_AUTHORIZED, "change password fail");
        }
    }

    @Override
    public HttpResponseTemp<?> changePasswordByAdmin(UserPassword userPassword) {
        int userId = CurrentThreadInfo.getUserId();
        if (!AuthUtil.isAdmin(userId)) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_LEGAL, "must be admin");
        }
        if (userPassword == null) {
            throw ApiException.wrapMessage(ResultStat.USER_NOT_AUTHORIZED, "userPassword is null");
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
            throw ApiException.wrapResultStat(ResultStat.USER_NOT_AUTHORIZED);
        }
        User userInfo = authBiz.getUserByName(username);
        if (userInfo == null) {
            throw ApiException.wrapResultStat(ResultStat.USER_NOT_EXIST);
        }
        return ResultStat.OK.wrap(new UserInfo(userInfo, AuthUtil.isAdmin(userInfo.getId())));
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
    public void setGitlabInfo(int userId, String userName, String password) {
        List<GlobalInfo> gitConfigs = globalBiz.listGlobalInfoByType(GlobalType.GITLAB);
        if (gitConfigs != null) {
            for (GlobalInfo gitConf : gitConfigs) {
                setGitlabInfo(gitConf, userId, userName, password);
            }
        }
    }

    @Async
    public void setGitlabInfo(GlobalInfo gitConfig, int userId, String userName, String password) {
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
        } catch (Exception e) {
            logger.warn("get user token error, message is " + e.getMessage());
        }
    }

    @Override
    public boolean loginWithoutType(String userName, String password) {
        if (loginWithType(new UserPassword(userName, password, LoginType.LDAP)) ||
                loginWithType(new UserPassword(userName, password, LoginType.USER))) {
            User user = AuthUtil.getUser();
            CurrentThreadInfo.setUser(user);
            return true;
        }

        return false;
    }

    private boolean loginWithType(UserPassword userPass) {
        Subject subject = SecurityUtils.getSubject();
        if (userPass.getLoginType() != null && userPass.getLoginType().equals(LoginType.LDAP)) {
            LdapInfo ldapInfo = globalBiz.getLdapInfo();
            if (ldapInfo == null) {
                return false;
            }
            String ldapEmailSuffix = ldapInfo.getEmailSuffix();
            String userName = userPass.getUsername();
            if (ldapEmailSuffix != null && !userName.endsWith(ldapEmailSuffix)) {
                userPass.setUsername(userName + ldapEmailSuffix);
            }
        }
        UsernamePasswordToken token = new MultiAuthenticationToken(userPass.getUsername(), userPass.getPassword(), userPass.getLoginType());
        try {
            subject.login(token);
        } catch (Exception e) {
            return false;
        }
        return true;
    }
}
