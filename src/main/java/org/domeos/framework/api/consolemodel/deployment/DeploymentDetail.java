package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.related.*;

import java.util.List;

/**
 * Created by xxs on 15/12/17.
 */
public class DeploymentDetail {
    private int deployId;
    private String deployName;
    private int clusterId;
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
    private String serviceDnsName;
    private DeploymentAccessType accessType;
    private int exposePortNum;
    private List<InnerServiceDraft> innerServiceDrafts;
    private NetworkMode networkMode;
    private boolean deletable;
    private VersionType versionType;
    private DeploymentType deploymentType;
    private String deployTypeShow;
    private String description;


    public void setDeployId(int deployId) {
        this.deployId = deployId;
    }

    public int getDeployId() {
        return deployId;
    }

    public void setDeployName(String deployName) {
        this.deployName = deployName;
    }

    public String getDeployName() {
        return deployName;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public int getClusterId() {
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

    public String getServiceDnsName() {
        return serviceDnsName;
    }

    public void setServiceDnsName(String serviceDnsName) {
        this.serviceDnsName = serviceDnsName;
    }

    public DeploymentAccessType getAccessType() {
        return accessType;
    }

    public void setAccessType(DeploymentAccessType accessType) {
        this.accessType = accessType;
    }

    public int getExposePortNum() {
        return exposePortNum;
    }

    public void setExposePortNum(int exposePortNum) {
        this.exposePortNum = exposePortNum;
    }

    public List<InnerServiceDraft> getInnerServiceDrafts() {
        return innerServiceDrafts;
    }

    public void setInnerServiceDrafts(List<InnerServiceDraft> innerServiceDrafts) {
        this.innerServiceDrafts = innerServiceDrafts;
    }

    public NetworkMode getNetworkMode() {
        return networkMode;
    }

    public void setNetworkMode(NetworkMode networkMode) {
        this.networkMode = networkMode;
    }

    public boolean isDeletable() {
        return deletable;
    }

    public void setDeletable(boolean deletable) {
        this.deletable = deletable;
    }

    public VersionType getVersionType() {
        return versionType;
    }

    public void setVersionType(VersionType versionType) {
        this.versionType = versionType;
    }

    public DeploymentType getDeploymentType() {
        return deploymentType;
    }

    public void setDeploymentType(DeploymentType deploymentType) {
        this.deploymentType = deploymentType;
    }

    public String getDeployTypeShow() {
        return deployTypeShow;
    }

    public void setDeployTypeShow(String deployTypeShow) {
        this.deployTypeShow = deployTypeShow;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
