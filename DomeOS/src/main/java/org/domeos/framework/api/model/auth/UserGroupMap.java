package org.domeos.framework.api.model.auth;

import org.domeos.framework.api.model.auth.related.Role;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class UserGroupMap {
    private int id;
    private int groupId;
    private int userId;
    private Role role;
    private long updateTime;

    public UserGroupMap() {
    }

    public UserGroupMap(int userId, int groupId, long updateTime) {
        this.userId = userId;
        this.groupId = groupId;
        this.updateTime = updateTime;
    }

    public String checkLegality() {
        if (role == null) {
            return "role must be set";
        }
        return null;
    }

    @Override
    public String toString() {
        return "UserGroup{" +
                "userId='" + userId + '\'' +
                ", groupId='" + groupId + '\'' +
                ", role='" + role + '\'' +
                '}';
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }
}
