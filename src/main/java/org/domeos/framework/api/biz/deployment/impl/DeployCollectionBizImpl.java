package org.domeos.framework.api.biz.deployment.impl;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.deployment.DeployCollectionBiz;
import org.domeos.framework.api.mapper.domeos.deployment.DeployCollectionMapper;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.deployment.DeployCollection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by KaiRen on 2016/9/20.
 */
@Service("deployCollectionBiz")
public class DeployCollectionBizImpl extends BaseBizImpl implements DeployCollectionBiz {


    @Autowired
    DeployCollectionMapper mapper;

    @Autowired
    BaseBiz baseBiz;

    @Override
    public long createDeployCollection(DeployCollection deployCollection) {

        return mapper.createDeployCollection(deployCollection, deployCollection.toString());
    }

    @Override
    public void updateDeployCollection(DeployCollection deployCollection) {
        mapper.updateDeployCollection(deployCollection, deployCollection.toString());
    }

    @Override
    public void deleteDeployCollection(int collectionId) {
        super.removeById(DEPLOY_COLLECTION_NAME, collectionId);
    }

    @Override
    public List<DeployCollection> getDeployCollectionByAuthorityMaps(List<CollectionAuthorityMap> authorityMaps) {
        if (authorityMaps == null || authorityMaps.isEmpty()) {
            return null;
        }
        List<Integer> idList = new ArrayList<>(authorityMaps.size());
        for (CollectionAuthorityMap authorityMap : authorityMaps) {
            idList.add(authorityMap.getCollectionId());
        }
        return super.getListByIdList(DEPLOY_COLLECTION_NAME, idList, DeployCollection.class);
    }

    @Override
    public DeployCollection getDeployCollection(int deployCollectionId) {
        return super.getById(DEPLOY_COLLECTION_NAME, deployCollectionId, DeployCollection.class);
    }

    @Override
    public List<DeployCollection> getDeployCollectionByName(String name) {
        return super.getListByName(DEPLOY_COLLECTION_NAME, name, DeployCollection.class);
    }
}
