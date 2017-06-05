package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.cluster.related.ClusterLog;
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
    private ClusterLog clusterLog;
    private long lastUpdateTime;
    private DeploymentStatus deploymentStatus;
    private long currentReplicas;
    private long defaultReplicas;
    private String namespace;
    private List<VersionDraft> currentVersions;
    private HealthChecker healthChecker;
    private boolean scalable;
    private DeploymentAccessType accessType;
    private int exposePortNum;
    private NetworkMode networkMode;
    private boolean deletable;
    private VersionType versionType;
    private DeploymentType deploymentType;
    private String deployTypeShow;
    private String description;
    private List<LoadBalancerForDeploy> lbForDeploys;
    
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

    public ClusterLog getClusterLog() {
        return clusterLog;
    }

    public DeploymentDetail setClusterLog(ClusterLog clusterLog) {
        this.clusterLog = clusterLog;
        return this;
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

    public void setCurrentVersions(List<VersionDraft> currentVersions) {
        this.currentVersions = currentVersions;
    }

    public List<VersionDraft> getCurrentVersions() {
        return currentVersions;
    }

    public void setHealthChecker(HealthChecker healthChecker) {
        this.healthChecker = healthChecker;
    }

    public HealthChecker getHealthChecker() {
        return healthChecker;
    }

    public boolean isScalable() {
        return scalable;
    }

    public void setScalable(boolean scalable) {
        this.scalable = scalable;
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

    public List<LoadBalancerForDeploy> getLbForDeploys() {
        return lbForDeploys;
    }

    public void setLbForDeploys(List<LoadBalancerForDeploy> lbForDeploys) {
        this.lbForDeploys = lbForDeploys;
    }
}
