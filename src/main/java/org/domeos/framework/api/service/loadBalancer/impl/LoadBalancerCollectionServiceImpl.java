package org.domeos.framework.api.service.loadBalancer.impl;

import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerCollectionBiz;
import org.domeos.framework.api.consolemodel.loadBalancer.LoadBalancerCollectionDraft;
import org.domeos.framework.api.consolemodel.loadBalancer.LoadBalancerCollectionInfo;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.loadBalancer.LoadBalancerCollection;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.loadBalancer.LoadBalancerCollectionService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import java.util.*;
import java.util.concurrent.Callable;
import org.domeos.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by jackfan on 17/2/27.
 */
@Service
public class LoadBalancerCollectionServiceImpl implements LoadBalancerCollectionService {
    
    @Autowired
    LoadBalancerCollectionBiz lbcBiz;

    @Autowired
    CollectionBiz collectionBiz;

    @Autowired
    OperationHistory operationHistory;

    private final ResourceType resourceType = ResourceType.LOADBALANCER_COLLECTION;

    @Override
    public LoadBalancerCollectionDraft createLoadBalancerCollection(LoadBalancerCollectionDraft lbcDraft) {
        if (lbcDraft == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_COLLECTION_NOT_LEGAL, "loadBalancerCollection is null");
        }
        
