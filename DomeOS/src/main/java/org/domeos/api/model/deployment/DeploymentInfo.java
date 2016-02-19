package org.domeos.api.model.deployment;

/**
 * Created by xxs on 15/12/15.
 */
public class DeploymentInfo {
    private long deployId;
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

    public DeploymentInfo(Deployment deployment) {
        deployId = deployment.getDeployId();
        deployName = deployment.getDeployName();
        createTime = deployment.getCreateTime();
        clusterName = deployment.getClusterName();
        namespace = deployment.getNamespace();
        hostEnv = deployment.getHostEnv();
    }

    public boolean isStateful() {
        return stateful;
    }

    public void setStateful(boolean stateful) {
        this.stateful = stateful;
    }
}
