package org.domeos.framework.api.model.resource;

import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class Resource {
    private int id;
    private int resourceId;
    private ResourceType resourceType;
    private int ownerId;
    private ResourceOwnerType ownerType;
    private Role role;
    private long updateTime;

    public Resource() {

    }

    public Resource(int resourceId, ResourceType resourceType) {
        this.resourceId = resourceId;
        this.resourceType = resourceType;
    }

    public Resource(int resourceId, ResourceType resourceType, int ownerId, ResourceOwnerType ownerType, Role role, long updateTime) {
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        this.ownerId = ownerId;
        this.ownerType = ownerType;
        this.role = role;
        this.updateTime = updateTime;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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

    public int getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(int ownerId) {
        this.ownerId = ownerId;
    }

    public ResourceOwnerType getOwnerType() {
        return ownerType;
    }

    public void setOwnerType(ResourceOwnerType ownerType) {
        this.ownerType = ownerType;
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
