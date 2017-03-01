package org.domeos.framework.api.consolemodel.auth;

/**
 * Created by zhenfengchen on 15-11-17.
 * use this to change password
 */
public class ChangeUserPassword {
    private String username;
    private String oldpassword;
    private String newpassword;

    public ChangeUserPassword() {

    }

    public ChangeUserPassword(String username, String oldpassword, String newpassword) {
        this.username = username;
        this.oldpassword = oldpassword;
        this.newpassword = newpassword;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNewpassword() {
        return newpassword;
    }

    public void setNewpassword(String newpassword) {
        this.newpassword = newpassword;
    }

    public String getOldpassword() {
        return oldpassword;
    }

    public void setOldpassword(String oldpassword) {
        this.oldpassword = oldpassword;
    }

    @Override
    public String toString() {
        return "UserPassword{" +
                "username='" + username + '\'' +
                ", oldpassword='" + oldpassword + '\'' +
                ", newpassword='" + newpassword + '\'' +
                '}';
    }
}
