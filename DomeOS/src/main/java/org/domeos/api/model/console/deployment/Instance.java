package org.domeos.api.model.console.deployment;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/18.
 */
public class Instance {
    int deloyId;
    String deployName;
    String namespace;
    int versionId;
    String instanceName;
    long startTime;
    String hostName;
    String podIp;
    String hostIp;
    List<Container> containers;

    public int getDeloyId() {
        return deloyId;
    }

    public void setDeloyId(int deloyId) {
        this.deloyId = deloyId;
    }

    public String getDeployName() {
        return deployName;
    }

    public void setDeployName(String deployName) {
        this.deployName = deployName;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public int getVersionId() {
        return versionId;
    }

    public void setVersionId(int versionId) {
        this.versionId = versionId;
    }

    public String getInstanceName() {
        return instanceName;
    }

    public void setInstanceName(String instanceName) {
        this.instanceName = instanceName;
    }

    public long getStartTime() {
        return startTime;
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public String getPodIp() {
        return podIp;
    }

    public void setPodIp(String podIp) {
        this.podIp = podIp;
    }

    public String getHostIp() {
        return hostIp;
    }

    public void setHostIp(String hostIp) {
        this.hostIp = hostIp;
    }

    public List<Container> getContainers() {
        return containers;
    }

    public void setContainers(List<Container> containers) {
        this.containers = containers;
    }

    public void addContainer(Container container) {
        if (containers == null) {
            containers = new LinkedList<>();
        }
        if (container != null) {
            containers.add(container);
        }
    }
}
