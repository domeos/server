package org.domeos.api.service.user.impl;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.*;
import org.apache.shiro.subject.Subject;
import org.domeos.api.mapper.project.GitlabMapper;
import org.domeos.api.mapper.user.UserMapper;
import org.domeos.api.model.console.user.UserInfo;
import org.domeos.api.model.git.Gitlab;
import org.domeos.api.model.global.GlobalInfo;
import org.domeos.api.model.global.GlobalType;
import org.domeos.api.model.global.LdapInfo;
import org.domeos.api.model.user.*;
import org.domeos.api.service.global.GlobalService;
import org.domeos.api.service.user.UserService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.GitlabTokenException;
import org.domeos.shiro.AuthUtil;
import org.domeos.shiro.token.MultiAuthenticationToken;
import org.domeos.util.CryptoUtil;
import org.domeos.util.code.GitlabApiWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by zhenfengchen on 15-11-16.
 */
@Service("userService")
public class UserServiceImpl implements UserService{

    protected static Logger logger = Logger.getLogger(UserServiceImpl.class);
    @Autowired
    UserMapper userMapper;
    @Autowired
    GitlabMapper gitlabMapper;
    @Autowired
    GlobalService globalService;

    /**
     * Verify current user has permission to modify user info related to
     * this 'username'
     * @param username user name
     * @return
     */
    private boolean verify(String username) {
        Subject subject = SecurityUtils.getSubject();
        if (subject.hasRole(RoleType.ADMINISTRATOR.roleName)) {
            // if it's ADMINISTRATOR
            return true;
        } else {
            if (username.equals(((String)subject.getPrincipal()))) {
                // normal user can only modify own info
                return true;
            }
        }
        return false;
    }

    public HttpResponseTemp<?> normalLogin(UserPassword userPass) {
        Subject subject = SecurityUtils.getSubject();
        String ldapEmailSuffix = null;
        if (userPass.getLoginType() != null && userPass.getLoginType().equals(UserLoginType.LDAP)) {
            LdapInfo ldapInfo = globalService.getLdapInfo();
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

        if (userPass.getLoginType() != null && userPass.getLoginType().equals(UserLoginType.LDAP)) {
            User user = new User();
            user.setUsername(userPass.getUsername());
            user.setLogin_type(UserLoginType.LDAP.name());
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

    public HttpResponseTemp<?> createUser(long userId, User user, boolean flag) {
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

        if (userMapper.getUserInfoByName(user.getUsername()) != null) {
            return ResultStat.USER_EXISTED.wrap(null);
        }

        CryptoUtil.encryptPassword(user);
        user.setCreate_time(new Date());

        userMapper.addUser(user);
        return ResultStat.OK.wrap(null);
    }

    public boolean createUserForLDAP(User user) {
        if (user == null) {
            return false;
        }
        User existUser = userMapper.getUserByName(user.getUsername());
        if (existUser == null) {
            user.setCreate_time(new Date());
            user.setStatus(UserStatusType.NORMAL.name());
            user.setPassword("NULL");
            userMapper.addUser(user);
            return true;
        } else {
            existUser.setUpdate_time(new Date());
            userMapper.modifyUser(existUser);
            user.setId(existUser.getId());
            return false;
        }
    }

    public HttpResponseTemp<?> createUser(long userId, User user) {
        return createUser(userId, user, true);
    }

    public HttpResponseTemp<?> deleteUser(long userId, String username) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.USER_NOT_LEGAL.wrap("must be admin");
        }
        User user = userMapper.getUserByName(username);
        if (user == null) {
            return ResultStat.USER_NOT_EXIST.wrap(null);
        }
        user.setUpdate_time(new Date());
        user.setStatus(UserStatusType.DELETED.name());
        userMapper.deleteUser(user);
        return ResultStat.OK.wrap("");
    }

    public HttpResponseTemp<?> modifyUser(long userId, String username, String email) {
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

    public HttpResponseTemp<?> modifyUser(User user) {
        if (user == null) {
            return ResultStat.USER_NOT_LEGAL.wrap("user is null");
        }
        user.setUpdate_time(new Date());
        userMapper.modifyUser(user);
        return ResultStat.OK.wrap("");
    }

    public HttpResponseTemp<?> changePassword(ChangeUserPassword changeUserPassword) {
        if (changeUserPassword == null) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("change password fail");
        }
        // modify to newpassword only if oldpassword is matched
        UserPassword userPass = new UserPassword(changeUserPassword.getUsername(), changeUserPassword.getOldpassword());
        userPass.setLoginType(UserLoginType.USER);
        HttpResponseTemp<?> res = normalLogin(userPass);
        if (res == null) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("change password fail");
        }
        if (res.getResultCode() == ResultStat.OK.responseCode) {
            User user = new User(changeUserPassword.getUsername(), changeUserPassword.getNewpassword());
            CryptoUtil.encryptPassword(user);
            userMapper.changePassword(user);
            Subject subject = SecurityUtils.getSubject();
            subject.logout();
            return ResultStat.OK.wrap("");
        } else {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("change password fail");
        }
    }

