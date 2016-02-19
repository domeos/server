package org.domeos.api.service.deployment;

import org.domeos.api.model.deployment.Deployment;
import org.domeos.api.model.deployment.DeploymentDraft;

import java.io.IOException;
import java.util.List;

/**
 * Created by xxs on 15/12/19.
 */
public interface DeploymentBiz {
    /**
     *
     * @param deployId
     * @return
     * @throws IOException
     */
    Deployment getDeployment(long deployId) throws IOException;

    /**
     *
     * @param deployName
     * @return
     */
    Long getIdByName(String deployName);

    /**
     *
     * @param deployment
     * @return
     */
    long createDeployment(DeploymentDraft deployment);

    /**
     *
     * @param deployId
     */
    void deleteDeployment(long deployId);

    /**
     *
     * @param deployIds
     * @return
     */
    List<Deployment> listDeployment(List<Long> deployIds);

    /**
     *
     * @param deployId
     * @param replicas
     */
    void updateDefaultReplicas(long deployId, int replicas);
}
