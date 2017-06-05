package org.domeos.framework.api.service.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.DeploymentTerminatedException;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDetail;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.DeploymentInfo;
import org.domeos.framework.api.consolemodel.deployment.LoadBalancerForDeploy;
import org.domeos.framework.api.consolemodel.deployment.VersionString;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.UpdateJobResult;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.deployment.related.LoadBalancerForDeployDraft;
import org.domeos.framework.engine.event.AutoDeploy.AutoUpdateInfo;
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
     * @throws DeploymentEventException
     */
    DeploymentDetail getDeployment(int deployId) throws DeploymentEventException, DeploymentTerminatedException;

    /**
     * migrate deployment to another deploy collection
     *
     * @param deployId deployment id
     * @param collectionId the collection Id migrate to
     * @return
     * @throws IOException
     * @throws DeploymentEventException
     */
    void migrateDeployment(int deployId, int collectionId) throws IOException, DeploymentEventException;

    /**
     * list abstract info of all deployments
     *
     * @return List of DeploymentInfo
     * @throws IOException
     */
    List<DeploymentInfo> listDeployment() throws IOException;

    /**
     * list abstract info of deployments of a deploy collection
     *
     * @return List of DeploymentInfo
     * @throws IOException
     * @throws DeploymentEventException
     */
    List<DeploymentInfo> listDeployment(int collectionId) throws IOException;

    /**
     * start deployment
     *
     * @param deployId  deployment id
     * @param versionId current version id
     * @param replicas  the number of RC
     * @return
     * @throws IOException
     * @throws DaoException
     * @throws DeploymentEventException
     */
    void startDeployment(int deployId, int versionId, int replicas)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException;

    /**
     * stop deployment
     *
     * @param deployId deployment id
     * @return
     * @throws IOException
     * @throws DeploymentEventException
     */
    void stopDeployment(int deployId)
            throws IOException, DeploymentEventException, DeploymentTerminatedException;

    /**
     * start deployment update
     *
     * @param deployId  deployment id
     * @param versionId new version id
     * @param replicas  the number of new version RC
     * @return
     * @throws IOException
     * @throws DaoException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> startUpdate(int deployId, int versionId, int replicas, Policy policy)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException;

    /**
     * start rollback for deployment
     *
     * @param deployId  deployment id
     * @param versionId rollback to versionId
     * @param replicas  the number of rollback version RC
     * @param policy the policy of rollback
     * @return
     * @throws IOException
     * @throws DaoException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> startRollback(int deployId, int versionId, int replicas, Policy policy)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException;

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
    HttpResponseTemp<?> scaleUpDeployment(int deployId, int versionId, int replicas)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException;

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
    HttpResponseTemp<?> scaleDownDeployment(int deployId, int versionId, int replicas)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException;

    HttpResponseTemp<?> scaleDaemonSet(int deployId, int versionId, List<LabelSelector> replicas)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException;

    /**
     * list deployment events
     *
     * @param deployId deployment id
     * @return
     * @throws IOException
     */
    List<DeployEvent> listDeployEvent(int deployId) throws IOException;

    /**
     * abort deployment operation
     * @param deployId deployment id
     * @return
     */
    HttpResponseTemp<?> abortDeployOperation(int deployId)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException;

    VersionString getRCStr(DeploymentDraft deploymentDraft);

    /**
     *
     * @param autoUpdateInfo
     * @param b
     */
    void startUpdate(AutoUpdateInfo autoUpdateInfo, boolean b) throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException;

    /**
     * to receive update job result
     * @param updateJobResult
     * @return
     */
    void updateJobResult(UpdateJobResult updateJobResult);
    
    /**
     * modify description
     * @param deployId
     * @param description
     */
    void modifyDeploymentDescription(int deployId, String description);
    
    /**
     * @param deployId
     * @param deploymentDraft
     * @throws Exception
     */
    void modifyInnerService(int deployId, LoadBalancerForDeployDraft loadBalancerDraft) throws Exception;
    
    /**
     * @param deployId
     * @param LoadBalancerForDeploy
     * @throws Exception
     */
    List<LoadBalancerForDeploy> listLoadBalancer(int deployId) throws Exception;

}
