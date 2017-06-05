package org.domeos.framework.api.service.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.deployment.DeployCollectionDraft;

/**
 * Created by KaiRen on 2016/9/22.
 */
public interface DeployCollectionService {
    HttpResponseTemp<?> createDeployCollection(DeployCollectionDraft deployCollectionDraft);

    HttpResponseTemp<?> deleteDeployCollection(int collectionId);

    HttpResponseTemp<?> modifyDeployCollection(int deployCollectionId, DeployCollectionDraft deployCollectionDraft);

    HttpResponseTemp<?> listDeployCollection();
}
