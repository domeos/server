package org.domeos.framework.api.model.collection;

import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.related.ResourceType;

/**
 * Created by KaiRen on 2016/9/20.
 */
public class CollectionAuthorityMap {
    private int id;
    private int collectionId;
    private ResourceType resourceType;
    private int userId;
    private Role role;
    private long updateTime;

    public CollectionAuthorityMap() {
    }

    public CollectionAuthorityMap(int collectionId, ResourceType resourceType, int userId, Role role, long updateTime) {
        this.collectionId = collectionId;
        this.resourceType = resourceType;
        this.userId = userId;
        this.role = role;
        this.updateTime = updateTime;
    }

    public String checkLegality() {
        if (role == null) {
            return "role must be set";
        }
        return null;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(int collectionId) {
        this.collectionId = collectionId;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
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
