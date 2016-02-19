package org.domeos.api.model.group;

import org.apache.commons.lang3.StringUtils;
import org.domeos.util.DateUtil;

import java.util.Date;

/**
 * Created by zhenfengchen on 15-11-20.
 */
public class UserGroup {
    private Long group_id;
    private Long user_id;
    private String role;
    private Date update_time;

    public UserGroup() {

    }

    public UserGroup(Long user_id, Long group_id) {
        this.user_id = user_id;
        this.group_id = group_id;
        this.update_time = new Date();
    }

    public String checkLegality() {
        if (StringUtils.isBlank(role)) {
            return "role must be set";
        }
        return null;
    }

    @Override
    public String toString() {
        return "UserGroup{" +
            "user_id='" + user_id + '\'' +
            ", group_id='" + group_id + '\'' +
            ", role='" + role + '\'' +
            '}';
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

    public String getUpdate_time() {
        return DateUtil.getDatetime(update_time);
    }

    public void setUpdate_time(Date update_time) {
        this.update_time = update_time;
    }
}
