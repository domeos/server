package org.domeos.framework.engine;

import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdater;
import org.domeos.framework.engine.k8s.util.KubeUtils;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by anningluo on 2015/12/15.
 */
public class DeploymentUpdaterManager {
    private static Map<Integer, DeploymentUpdater> allDeploymentUpdater = new ConcurrentHashMap<>();

    public DeploymentUpdater getUpdater(int deploymentId) {
        return allDeploymentUpdater.get(deploymentId);
    }

    public DeploymentUpdater createUpdater(KubeUtils client, Deployment deployment, Version dstVersion, int replicas, List<EnvDraft> extraEnvs) {
        DeploymentUpdater updater;
        if (replicas == -1) {
            updater = new DeploymentUpdater(client, deployment, dstVersion, extraEnvs);
        } else {
            updater = new DeploymentUpdater(client, deployment, dstVersion, replicas, extraEnvs);
        }
        allDeploymentUpdater.put(deployment.getId(), updater);
        return updater;
    }

    public DeploymentUpdater createUpdater(KubeUtils client, Deployment deployment, Version dstVersion,
                                           int replicas, List<EnvDraft> extraEnvs, Policy policy, List<LoadBalancer> lbs) {
        DeploymentUpdater updater;
        if (replicas == -1) {
            updater = new DeploymentUpdater(client, deployment, dstVersion, extraEnvs, policy, lbs);
        } else {
            updater = new DeploymentUpdater(client, deployment, dstVersion, replicas, extraEnvs, policy, lbs);
        }
        allDeploymentUpdater.put(deployment.getId(), updater);
        return updater;
    }

    public void removeUpdater(int deploymentId) {
        DeploymentUpdater updater = allDeploymentUpdater.remove(deploymentId);
        if (updater == null) {
            return;
        }
        updater.stop();
    }
}
