package org.domeos.api.model.deployment;

import java.util.List;

/**
 * Created by xxs on 15/12/17.
 */
public class DeploymentDetail {
    private long deployId;
    private String deployName;
    private long clusterId;
    private String clusterName;
    private long lastUpdateTime;
    private DeploymentStatus deploymentStatus;
    private long currentReplicas;
    private long defaultReplicas;
    private String namespace;
    private List<VersionDetail> currentVersions;
    private HealthChecker healthChecker;
    private List<LoadBalanceDraft> loadBalanceDrafts;
    private boolean scalable;
    private boolean stateful;

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setDeployName(String deployName) {
        this.deployName = deployName;
    }

    public String getDeployName() {
        return deployName;
    }

    public void setClusterId(long clusterId) {
        this.clusterId = clusterId;
    }

    public long getClusterId() {
        return clusterId;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setLastUpdateTime(long lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }

    public long getLastUpdateTime() {
        return lastUpdateTime;
    }

    public void setDeploymentStatus(DeploymentStatus deploymentStatus) {
        this.deploymentStatus = deploymentStatus;
    }

    public DeploymentStatus getDeploymentStatus() {
        return deploymentStatus;
    }

    public void setCurrentReplicas(long currentReplicas) {
        this.currentReplicas = currentReplicas;
    }

    public long getCurrentReplicas() {
        return currentReplicas;
    }

    public void setDefaultReplicas(long defaultReplicas) {
        this.defaultReplicas = defaultReplicas;
    }

    public long getDefaultReplicas() {
        return defaultReplicas;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setCurrentVersions(List<VersionDetail> currentVersions) {
        this.currentVersions = currentVersions;
    }

    public List<VersionDetail> getCurrentVersions() {
        return currentVersions;
    }

    public void setHealthChecker(HealthChecker healthChecker) {
        this.healthChecker = healthChecker;
    }

    public HealthChecker getHealthChecker() {
        return healthChecker;
    }

    public void setLoadBalanceDrafts(List<LoadBalanceDraft> loadBalanceDrafts) {
        this.loadBalanceDrafts = loadBalanceDrafts;
    }

    public List<LoadBalanceDraft> getLoadBalanceDrafts() {
        return loadBalanceDrafts;
    }

    public boolean isScalable() {
        return scalable;
    }

    public void setScalable(boolean scalable) {
        this.scalable = scalable;
    }

    public boolean isStateful() {
        return stateful;
    }

    public void setStateful(boolean stateful) {
        this.stateful = stateful;
    }
}
