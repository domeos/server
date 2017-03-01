package org.domeos.framework.api.consolemodel.alarm;

import org.domeos.framework.api.model.deployment.related.HostEnv;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class DeploymentAlarmInfo {

    private long id;
    private String clusterName;
    private String deploymentName;
    private String namespace;
    private HostEnv hostEnv;
    private String instanceName;
    private String instanceHostIp;
    private long instanceCreateTime;
    private String containerId;

    public DeploymentAlarmInfo() {
    }

    public DeploymentAlarmInfo(long id, String clusterName, String deploymentName, String namespace, HostEnv hostEnv,
                               String instanceName, String instanceHostIp, long instanceCreateTime, String containerId) {
        this.id = id;
        this.clusterName = clusterName;
        this.deploymentName = deploymentName;
        this.namespace = namespace;
        this.hostEnv = hostEnv;
        this.instanceName = instanceName;
        this.instanceHostIp = instanceHostIp;
        this.instanceCreateTime = instanceCreateTime;
        this.containerId = containerId;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String getDeploymentName() {
        return deploymentName;
    }

    public void setDeploymentName(String deploymentName) {
        this.deploymentName = deploymentName;
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

    public String getInstanceName() {
        return instanceName;
    }

    public void setInstanceName(String instanceName) {
        this.instanceName = instanceName;
    }

    public String getInstanceHostIp() {
        return instanceHostIp;
    }

    public void setInstanceHostIp(String instanceHostIp) {
        this.instanceHostIp = instanceHostIp;
    }

    public long getInstanceCreateTime() {
        return instanceCreateTime;
    }

    public void setInstanceCreateTime(long instanceCreateTime) {
        this.instanceCreateTime = instanceCreateTime;
    }

    public String getContainerId() {
        return containerId;
    }

    public void setContainerId(String containerId) {
        this.containerId = containerId;
    }
}

