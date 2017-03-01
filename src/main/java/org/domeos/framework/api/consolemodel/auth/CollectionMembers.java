package org.domeos.framework.api.consolemodel.auth;

import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.util.StringUtils;

import java.util.List;

/**
 * Created by KaiRen on 2016/9/22.
 */
public class CollectionMembers {
    private List<CollectionAuthorityMap> members = null;
    private ResourceType resourceType;
    private int collectionId;

    public String checkLegality() {
        if (members == null) {
            return "members info must be set";
        } else if (resourceType == null) {
            return "resource type must be set";
        }
        for (CollectionAuthorityMap authorityMap : members) {
            String tmp = authorityMap.checkLegality();
            if (!StringUtils.isBlank(tmp)) {
                return tmp;
            }
        }
        return null;
    }

    public CollectionMembers() {
    }

    public List<CollectionAuthorityMap> getMembers() {
        return members;
    }

    public void setMembers(List<CollectionAuthorityMap> members) {
        this.members = members;
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
}
