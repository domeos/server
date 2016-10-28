package org.domeos.framework.engine;

import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.engine.exception.DriverException;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;

/**
 * Created by sparkchen on 16/4/6.
 */
public interface RuntimeDriver {

    void updateList(Cluster cluster);

    RuntimeDriver init(Cluster cluster);

    // Operation
    void startDeploy(Deployment deployment, Version version, User user, List<LoadBalancer> lbs, List<EnvDraft> allExtraEnvs)
            throws DriverException, DeploymentEventException, IOException;

    void stopDeploy(Deployment deployment, User user) throws DeploymentEventException, IOException;

    void rollbackDeploy(Deployment deployment, int versionId, int replicas, List<EnvDraft> allExtraEnvs, User user, Policy policy)
            throws IOException, DeploymentEventException;

    void startUpdate(Deployment deployment, int version, int replicas, List<EnvDraft> allExtraEnvs, User user, Policy policy)
            throws IOException, DeploymentEventException;

    void abortDeployOperation(Deployment deployment, User user)
            throws DeploymentEventException, IOException;

    void scaleUpDeployment(Deployment deployment, int version, int replicas, List<EnvDraft> allExtraEnvs, User user)
            throws IOException, DeploymentEventException;

    void scaleDownDeployment(Deployment deployment, int version, int replicas, List<EnvDraft> allExtraEnvs, User user)
            throws DeploymentEventException, IOException;

    void checkUpdateEvent(Deployment deployment, DeployEvent event)
            throws IOException, DeploymentEventException;

    void checkBasicEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException, DataBaseContentException, ParseException;

    void checkAbortEvent(Deployment deployment, DeployEvent event)
            throws  DeploymentEventException, IOException;

    void checkStopEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException;

    void expiredEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException;
}
