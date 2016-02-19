package org.domeos.api.service.deployment;

import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/12/18.
 */
public interface InstanceService {
    /**
     *
     * @param deployId is the deploy id in database
     * @param userId is for current user
     * @return all pods of this deploy
     */
    HttpResponseTemp<?> listPodsByDeployId(int deployId, Long userId);
}
