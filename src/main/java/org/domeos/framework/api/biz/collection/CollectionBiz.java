package org.domeos.framework.api.biz.collection;

import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.CollectionInfo;
import org.domeos.framework.api.model.collection.related.ResourceType;

import java.util.List;

/**
 * Created by KaiRen on 2016/9/20.
 */
public interface CollectionBiz {
    String COLLECTION_AUTHORITY_MAP_NAME = "collection_authority_map";
    String COLLECTION_RESOURCE_MAP_NAME = "collection_resource_map";

    void addResource(CollectionResourceMap collectionResourceMap);

    void addAuthority(CollectionAuthorityMap collectionAuthorityMap);

    void deleteResourcesByCollectionIdAndResourceType(int collectionId, ResourceType resourceType);

    void deleteResourceByResourceIdAndResourceType(int resourceId, ResourceType resourceType);

    List<CollectionResourceMap> getResourcesByCollectionIdAndResourceType(int collectionId, ResourceType resourceType);

    int getAuthoritiesCountByUserIdAndResourceType(int userId, ResourceType resourceType);

    CollectionResourceMap getResourceByResourceIdAndResourceType(int resourceId, ResourceType resourceType);

    void updateResourceCreatorByResourceIdAndResourceType(int resourceId, ResourceType resourceType, int creatorId);

    void deleteAuthoritiesByCollectionIdAndResourceType(int collectionId, ResourceType resourceType);

    void deleteAuthorityMap(CollectionAuthorityMap collectionAuthorityMap);

    List<CollectionAuthorityMap> getAuthoritiesByCollectionIdAndResourceType(int collectionId, ResourceType resourceType);

    CollectionAuthorityMap getAuthorityByUserIdAndResourceTypeAndCollectionId(int userId, ResourceType resourceType, int collectionId);

    List<CollectionAuthorityMap> getAuthoritiesByUserIdAndResourceType(int userId, ResourceType resourceType);

    int masterCountInColleciton(int collectionId, ResourceType resourceType);

    List<CollectionAuthorityMap> getAllCollectionByType(ResourceType resourceType);

    int userExistInCollection(CollectionAuthorityMap authorityMap);

    void modifyCollectionAuthorityMap(CollectionAuthorityMap authorityMap);

    void modifyCollectionResourceMap(CollectionResourceMap resourceMap);

    List<CollectionAuthorityMap> getAllUsersInCollection(int collectionId, ResourceType resourceType);

    List<CollectionResourceMap> getResourcesByAuthorityMaps(ResourceType resourceType, List<CollectionAuthorityMap> authorityMaps);

    List<CollectionInfo> getAllCollectionInfo(String tableName);

    List<CollectionInfo> getCollectionInfoByUserId(String tableName, int userId, ResourceType resourceType);

    int getResourcesCountByIdList(ResourceType resourceType, List<Integer> idList);
}
