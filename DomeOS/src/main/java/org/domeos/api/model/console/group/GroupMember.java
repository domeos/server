package org.domeos.api.model.console.group;

import org.domeos.api.model.group.UserGroup;

/**
 * Created by zhenfengchen on 15-12-24.
 *
 */
public class GroupMember {
    private Long group_id;
    private Long user_id;
    private String role;
    private String user_name;

    public GroupMember() {

    }
    public GroupMember(UserGroup userGroup) {
        this.group_id = userGroup.getGroup_id();
        this.user_id = userGroup.getUser_id();
        this.role = userGroup.getRole();
    }

    public Long getGroup_id() {
        return group_id;
    }

    public void setGroup_id(Long group_id) {
        this.group_id = group_id;
    }

    public Long getUser_id() {
        return user_id;
    }

    public void setUser_id(Long user_id) {
        this.user_id = user_id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUser_name() {
        return user_name;
    }

    public void setUser_name(String user_name) {
        this.user_name = user_name;
    }
}
