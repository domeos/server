package org.domeos.framework.api.consolemodel.auth;

import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.auth.related.Role;

/**
 * Created by zhenfengchen on 15-12-24.
 */
public class GroupMember {
    private int groupId;
    private int userId;
    private Role role;
    private String username;

    public GroupMember() {

    }

    public GroupMember(UserGroupMap userGroup) {
        this.groupId = userGroup.getGroupId();
        this.userId = userGroup.getUserId();
        this.role = userGroup.getRole();
    }

    public int getGroupId() {
        return groupId;
    }

    public void setGroupId(int groupId) {
        this.groupId = groupId;
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
