package org.domeos.framework.api.service.auth.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.consolemodel.auth.*;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.related.CollectionInfo;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.service.auth.UserCollectionService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by KaiRen on 2016/9/22.
 */
@Service("userCollectionService")
public class UserCollectionServiceImpl implements UserCollectionService {
    @Autowired
    AuthBiz authBiz;
    @Autowired
    CollectionBiz collectionBiz;

    @Override
    public HttpResponseTemp<?> addUserToCollection(CollectionAuthorityMap authorityMap) {
        addUserCollection(authorityMap);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteAllUserInCollection(int collectionId, ResourceType resourceType) {
        collectionBiz.deleteAuthoritiesByCollectionIdAndResourceType(collectionId, resourceType);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> addCollectionMember(int userId, CollectionMember member) {
        AuthUtil.collectionVerify(userId, member.getCollectionId(),
                member.getResourceType() , OperationType.ADDGROUPMEMBER, member.getUserId());
        CollectionAuthorityMap authorityMap = new CollectionAuthorityMap(member.getCollectionId(),
                member.getResourceType(),
                member.getUserId(),
                member.getRole(),
                System.currentTimeMillis());
        int exist = collectionBiz.userExistInCollection(authorityMap);
        if (exist != 0) {
            collectionBiz.modifyCollectionAuthorityMap(authorityMap);
        } else {
            collectionBiz.addAuthority(authorityMap);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> addCollectionMembers(int userId, CollectionMembers members) {
        if (members == null) {
            throw new PermitException("group is null");
        }
        AuthUtil.collectionVerify(userId, members.getCollectionId(), members.getResourceType(), OperationType.ADDGROUPMEMBER, -1);
        String membersLegalityInfo = members.checkLegality();
        if (!StringUtils.isBlank(membersLegalityInfo)) {
            throw ApiException.wrapMessage(ResultStat.GROUP_MEMBER_FAILED, membersLegalityInfo);
        }
        for (CollectionAuthorityMap authorityMap : members.getMembers()) {
            authorityMap.setCollectionId(members.getCollectionId());
            authorityMap.setUpdateTime(System.currentTimeMillis());
            authorityMap.setResourceType(members.getResourceType());
            addUserCollection(authorityMap);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteCollectionMember(int userId, CollectionAuthorityMap authorityMap) {
        if (authorityMap == null) {
            throw new PermitException("authority map is null");
        }
        CollectionAuthorityMap mapInfo = collectionBiz.getAuthorityByUserIdAndResourceTypeAndCollectionId(
                authorityMap.getUserId(),
                authorityMap.getResourceType(),
                authorityMap.getCollectionId()
        );
        if (mapInfo == null) {
            return ResultStat.GROUP_MEMBER_FAILED.wrap("no such collection authority map");
        }
        AuthUtil.collectionVerify(userId, authorityMap.getCollectionId(),
                authorityMap.getResourceType(), OperationType.DELETEGROUPMEMBER, authorityMap.getUserId());
        collectionBiz.deleteAuthorityMap(authorityMap);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> listCollectionMember(int userId, int collectionId, ResourceType resourceType) {
        AuthUtil.collectionVerify(userId, collectionId, resourceType, OperationType.LISTGROUPMEMBER, -1);
        List<CollectionAuthorityMap> authorityMaps = collectionBiz.getAllUsersInCollection(collectionId, resourceType);
        List<CollectionMember> res = null;
        if (authorityMaps != null) {
            res = new ArrayList<>();
            for (CollectionAuthorityMap authorityMap : authorityMaps) {
                CollectionMember collectionMember = new CollectionMember(authorityMap);
                User user = authBiz.getUserById(collectionMember.getUserId());
                collectionMember.setUsername(user.getUsername());
                res.add(collectionMember);
            }
        }
        return ResultStat.OK.wrap(res);
    }

    @Override
    public HttpResponseTemp<?> getCollectionSpace(int userId, ResourceType resourceType) {
        List<CollectionAuthorityMap> authorityMapList;
        if (AuthUtil.isAdmin(userId)) {
            authorityMapList = collectionBiz.getAllCollectionByType(resourceType);
        } else {
            authorityMapList = collectionBiz.getAuthoritiesByUserIdAndResourceType(userId, resourceType);
        }
        List<CollectionSpace> res = new ArrayList<>();
        if (authorityMapList == null) {
            return ResultStat.OK.wrap(res);
        }
        for (CollectionAuthorityMap authorityMap : authorityMapList) {
            switch (resourceType) {
                case PROJECT_COLLECTION:
                    //TODO add get project_collection id into CollectionSpace
                    break;
                case DEPLOY_COLLECTION:
                    //TODO add get deploy_collection id into CollectionSpace
                    break;
            }
        }
        return ResultStat.OK.wrap(res);
    }

    public HttpResponseTemp<List<CollectionInfo>> listAllCollectionInfo(int userId, ResourceType collectionType) {

        List<CollectionInfo> collectionInfos;
        String tableName = null;
        switch (collectionType) {
            case PROJECT_COLLECTION:
                tableName = GlobalConstant.PROJECT_COLLECTION_TABLE_NAME;
                break;
            case DEPLOY_COLLECTION:
                tableName = GlobalConstant.DEPLOY_COLLETION_TABLE_NAME;
                break;
            case CLUSTER:
                tableName = GlobalConstant.CLUSTER_TABLE_NAME;
        }
        if (tableName == null) {
            return ResultStat.OK.wrap(null);
        }
        if (AuthUtil.isAdmin(userId)) {
            collectionInfos = collectionBiz.getAllCollectionInfo(tableName);
        } else {
            collectionInfos = collectionBiz.getCollectionInfoByUserId(tableName, userId);
        }
        return ResultStat.OK.wrap(collectionInfos);
    }

    @Override
    public void addUserCollection(CollectionAuthorityMap authorityMap) {
        int exist = collectionBiz.userExistInCollection(authorityMap);
        if (exist != 0) {
            collectionBiz.modifyCollectionAuthorityMap(authorityMap);
        } else {
            collectionBiz.addAuthority(authorityMap);
        }

    }
}
