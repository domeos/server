package org.domeos.api.service.user;

import org.domeos.api.model.console.user.UserInfo;
import org.domeos.api.model.user.ChangeUserPassword;
import org.domeos.api.model.user.User;
import org.domeos.api.model.user.UserPassword;
import org.domeos.basemodel.HttpResponseTemp;

import java.util.List;
import java.util.Set;

/**
 * Created by zhenfengchen on 15-11-16.
 */
public interface UserService {
    /**
     * login with username and password for a register user
     * @param userPassword
     * @return
     */
    HttpResponseTemp<?> normalLogin(UserPassword userPassword);

    /**
     * Add a user in database, when initialize the database, we need to create Admin without authorization
     * @param user user
     * @param flag true means need to be authorized
     * @return
     */
    HttpResponseTemp<?> createUser(long userId, User user, boolean flag);
    HttpResponseTemp<?> createUser(long userId, User user);
    HttpResponseTemp<?> deleteUser(long userId, String username);
    HttpResponseTemp<?> modifyUser(long userId, String username, String email);
    HttpResponseTemp<?> modifyUser(User user);

    /**
     * A normal user use this to change password
     * @param changeUserPassword contains username,oldpassword,newpassword
     * @return ResultStat.OK if modify success
     */
    HttpResponseTemp<?> changePassword(ChangeUserPassword changeUserPassword);
    /**
     * The Admin use this to change password of a specified user
     * @param userPassword contains username, newpassword
     * @return
     */
    HttpResponseTemp<?> changePasswordByAdmin(long userId, UserPassword userPassword);

    HttpResponseTemp<List<UserInfo>> listAllUserInfo();

    HttpResponseTemp<?> getUserInfo(String username);

    /**
     * Find roles owned by this user
     * @param username username
     * @return roles the user has
     */
    Set<String> findRoles(String username);
    /**
     * Find permissions owned by this user
     * @param username username
     * @return permissions the user has
     */
    Set<String> findPermissions(String username);
    long getUserId(String username);

    /**
     * Save User's info in database if the user login through LDAP
     * @param user
     * @return true if first login through LDAP
     */
    boolean createUserForLDAP(User user);
    User getUser(String username);
}
