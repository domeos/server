package org.domeos.framework.api.consolemodel.auth;

import org.domeos.framework.api.model.collection.related.ResourceType;

/**
 * Created by KaiRen on 2016/9/22.
 */
public class CollectionSpace {
    private String collectionName;
    private String collectionId;
    private ResourceType resourceType;

    public CollectionSpace(String collectionName, String collectionId, ResourceType resourceType) {
        this.collectionName = collectionName;
        this.collectionId = collectionId;
        this.resourceType = resourceType;
    }

    public CollectionSpace() {
    }

    public String getCollectionName() {
        return collectionName;
    }

    public void setCollectionName(String collectionName) {
        this.collectionName = collectionName;
    }

    public String getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(String collectionId) {
        this.collectionId = collectionId;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }
}
