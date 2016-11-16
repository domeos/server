package org.domeos.framework.engine;

import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.deployment.Deployment;
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

    public DeploymentUpdater createUpdater(KubeUtils client, Deployment deployment, Version dstVersion,
                                           int replicas, List<EnvDraft> extraEnvs, Policy policy, List<LoadBalancer> lbs) {
        DeploymentUpdater updater;
        if (replicas <= 0) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "replicas must be set, default is " + replicas + ", DomeOS cannot operate!");
        }
        updater = new DeploymentUpdater(client, deployment, dstVersion, replicas, extraEnvs, policy, lbs);
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
