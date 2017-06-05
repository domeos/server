package org.domeos.framework.api.model.deployment;

import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.model.deployment.related.DeploymentType;
import org.domeos.framework.api.model.deployment.related.HealthChecker;
import org.domeos.framework.api.model.deployment.related.HostEnv;
import org.domeos.framework.api.model.deployment.related.NetworkMode;
import org.domeos.framework.api.model.deployment.related.VersionType;
import org.domeos.framework.engine.model.RowModelBase;

/**
 * Created by xxs on 16/4/5.
 */
public class Deployment extends RowModelBase {

    private String clusterName;
    private String namespace; // namespace for k8s cluster
    private HostEnv hostEnv; // PROD or TEST
    private int defaultReplicas;
    private NetworkMode networkMode = NetworkMode.DEFAULT;
    private HealthChecker healthChecker;
//    private boolean stateful = false;
    private boolean scalable = false;
    private int clusterId = 0;
    private long lastUpdateTime = 0;
    private int exposePortNum = 0;
    private String yamlPodSpec;
    private VersionType versionType;
    private DeploymentType deploymentType = DeploymentType.REPLICATIONCONTROLLER;
    private int usedLoadBalancer = 0; //the deployment may be created by loadBalancer
    
    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public HostEnv getHostEnv() {
        return hostEnv;
    }

    public void setHostEnv(HostEnv hostEnv) {
        this.hostEnv = hostEnv;
    }

    public int getDefaultReplicas() {
        return defaultReplicas;
    }

    public void setDefaultReplicas(int defaultReplicas) {
        this.defaultReplicas = defaultReplicas;
    }

    public NetworkMode getNetworkMode() {
        return networkMode;
    }

    public void setNetworkMode(NetworkMode networkMode) {
        this.networkMode = networkMode;
    }

    public HealthChecker getHealthChecker() {
        return healthChecker;
    }

    public void setHealthChecker(HealthChecker healthChecker) {
        this.healthChecker = healthChecker;
    }

    public boolean isScalable() {
        return scalable;
    }

//    public boolean isStateful() {
//        return stateful;
//    }

//    public void setStateful(boolean stateful) {
//        this.stateful = stateful;
//    }

    public void setScalable(boolean scalable) {
        this.scalable = scalable;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public long getLastUpdateTime() {
        return lastUpdateTime;
    }

    public void setLastUpdateTime(long lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }

    public int getExposePortNum() {
        return exposePortNum;
    }

    public void setExposePortNum(int exposePortNum) {
        this.exposePortNum = exposePortNum;
    }

    public String getYamlPodSpec() {
        return yamlPodSpec;
    }

    public void setYamlPodSpec(String yamlPodSpec) {
        this.yamlPodSpec = yamlPodSpec;
    }

    public VersionType getVersionType() {
        return versionType;
    }

    public void setVersionType(VersionType versionType) {
        this.versionType = versionType;
    }

    public boolean deployTerminated() {
        return DeploymentStatus.STOP.name().equals(this.getState())
                || DeploymentStatus.RUNNING.name().equals(this.getState())
                || DeploymentStatus.ERROR.name().equals(this.getState())
                || DeploymentStatus.UPDATE_ABORTED.name().equals(this.getState())
                || DeploymentStatus.BACKROLL_ABORTED.name().equals(this.getState());
    }

    public DeploymentType getDeploymentType() {
        return deploymentType;
    }

    public void setDeploymentType(DeploymentType deploymentType) {
        this.deploymentType = deploymentType;
    }

    public int getUsedLoadBalancer() {
        return usedLoadBalancer;
    }

    public void setUsedLoadBalancer(int usedLoadBalancer) {
        this.usedLoadBalancer = usedLoadBalancer;
    }
}
