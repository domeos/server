package org.domeos.api.model.console.resource;

import org.domeos.api.model.user.ResourceOwnerType;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ResourceGroupInfo {
    private long group_id;
    private ResourceOwnerType owner_type;
    private String role;
    private long update_time;
    private List<ResourceUserInfo> userInfos;

    public ResourceGroupInfo() {
    }

    public ResourceGroupInfo(long group_id, ResourceOwnerType owner_type, String role, long update_time) {
        this.group_id = group_id;
        this.owner_type = owner_type;
        this.role = role;
        this.update_time = update_time;
    }

    public long getGroup_id() {
        return group_id;
    }

    public void setGroup_id(long group_id) {
        this.group_id = group_id;
    }

    public ResourceOwnerType getOwner_type() {
        return owner_type;
    }

    public void setOwner_type(ResourceOwnerType owner_type) {
        this.owner_type = owner_type;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getUpdate_time() {
        return update_time;
    }

    public void setUpdate_time(long update_time) {
        this.update_time = update_time;
    }

    public List<ResourceUserInfo> getUserInfos() {
        return userInfos;
    }

    public void setUserInfos(List<ResourceUserInfo> userInfos) {
        this.userInfos = userInfos;
    }

    public void addUserInfo(ResourceUserInfo userInfo) {
        if (userInfos == null) {
            userInfos = new LinkedList<>();
        }
        if (userInfo != null) {
            userInfos.add(userInfo);
        }
    }
}
