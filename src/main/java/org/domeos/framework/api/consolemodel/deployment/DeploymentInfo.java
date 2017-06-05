package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.model.deployment.related.HostEnv;
import org.domeos.framework.api.model.deployment.related.VersionType;

/**
 * Created by xxs on 15/12/15.
 */
public class DeploymentInfo {
    private int deployId;
    private String deployName;
    private long createTime;
    private long lastUpdateTime;
    private DeploymentStatus deploymentStatus;
    private String clusterName;
    private String namespace;
    private HostEnv hostEnv;
    private long replicas;
    private double cpuTotal;
    private double cpuUsed;
    private double memoryTotal;
    private double memoryUsed;
//    private boolean stateful;
    private String serviceDnsName;
    private boolean deletable;
    private VersionType versionType;
    private String deployTypeShow;

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

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getCreateTime() {
        return createTime;
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

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setHostEnv(HostEnv hostEnv) {
        this.hostEnv = hostEnv;
    }

    public HostEnv getHostEnv() {
        return hostEnv;
    }

    public void setReplicas(long replicas) {
        this.replicas = replicas;
    }

    public long getReplicas() {
        return replicas;
    }

    public void setCpuTotal(double cpuTotal) {
        this.cpuTotal = cpuTotal;
    }

    public double getCpuTotal() {
        return cpuTotal;
    }

    public void setCpuUsed(double cpuUsed) {
        this.cpuUsed = cpuUsed;
    }

    public double getCpuUsed() {
        return cpuUsed;
    }

    public void setMemoryTotal(double memoryTotal) {
        this.memoryTotal = memoryTotal;
    }

    public double getMemoryTotal() {
        return memoryTotal;
    }

    public void setMemoryUsed(double memoryUsed) {
        this.memoryUsed = memoryUsed;
    }

    public double getMemoryUsed() {
        return memoryUsed;
    }

    public boolean isDeletable() {
        return deletable;
    }

    public void setDeletable(boolean deletable) {
        this.deletable = deletable;
    }

    public DeploymentInfo(Deployment deployment) {
        deployId = deployment.getId();
        deployName = deployment.getName();
        createTime = deployment.getCreateTime();
        namespace = deployment.getNamespace();
        hostEnv = deployment.getHostEnv();
        replicas = deployment.getDefaultReplicas();
        lastUpdateTime = deployment.getLastUpdateTime();
    }

//    public boolean isStateful() {
//        return stateful;
//    }

//    public void setStateful(boolean stateful) {
//        this.stateful = stateful;
//    }

    public String getServiceDnsName() {
        return serviceDnsName;
    }

    public void setServiceDnsName(String serviceDnsName) {
        this.serviceDnsName = serviceDnsName;
    }

    public VersionType getVersionType() {
        return versionType;
    }

    public void setVersionType(VersionType versionType) {
        this.versionType = versionType;
    }

    public String getDeployTypeShow() {
        return deployTypeShow;
    }

    public void setDeployTypeShow(String deployTypeShow) {
        this.deployTypeShow = deployTypeShow;
    }
}