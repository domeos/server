package org.domeos.api.service.deployment.impl.updater;

import org.domeos.api.model.deployment.Deployment;
import org.domeos.api.model.deployment.Version;
import org.domeos.client.kubernetesclient.KubeClient;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by anningluo on 2015/12/15.
 */
public class DeploymentUpdaterManager {
    private static Map<Long, DeploymentUpdater> allDeploymentUpdater = new ConcurrentHashMap<>();

    public DeploymentUpdater getUpdater(long deploymentId) {
        return allDeploymentUpdater.get(deploymentId);
    }

    public DeploymentUpdater createUpdater(KubeClient client, Deployment deployment, Version dstVersion, long replicas) {
        DeploymentUpdater updater;
        if (replicas == -1) {
            updater = new DeploymentUpdater(client, deployment, dstVersion);
        } else {
            updater = new DeploymentUpdater(client, deployment, dstVersion, (int)replicas);
        }
        allDeploymentUpdater.put(deployment.getDeployId(), updater);
        return updater;
    }

    public void removeUpdater(long deploymentId) {
        DeploymentUpdater updater = allDeploymentUpdater.remove(deploymentId);
        if (updater == null) {
            return;
        }
        updater.close();
    }
}
