package org.domeos.framework.engine;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;

import java.util.List;

/**
 * Created by sparkchen on 16/4/6.
 */
public interface RuntimeDriver {

    void init(Cluster cluster, List<Deployment> allDeployment, DeployEventBiz eventBiz, DeploymentStatusBiz statusBiz);
    void updateList(Cluster cluster, List<Deployment> allDeployment);

    // Operation
    void startDeploy(Deployment deployment, Version version, User user, List<LoadBalancer> lbs) throws JsonProcessingException;
    void stopDeploy(Deployment deployment);
    void rollbackDeploy(Deployment deployment);
    void startUpdate(Deployment deployment, long version, int replicas);
    void scaleUpDeployment(Deployment deployment, long version, int replicas);
    void scaleDownDeployment(Deployment deployment, long version, int replicas);

}
