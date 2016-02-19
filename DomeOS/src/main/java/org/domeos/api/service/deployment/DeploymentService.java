package org.domeos.api.service.deployment;

import org.domeos.api.model.deployment.DeployEvent;
import org.domeos.api.model.deployment.DeploymentDetail;
import org.domeos.api.model.deployment.DeploymentDraft;
import org.domeos.api.model.deployment.DeploymentInfo;
import org.domeos.api.model.user.User;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.exception.DeploymentEventException;

import java.io.IOException;
import java.util.List;

/**
 */
public interface DeploymentService {
    /**
     *
     * @param deploymentDraft
     * @param userId
     * @return
     * @throws IOException
     */
    HttpResponseTemp<?> createDeployment(DeploymentDraft deploymentDraft, long userId) throws Exception;

    /**
     *
     * @param deployId
     * @param userId
     * @return
     * @throws IOException
     */
    HttpResponseTemp<?> removeDeployment(long deployId, long userId) throws IOException;

    /**
     *
     * @param userId
     * @return
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     */
    HttpResponseTemp<List<DeploymentInfo>> listDeployment(long userId) throws IOException, KubeInternalErrorException, KubeResponseException;

    /**
     *
     * @param deployId
     * @param userId
     * @return
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     */
    HttpResponseTemp<DeploymentDetail> getDeployment(long deployId, long userId) throws IOException, KubeInternalErrorException, KubeResponseException;

    /**
     *
     * @param deployId
     * @param user
     * @return
     * @throws KubeResponseException
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> stopDeployment(long deployId, User user) throws KubeResponseException, IOException, KubeInternalErrorException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param versionId
     * @param replicas
     * @param userId
     * @return
     * @throws IOException
     * @throws KubeResponseException
     * @throws KubeInternalErrorException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> startUpdate(long deployId, long versionId, int replicas, User userId) throws IOException, KubeResponseException, KubeInternalErrorException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param version
     * @param replicas
     * @param user
     * @return
     * @throws IOException
     * @throws KubeInternalErrorException
     * @throws KubeResponseException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> startDeployment(long deployId, long version, int replicas, User user) throws IOException, KubeInternalErrorException, KubeResponseException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param versionId
     * @param replicas
     * @param userId
     * @return
     * @throws IOException
     * @throws KubeResponseException
     * @throws KubeInternalErrorException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> startRollback(long deployId, long versionId, int replicas, User userId) throws IOException, KubeResponseException, KubeInternalErrorException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param versionId
     * @param replicas
     * @param user
     * @return
     * @throws IOException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> scaleUpDeployment(long deployId, long versionId, int replicas, User user) throws IOException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param versionId
     * @param replicas
     * @param user
     * @return
     * @throws IOException
     * @throws DeploymentEventException
     */
    HttpResponseTemp<?> scaleDownDeployment(long deployId, long versionId, int replicas, User user) throws IOException, DeploymentEventException;

    /**
     *
     * @param deployId
     * @param userId
     * @return
     * @throws IOException
     */
    HttpResponseTemp<List<DeployEvent>> listDeployEvent(long deployId, long userId) throws IOException;
}
