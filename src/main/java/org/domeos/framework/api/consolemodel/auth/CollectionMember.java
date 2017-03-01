package org.domeos.framework.api.consolemodel.auth;

import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.related.ResourceType;

/**
 * Created by KaiRen on 2016/9/22.
 */
public class CollectionMember {
    private int collectionId;
    private int userId;
    private Role role;
    private String username;
    private ResourceType resourceType;

    public CollectionMember() {
    }

    public CollectionMember(CollectionAuthorityMap authorityMap) {
        this.collectionId = authorityMap.getCollectionId();
        this.userId = authorityMap.getUserId();
        this.role = authorityMap.getRole();
        this.resourceType = authorityMap.getResourceType();
    }

    public int getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(int collectionId) {
        this.collectionId = collectionId;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }
}
