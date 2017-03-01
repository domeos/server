package org.domeos.framework.api.model.auth;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class AdminRole {
    int userId;
    String role;

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
