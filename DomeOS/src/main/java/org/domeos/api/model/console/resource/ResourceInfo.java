package org.domeos.api.model.console.resource;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.resource.ResourceType;

import java.util.Date;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ResourceInfo {
    private long resource_id;
    private ResourceType resource_type;
    private List<OwnerInfo> ownerInfos;
    private Date update_time;

    public ResourceInfo() {
    }

    public ResourceInfo(long resource_id, ResourceType resource_type) {
        this.resource_id = resource_id;
        this.resource_type = resource_type;
    }

    public Date getUpdate_time() {
        return update_time;
    }

    public void setUpdate_time(Date update_time) {
        this.update_time = update_time;
    }

    public long getResource_id() {
        return resource_id;
    }

    public void setResource_id(long resource_id) {
        this.resource_id = resource_id;
    }

    public ResourceType getResource_type() {
        return resource_type;
    }

    public void setResource_type(ResourceType resource_type) {
        this.resource_type = resource_type;
    }

    public List<OwnerInfo> getOwnerInfos() {
        return ownerInfos;
    }

    public void setOwnerInfos(List<OwnerInfo> ownerInfos) {
        this.ownerInfos = ownerInfos;
    }

    public String checkLegality() {
        if (resource_type == null) {
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
        update_time = new Date();
        return null;
    }
}
