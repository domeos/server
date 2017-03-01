package org.domeos.framework.api.model.monitor;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class ContainerInfo {

    private String hostname;
    private String containerId;

    public ContainerInfo() {
    }

    public ContainerInfo(String hostname, String containerId) {
        this.hostname = hostname;
        this.containerId = containerId;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public String getContainerId() {
        return containerId;
    }

    public void setContainerId(String containerId) {
        this.containerId = containerId;
    }
}
