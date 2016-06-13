package org.domeos.framework.api.model.alarm;

import org.domeos.framework.api.model.auth.related.Role;

/**
 * Created by baokangwang on 2016/4/18.
 */
public class AlarmGroupMember {

    private int userId;
    private Role role;
    private String username;

    public AlarmGroupMember() {
    }

    public AlarmGroupMember(int userId, Role role, String username) {
        this.userId = userId;
        this.role = role;
        this.username = username;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
