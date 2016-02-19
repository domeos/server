package org.domeos.api.model.user;

/**
 * Created by zhenfengchen on 15-11-16.
 * User use this info to login or change a user's password by admin
 */
public class UserPassword {
    private String username;
    private String password;
    /**
     * to distiguish different type of login, such as LDAP or USER
     */
    private UserLoginType loginType;

    public UserPassword() {

    }
    public UserPassword(String username, String password) {
        this.username = username;
        this.password = password;
    }
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserLoginType getLoginType() {
        return loginType;
    }

    public void setLoginType(UserLoginType loginType) {
        this.loginType = loginType;
    }

    @Override
    public String toString() {
        return "UserPassword{" +
            "username='" + username + '\'' +
            ", loginType='" + loginType + '\'' +
            '}';
    }
}
