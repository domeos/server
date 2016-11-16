package org.domeos.framework.api.model.collection;

import org.domeos.framework.api.model.collection.related.ResourceType;

/**
 * Created by KaiRen on 2016/9/20.
 */
public class CollectionResourceMap {
    private int id;
    private int resourceId;
    private int creatorId;
    private ResourceType resourceType;
    private int collectionId;
    private long updateTime;

    public CollectionResourceMap() {
    }

    public CollectionResourceMap(int resourceId, int creatorId, ResourceType resourceType, int collectionId, long updateTime) {
        this.resourceId = resourceId;
        this.creatorId = creatorId;
        this.resourceType = resourceType;
        this.collectionId = collectionId;
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

    public int getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(int creatorId) {
        this.creatorId = creatorId;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public int getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(int collectionId) {
        this.collectionId = collectionId;
    }

    public long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }
}
