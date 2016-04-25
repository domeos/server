package org.domeos.framework.api.model.resource.related;


import org.domeos.framework.api.model.auth.related.Role;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ResourceGroupInfo {
    private int groupid;
    private ResourceOwnerType ownertype;
    private Role role;
    private long updatetime;
    private List<ResourceUserInfo> userInfos;

    public ResourceGroupInfo() {
    }

    public ResourceGroupInfo(int groupid, ResourceOwnerType ownertype, Role role, long updatetime) {
        this.groupid = groupid;
        this.ownertype = ownertype;
        this.role = role;
        this.updatetime = updatetime;
    }

    public int getGroupid() {
        return groupid;
    }

    public void setGroupid(int groupid) {
        this.groupid = groupid;
    }

    public ResourceOwnerType getOwnertype() {
        return ownertype;
    }

    public void setOwnertype(ResourceOwnerType ownertype) {
        this.ownertype = ownertype;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public long getUpdatetime() {
        return updatetime;
    }

    public void setUpdatetime(long updatetime) {
        this.updatetime = updatetime;
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
