package org.domeos.framework.api.model.resource.related;

import org.domeos.framework.api.model.auth.related.Role;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ResourceOwnerInfo {
    int resourceId;
    ResourceType resourceType;
    String resourceName;
    String clusterName;
    String namespace;
    List<ResourceUserInfo> userInfos;
    ResourceGroupInfo groupInfo;

    public int getResourceId() {
        return resourceId;
    }

    public void setResourceId(int resourceId) {
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

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
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
                if (tmp.getOwnerType() == ResourceOwnerType.USER && tmp.getUserId() == userInfo.getUserId()) {
                    tmp.setRole(Role.getMaxRoleType(tmp.getRole(), userInfo.getRole()));
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
