package org.domeos.framework.api.service.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDetail;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.DeploymentInfo;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.engine.exception.DaoException;

import java.io.IOException;
import java.util.List;

/**
 * Created by xxs on 16/4/5.
 */
public interface DeploymentService {
    /**
     * create deployment
     *
     * @param deploymentDraft input parameters
     * @return
     * @throws Exception
     */
    int createDeployment(DeploymentDraft deploymentDraft) throws Exception;

    /**
     * remove deployment by id
     *
     * @param deployId deployment id
     * @return
     * @throws IOException
     */
    void removeDeployment(int deployId) throws IOException;

    /**
     * update deployment by id
     *
     * @param deployId        deployment id
     * @param deploymentDraft new parameters
     * @return
     * @throws Exception
     */
    void modifyDeployment(int deployId, DeploymentDraft deploymentDraft) throws Exception;

    /**
     * get deployment detail by id
     *
     * @param deployId deployment id
     * @return deployment detail
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     */
    DeploymentDetail getDeployment(int deployId) throws IOException, KubeInternalErrorException, KubeResponseException;

    /**
     * list abstract info of deployments
     *
     * @return List of DeploymentInfo
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     */
    List<DeploymentInfo> listDeployment() throws IOException, KubeInternalErrorException, KubeResponseException;

    /**
     * start deployment
     *
     * @param deployId  deployment id
     * @param versionId current version id
     * @param replicas  the number of RC
     * @return
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     * @throws DeploymentEventException
     */
    void startDeployment(int deployId, long versionId, int replicas)
            throws IOException, KubeInternalErrorException, KubeResponseException, DeploymentEventException, DaoException;

    /**
     * stop deployment
     *
     * @param deployId deployment id
     * @return
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     * @throws DeploymentEventException
     */
    void stopDeployment(int deployId)
            throws IOException, KubeInternalErrorException, KubeResponseException, DeploymentEventException;

    /**
     * start deployment update
     *
     * @param deployId  deployment id
     * @param versionId new version id
     * @param replicas  the number of new version RC
     * @return
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> startUpdate(int deployId, long versionId, int replicas)
            throws IOException, KubeInternalErrorException, KubeResponseException, DeploymentEventException, DaoException;

    /**
     * start rollback for deployment
     *
     * @param deployId  deployment id
     * @param versionId rollback to versionId
     * @param replicas  the number of rollback version RC
     * @return
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> startRollback(int deployId, long versionId, int replicas)
            throws IOException, KubeInternalErrorException, KubeResponseException, DeploymentEventException;

    /**
     * scale up for deployment
     *
     * @param deployId  deployment id
     * @param versionId current version id
     * @param replicas  target replicas
     * @return
     * @throws IOException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> scaleUpDeployment(int deployId, long versionId, int replicas) throws IOException, DeploymentEventException;

    /**
     * scale down for deployment
     *
     * @param deployId  deployment id
     * @param versionId current version id
     * @param replicas  target replicas
     * @return
     * @throws IOException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> scaleDownDeployment(int deployId, long versionId, int replicas) throws IOException, DeploymentEventException;

    /**
     * list deployment events
     *
     * @param deployId deployment id
     * @return
     * @throws IOException
     */
    List<DeployEvent> listDeployEvent(int deployId) throws IOException;
}