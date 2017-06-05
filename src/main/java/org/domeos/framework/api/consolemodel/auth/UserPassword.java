package org.domeos.framework.api.consolemodel.auth;

import org.domeos.framework.api.model.auth.related.LoginType;

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
    private LoginType loginType;

    public UserPassword() {

    }

    public UserPassword(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public UserPassword(String username, String password, LoginType loginType) {
        this.username = username;
        this.password = password;
        this.loginType = loginType;
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

    public LoginType getLoginType() {
        return loginType;
    }

    public void setLoginType(LoginType loginType) {
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