        String error = lbcDraft.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_COLLECTION_NOT_LEGAL, error);
        }
        
        List<LoadBalancerCollection> lbcOlds = lbcBiz.getLoadBalancerCollection(lbcDraft.getName());
        if (lbcOlds != null) {
            for (LoadBalancerCollection lbc : lbcOlds) {
                if (lbcDraft.getType() == lbc.getType()) {
                    throw ApiException.wrapMessage(ResultStat.LOADBALANCER_COLLECTION_EXIST, 
                            "loadBalancerCollection name have been exist.");
                }
            }
        }
        
        LoadBalancerCollection lbc = lbcDraft.toLoadBalancerConnection();
        lbc.setCreatorId(CurrentThreadInfo.getUserId());
        lbcBiz.createLoadBalancerCollection(lbc);
        lbcDraft.setId(lbc.getId());
        CollectionAuthorityMap collectionAuthorityMap = new CollectionAuthorityMap(lbc.getId(),
                resourceType,
                CurrentThreadInfo.getUserId(),
                Role.MASTER,
                System.currentTimeMillis()
                );
        collectionBiz.addAuthority(collectionAuthorityMap);
        
        operationHistory.insertRecord(new OperationRecord(
                lbc.getId(),
                resourceType,
                OperationType.SET,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        return lbcDraft;
    }

    @Override
    public void deleteLoadBalancerCollection(int lbcId) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.collectionVerify(userId, lbcId, resourceType, OperationType.DELETE, -1);
        
        List<CollectionResourceMap> collectionResourceMaps = collectionBiz.getResourcesByCollectionIdAndResourceType(
                lbcId, ResourceType.LOADBALANCER);
        if (collectionResourceMaps != null && collectionResourceMaps.size() > 0) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_LOADBALANCER_COLLECTION, "You cannot delete a loadBalancer collection" +
                    " with loadBalancer exists");
        }
        
        lbcBiz.deleteLoadBalancerCollection(lbcId);
        collectionBiz.deleteAuthoritiesByCollectionIdAndResourceType(lbcId, resourceType);
        operationHistory.insertRecord(new OperationRecord(
                lbcId,
                resourceType,
                OperationType.DELETE,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
    }

    @Override
    public LoadBalancerCollectionDraft updateLoadBalancerCollection(LoadBalancerCollectionDraft lbcDraft) {
        if (lbcDraft == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_COLLECTION_NOT_LEGAL, "loadBalancerCollection is null");
        }
        
        String error = lbcDraft.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_COLLECTION_NOT_LEGAL, error);
        }
        
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.collectionVerify(userId, lbcDraft.getId(), resourceType, OperationType.MODIFY, -1);
        
        LoadBalancerCollection lbcOld = lbcBiz.getLoadBalancerCollection(lbcDraft.getId());
        if (lbcOld == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_COLLECTION_NOT_EXIST, "loadBalancer collection is not exist");
        }
        
        List<LoadBalancerCollection> lbcOlds = lbcBiz.getLoadBalancerCollection(lbcDraft.getName());
        if (lbcOlds != null) {
            for (LoadBalancerCollection lbc : lbcOlds) {
                if (lbcDraft.getType() == lbc.getType() && lbcDraft.getId() != lbc.getId()) {
                    throw ApiException.wrapMessage(ResultStat.LOADBALANCER_COLLECTION_EXIST, 
                            "loadBalancerCollection name have been exist.");
                }
            }
        }
        
        if (lbcOld.getType() != lbcDraft.getType()) {
            List<CollectionResourceMap> collectionResourceMaps = collectionBiz.getResourcesByCollectionIdAndResourceType(
                    lbcDraft.getId(), ResourceType.LOADBALANCER);
            if (collectionResourceMaps != null && collectionResourceMaps.size() > 0) {
                throw ApiException.wrapMessage(ResultStat.CANNOT_UPDATE_LOADBALANCER_COLLECTION, "You cannot update loadBalancerCollection type " +
                        "with loadBalancer exists");
            }
            lbcOld.setType(lbcDraft.getType());
        }
        lbcOld.setName(lbcDraft.getName());
        lbcOld.setDescription(lbcDraft.getDescription());
        lbcBiz.updateLoadBalancerCollection(lbcOld);
        
        operationHistory.insertRecord(new OperationRecord(
                lbcDraft.getId(),
                resourceType,
                OperationType.MODIFY,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        return lbcDraft;
    }

    @Override
    public List<LoadBalancerCollectionInfo> listLoadBalancerCollection() {
        int userId = CurrentThreadInfo.getUserId();
        List<CollectionAuthorityMap> authorityMaps = AuthUtil.getCollectionList(userId, resourceType);
        if (authorityMaps == null) {
            return null;
        }
        List<GetLoadBalancerCollectionInfoTask> lbcTasks = new LinkedList<GetLoadBalancerCollectionInfoTask>();
        Boolean isAdmin = AuthUtil.isAdmin(userId);
        for (CollectionAuthorityMap authorityMap : authorityMaps) {
            lbcTasks.add(new GetLoadBalancerCollectionInfoTask(authorityMap, isAdmin));
        }
        List<LoadBalancerCollectionInfo> lbcInfos = ClientConfigure.executeCompletionService(lbcTasks);
        Collections.sort(lbcInfos, new LoadBalancerCollectionInfo.LoadBalancerCollectionComparator());
        return lbcInfos;
    }

    private class GetLoadBalancerCollectionInfoTask implements Callable<LoadBalancerCollectionInfo> {
        Boolean isAdmin;
        CollectionAuthorityMap authorityMap;

        private GetLoadBalancerCollectionInfoTask(CollectionAuthorityMap authorityMap, boolean isAdmin) {
            this.isAdmin = isAdmin;
            this.authorityMap = authorityMap;
        }

        @Override
        public LoadBalancerCollectionInfo call() throws Exception {
            LoadBalancerCollection lbc = lbcBiz.getLoadBalancerCollection(authorityMap.getCollectionId());
            LoadBalancerCollectionInfo lbcInfo = new LoadBalancerCollectionInfo(lbc);
            String userName = AuthUtil.getUserNameById(lbcInfo.getCreatorId());
            lbcInfo.setCreatorName(userName);
            List<CollectionResourceMap> resourceMaps = collectionBiz.
                    getResourcesByCollectionIdAndResourceType(lbc.getId(), ResourceType.LOADBALANCER);
            if (resourceMaps == null) {
                lbcInfo.setLoadBalancerCount(0);
            } else {
                lbcInfo.setLoadBalancerCount(resourceMaps.size());
            }
            List<CollectionAuthorityMap> authorityMaps = collectionBiz.getAuthoritiesByCollectionIdAndResourceType(lbc.getId(), resourceType);
            if (authorityMaps == null) {
                lbcInfo.setMemberCount(0);
            } else {
                lbcInfo.setMemberCount(authorityMaps.size());
            }
            if (isAdmin) {
                lbcInfo.setRole(Role.MASTER);
            } else {
                lbcInfo.setRole(authorityMap.getRole());
            }
            return lbcInfo;
        }
    }

    @Override
    public LoadBalancerCollectionInfo getLoadBalancerCollection(int lbcId) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.collectionVerify(userId, lbcId, resourceType, OperationType.GET, -1);
        
        LoadBalancerCollection lbcOld = lbcBiz.getLoadBalancerCollection(lbcId);
        if (lbcOld == null) {
            throw ApiException.wrapResultStat(ResultStat.LOADBALANCER_COLLECTION_NOT_EXIST);
        }
        LoadBalancerCollectionInfo lbcInfo = new LoadBalancerCollectionInfo(lbcOld);
        String userName = AuthUtil.getUserNameById(lbcInfo.getCreatorId());
        lbcInfo.setCreatorName(userName);
        return lbcInfo;
    }
    
}
