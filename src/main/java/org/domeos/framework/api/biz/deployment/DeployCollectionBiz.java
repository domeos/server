package org.domeos.framework.api.biz.deployment;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.deployment.DeployCollection;

import java.util.List;

/**
 * Created by KaiRen on 2016/9/20.
 */
public interface DeployCollectionBiz extends BaseBiz {

    String DEPLOY_COLLECTION_NAME = "deploy_collection";

    long createDeployCollection(DeployCollection deployCollection);

    void updateDeployCollection(DeployCollection deployCollection);

    void deleteDeployCollection(int collectionId);

    List<DeployCollection> getDeployCollectionByAuthorityMaps(List<CollectionAuthorityMap> authorityMaps);

    DeployCollection getDeployCollection(int deployCollectionId);

    List<DeployCollection> getDeployCollectionByName(String name);
}
