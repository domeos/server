package org.domeos.framework.api.service.deployment.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.deployment.DeployCollectionBiz;
import org.domeos.framework.api.consolemodel.deployment.DeployCollectionDraft;
import org.domeos.framework.api.consolemodel.deployment.DeployCollectionInfo;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.deployment.DeployCollection;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.service.deployment.DeployCollectionService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * Created by KaiRen on 2016/9/22.
 */
@Service
public class DeployCollectionServiceImpl implements DeployCollectionService {
    @Autowired
    DeployCollectionBiz deployCollectionBiz;

    @Autowired
    CollectionBiz collectionBiz;

    @Autowired
    OperationHistory operationHistory;

    private final ResourceType resourceType = ResourceType.DEPLOY_COLLECTION;

    private static Logger logger = LoggerFactory.getLogger(DeployCollectionServiceImpl.class);
    @Override
    public HttpResponseTemp<?> createDeployCollection(DeployCollectionDraft deployCollectionDraft) {
        if (deployCollectionDraft == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOY_COLLECTION_NOT_LEGAL, "deployment is null");
        }
        String error = deployCollectionDraft.checkLegality();
        if (error != null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOY_COLLECTION_NOT_LEGAL, error);
        }
        List<DeployCollection> deployCollectionList = deployCollectionBiz.getDeployCollectionByName(deployCollectionDraft.getName());
        if (deployCollectionList != null && deployCollectionList.size() > 0) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOY_COLLECTION_EXIST);
        }
        DeployCollection deployCollection = deployCollectionDraft.toDeployCollection();
        deployCollection.setCreateTime(System.currentTimeMillis());
        deployCollectionBiz.createDeployCollection(deployCollection);
        operationHistory.insertRecord(new OperationRecord(
                deployCollection.getId(),
                resourceType,
                OperationType.SET,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        CollectionAuthorityMap collectionAuthorityMap = new CollectionAuthorityMap(deployCollection.getId(),
                resourceType,
                CurrentThreadInfo.getUserId(),
                Role.MASTER,
                System.currentTimeMillis()
                );
        collectionBiz.addAuthority(collectionAuthorityMap);
        return ResultStat.OK.wrap(deployCollection);
    }

    @Override
    public HttpResponseTemp<?> deleteDeployCollection(int collectionId) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.collectionVerify(userId, collectionId, resourceType, OperationType.DELETE, -1);
        List<CollectionResourceMap> collectionResourceMaps = collectionBiz.getResourcesByCollectionIdAndResourceType(
                collectionId, ResourceType.DEPLOY);
        if (collectionResourceMaps != null && collectionResourceMaps.size() > 0) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_DEPLOY_COLLECTION, "You cannot delete a deploy collection" +
                    "with deploy exists");
        }
        deployCollectionBiz.deleteDeployCollection(collectionId);
        collectionBiz.deleteResourcesByCollectionIdAndResourceType(collectionId, resourceType);
        collectionBiz.deleteAuthoritiesByCollectionIdAndResourceType(collectionId, resourceType);
        operationHistory.insertRecord(new OperationRecord(
                collectionId,
                resourceType,
                OperationType.DELETE,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> listDeployCollection() {
        int userId = CurrentThreadInfo.getUserId();
        List<CollectionAuthorityMap> authorityMaps = AuthUtil.getCollectionList(userId, resourceType);
        List<GetDeployCollectionInfoTask> deployCollectionInfoTasks = new LinkedList<>();
        Boolean isAdmin = AuthUtil.isAdmin(userId);
        for (CollectionAuthorityMap authorityMap : authorityMaps) {
            deployCollectionInfoTasks.add(new GetDeployCollectionInfoTask(authorityMap, isAdmin));
        }
        List<DeployCollectionInfo> deployCollectionInfoList = ClientConfigure.executeCompletionService(deployCollectionInfoTasks);
        Collections.sort(deployCollectionInfoList, new DeployCollectionInfo.DeployCollectionInfoListComparator());
        return ResultStat.OK.wrap(deployCollectionInfoList);
    }

    private class GetDeployCollectionInfoTask implements Callable<DeployCollectionInfo> {
        Boolean isAdmin;
        CollectionAuthorityMap authorityMap;


        private GetDeployCollectionInfoTask(CollectionAuthorityMap authorityMap, boolean isAdmin) {
            this.isAdmin = isAdmin;
            this.authorityMap = authorityMap;
        }

        @Override
        public DeployCollectionInfo call() throws Exception {
            DeployCollection deployCollection = deployCollectionBiz.getDeployCollection(authorityMap.getCollectionId());
            DeployCollectionInfo deployCollectionInfo = new DeployCollectionInfo(deployCollection);
            String userName = AuthUtil.getUserNameById(deployCollectionInfo.getCreatorId());
            deployCollectionInfo.setCreatorName(userName);
            List<CollectionResourceMap> resourceMaps = collectionBiz.
                    getResourcesByCollectionIdAndResourceType(deployCollectionInfo.getId(), ResourceType.DEPLOY);
            if (resourceMaps == null) {
                deployCollectionInfo.setDeployCount(0);
            } else {
                deployCollectionInfo.setDeployCount(resourceMaps.size());
            }
            List<CollectionAuthorityMap> authorityMaps = collectionBiz.getAuthoritiesByCollectionIdAndResourceType(deployCollectionInfo.getId(), resourceType);
            if (authorityMaps == null) {
                deployCollectionInfo.setMemberCount(0);
            } else {
                deployCollectionInfo.setMemberCount(authorityMaps.size());
            }
            if (isAdmin) {
                deployCollectionInfo.setRole(Role.MASTER);
            } else {
                deployCollectionInfo.setRole(authorityMap.getRole());
            }
            return deployCollectionInfo;
        }
    }


    @Override
    public HttpResponseTemp<?> modifyDeployCollection(int deployCollectionId, DeployCollectionDraft deployCollectionDraft) {
        if (deployCollectionDraft == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOY_COLLECTION_NOT_LEGAL, "deployment is null");
        }
        String error = deployCollectionDraft.checkLegality();
        if (error != null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOY_COLLECTION_NOT_LEGAL, error);
        }
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.collectionVerify(userId, deployCollectionId, resourceType, OperationType.MODIFY, -1);
        DeployCollection oldDeployCollection = deployCollectionBiz.getDeployCollection(deployCollectionId);
        if (oldDeployCollection == null) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOY_COLLECTION_NOT_EXIST);
        }
        DeployCollection newDeployCollection = deployCollectionDraft.toDeployCollection();
        newDeployCollection.setId(deployCollectionId);
        deployCollectionBiz.updateDeployCollection(newDeployCollection);
        operationHistory.insertRecord(new OperationRecord(
                newDeployCollection.getCreatorId(),
                resourceType,
                OperationType.MODIFY,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        return  ResultStat.OK.wrap(newDeployCollection);
    }


}
