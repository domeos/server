package org.domeos.framework.api.model.resource.related;

import org.apache.commons.lang3.StringUtils;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/6.
 */
public class ResourceInfo {
    private int resourceId;
    private ResourceType resourceType;
    private List<OwnerInfo> ownerInfos;
    private long updateTime;

    public ResourceInfo() {
    }

    public ResourceInfo(int resourceId, ResourceType resourceType) {
        this.resourceId = resourceId;
        this.resourceType = resourceType;
    }

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

    public List<OwnerInfo> getOwnerInfos() {
        return ownerInfos;
    }

    public void setOwnerInfos(List<OwnerInfo> ownerInfos) {
        this.ownerInfos = ownerInfos;
    }

    public long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }

    public String checkLegality() {
        if (resourceType == null) {
            return "resource type must be set";
        }
        if (ownerInfos == null) {
            return "owner info must be set";
        }
        for (OwnerInfo ownerInfo : ownerInfos) {
            if (!StringUtils.isBlank(ownerInfo.checkLegality())) {
                return ownerInfo.checkLegality();
            }
        }
        updateTime = System.currentTimeMillis();
        return null;
    }
}