    public HttpResponseTemp<?> changePasswordByAdmin(long userId, UserPassword userPassword) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.USER_NOT_LEGAL.wrap("must be admin");
        }
        if (userPassword == null) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap("userPassword is null");
        }
        User user = new User(userPassword.getUsername(), userPassword.getPassword());
        CryptoUtil.encryptPassword(user);
        userMapper.changePassword(user);
        return ResultStat.OK.wrap("");
    }

    public HttpResponseTemp<List<UserInfo>> listAllUserInfo() {
        List<UserInfo> userInfos = userMapper.listAllUserInfo();
        return ResultStat.OK.wrap(userInfos);
    }

    public HttpResponseTemp<?> getUserInfo(String username) {
        if (!verify(username)) {
            return ResultStat.USER_NOT_AUTHORIZED.wrap(null);
        }
        UserInfo userInfo = userMapper.getUserInfoByName(username);
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
    private List<String> getRole(String username) {
        List<String> roles = userMapper.getRole(username);
        return roles;
    }

    /**
     * User's role in a project
     * from sys_user_project_roles
     * @param username
     * @return
     */
    private List<String> getProjectRole(String username) {
        List<String> roles = userMapper.getRole(username);
        return roles;
    }

    public Set<String> findRoles(String username) {
        HashSet<String> roles = new HashSet<String>();
        roles.addAll(getProjectRole(username));

        return roles;
    }

    public Set<String> findPermissions(String username) {
        return null;
    }

    public long getUserId(String username) {
        User user = userMapper.getUserByName(username);
        if (user == null) {
            return -1;
        }
        return user.getId();
    }

    public User getUser(String username) {
        User user = userMapper.getUserByName(username);
        return user;
    }

    public boolean checkGitlabInfo(Long userId, String username) {
        List<Gitlab> gitlabs = gitlabMapper.getGitlabInfoByUserId(userId.intValue());
        if (gitlabs == null) {
            return false;
        }
        for (Gitlab gitlab : gitlabs) {
            if (gitlab.getName().equals(username)) {
                return true;
            }
        }
        return false;
    }

    @Async
    public boolean setGitlabInfo(Long userId, String userName, String password) {
        GlobalInfo gitConfig = globalService.getGlobalInfoByType(GlobalType.GITLAB);
        if (gitConfig != null) {
            GitlabApiWrapper gitlabApiWrapper = new GitlabApiWrapper(gitConfig.getValue(), null);
            try {
                String token = gitlabApiWrapper.getToken(userName, password);
                if (StringUtils.isBlank(token)) {
                    throw new GitlabTokenException("can not get token");
                }
                gitlabMapper.addGitlabInfo(new Gitlab(userId.intValue(), userName, token, System.currentTimeMillis()));
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
