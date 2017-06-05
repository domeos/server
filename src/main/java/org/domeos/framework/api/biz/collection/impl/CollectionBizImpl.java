package org.domeos.framework.api.biz.collection.impl;

import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.mapper.domeos.collection.CollectionAuthorityMapMapper;
import org.domeos.framework.api.mapper.domeos.collection.CollectionResourceMapMapper;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.CollectionInfo;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by KaiRen on 2016/9/20.
 */
@Service("collectionBiz")
public class CollectionBizImpl implements CollectionBiz {

    @Autowired
    CollectionAuthorityMapMapper collectionAuthorityMapMapper;

    @Autowired
    CollectionResourceMapMapper collectionResourceMapMapper;


    @Override
    public void addResource(CollectionResourceMap collectionResourceMap) {
        collectionResourceMap.setUpdateTime(System.currentTimeMillis());
        collectionResourceMapMapper.insertCollectionResourceMap(collectionResourceMap);
    }

    @Override
    public void addAuthority(CollectionAuthorityMap collectionAuthorityMap) {
        collectionAuthorityMap.setUpdateTime(System.currentTimeMillis());
        collectionAuthorityMapMapper.insertCollectionAuthorityMap(collectionAuthorityMap);
    }

    @Override
    public void deleteResourcesByCollectionIdAndResourceType(int collectionId, ResourceType resourceType) {
        collectionResourceMapMapper.deleteResourceMapsByCollectionIdAndResourceType(collectionId, resourceType);
    }

    @Override
    public void deleteResourceByResourceIdAndResourceType(int resourceId, ResourceType resourceType) {
        collectionResourceMapMapper.deleteResourceMapByResourceIdAndResourceType(resourceId, resourceType);
    }

    @Override
    public List<CollectionResourceMap> getResourcesByCollectionIdAndResourceType(int collectionId, ResourceType resourceType) {
        return collectionResourceMapMapper.getResourceMapsByCollectionIdAndResourceType(collectionId, resourceType);
    }

    @Override
    public CollectionResourceMap getResourceByResourceIdAndResourceType(int resourceId, ResourceType resourceType) {
        return collectionResourceMapMapper.getResourceMapByResourceIdAndResourceType(resourceId, resourceType);
    }

    @Override
    public void updateResourceCreatorByResourceIdAndResourceType(int resourceId, ResourceType resourceType, int creatorId) {
        collectionResourceMapMapper.updateResourceCreatorByResourceIdAndResourceType(resourceId, resourceType, creatorId);
    }

    @Override
    public void deleteAuthoritiesByCollectionIdAndResourceType(int collectionId, ResourceType resourceType) {
        collectionAuthorityMapMapper.deleteAuthorityMapsByCollectionIdAndResourceType(collectionId, resourceType);
    }

    @Override
    public void deleteAuthorityMap(CollectionAuthorityMap collectionAuthorityMap) {
        collectionAuthorityMapMapper.deleteAuthorityMap(collectionAuthorityMap);
    }

    @Override
    public List<CollectionAuthorityMap> getAuthoritiesByCollectionIdAndResourceType(int collectionId, ResourceType resourceType) {
        return collectionAuthorityMapMapper.getAuthorityMapsByCollectionIdAndResourceType(collectionId, resourceType);
    }

    @Override
    public int getAuthoritiesCountByUserIdAndResourceType(int userId, ResourceType resourceType) {
        return collectionAuthorityMapMapper.getAuthoritiesCountByUserIdAndResourceType(userId, resourceType);
    }

    @Override
    public CollectionAuthorityMap getAuthorityByUserIdAndResourceTypeAndCollectionId(int userId, ResourceType resourceType, int collectionId) {
        return collectionAuthorityMapMapper.getAuthorityMapByUserIdAndResourceTypeAndCollectionId(userId, resourceType, collectionId);
    }

    @Override
    public List<CollectionAuthorityMap> getAuthoritiesByUserIdAndResourceType(int userId, ResourceType resourceType) {
        return collectionAuthorityMapMapper.getAuthoritiesByUserIdAndResourceType(userId, resourceType);
    }

    @Override
    public int masterCountInColleciton(int collectionId, ResourceType resourceType) {
        return collectionAuthorityMapMapper.masterCountInCollection(collectionId, resourceType);
    }

    @Override
    public List<CollectionAuthorityMap> getAllCollectionByType(ResourceType resourceType) {
        return collectionAuthorityMapMapper.getAllCollectionsByType(resourceType);
    }

    @Override
    public int userExistInCollection(CollectionAuthorityMap authorityMap) {
        return collectionAuthorityMapMapper.userExistInCollection(authorityMap);
    }

    @Override
    public void modifyCollectionAuthorityMap(CollectionAuthorityMap authorityMap) {
        collectionAuthorityMapMapper.modifyCollectionAuthorityMap(authorityMap);
    }

    @Override
    public void modifyCollectionResourceMap(CollectionResourceMap resourceMap) {
        collectionResourceMapMapper.modifyCollectionResourceMap(resourceMap);
    }

    @Override
    public List<CollectionAuthorityMap> getAllUsersInCollection(int collectionId, ResourceType resourceType) {
        return collectionAuthorityMapMapper.getAllUsersInCollection(collectionId, resourceType);
    }

    @Override
    public List<CollectionResourceMap> getResourcesByAuthorityMaps(ResourceType resourceType, List<CollectionAuthorityMap> authorityMaps) {
        if (authorityMaps == null || authorityMaps.size() == 0) {
            return new ArrayList<>(1);
        }
        StringBuilder builder = new StringBuilder();
        builder.append(" ( ");
        for (int i = 0; i < authorityMaps.size(); i++) {
            builder.append(authorityMaps.get(i).getCollectionId());
            if (i != authorityMaps.size() - 1) {
                builder.append(" , ");
            }
        }
        builder.append(") ");
        return collectionResourceMapMapper.getResourcesByIdList(resourceType, builder.toString());

    }

    @Override
    public List<CollectionInfo> getAllCollectionInfo(String tableName) {
        return collectionAuthorityMapMapper.getAllCollectionInfo(tableName);
    }

    @Override
    public List<CollectionInfo> getCollectionInfoByUserId(String tableName, int userId, ResourceType resourceType) {
        return collectionAuthorityMapMapper.getCollectionInfoByUserId(tableName, userId, resourceType);
    }

    @Override
    public int getResourcesCountByIdList(ResourceType resourceType, List<Integer> idList) {
        if (idList == null || idList.size() == 0) {
            return 0;
        }
        StringBuilder builder = new StringBuilder();
        builder.append(" ( ");
        for (int i = 0; i < idList.size(); i++) {
            builder.append(idList.get(i));
            if (i != idList.size() - 1) {
                builder.append(" , ");
            }
        }
        builder.append(") ");
        return collectionResourceMapMapper.getResourcesCountByIdList(resourceType, builder.toString());
    }
}
