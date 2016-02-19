package org.domeos.api.model.console.resource;

import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.util.RoleUtil;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ResourceOwnerInfo {
    long resourceId;
    ResourceType resourceType;
    String resourceName;
    List<ResourceUserInfo> userInfos;
    ResourceGroupInfo groupInfo;

    public long getResourceId() {
        return resourceId;
    }

    public void setResourceId(long resourceId) {
        this.resourceId = resourceId;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public List<ResourceUserInfo> getUserInfos() {
        return userInfos;
    }

    public void setUserInfos(List<ResourceUserInfo> userInfos) {
        this.userInfos = userInfos;
    }

    public void addUserInfo(ResourceUserInfo userInfo) {
        if (userInfo == null) {
            return;
        }
        if (userInfos == null) {
            userInfos = new LinkedList<>();
        }
        boolean contain = false;
        if (userInfos.size() > 0) {
            for (ResourceUserInfo tmp : userInfos) {
                if (tmp.getOwner_type() == ResourceOwnerType.USER && tmp.getUser_id() == userInfo.getUser_id()) {
                    tmp.setRole(RoleUtil.getMaxRoleType(RoleUtil.getRoleType(tmp.getRole()), RoleUtil.getRoleType(userInfo.getRole())).getRoleName());
                    contain = true;
                    break;
                }
            }
        }
        if (!contain) {
            userInfos.add(userInfo);
        }
    }

    public ResourceGroupInfo getGroupInfo() {
        return groupInfo;
    }

    public void setGroupInfo(ResourceGroupInfo groupInfo) {
        this.groupInfo = groupInfo;
    }
}
