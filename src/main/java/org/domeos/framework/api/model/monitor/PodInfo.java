package org.domeos.framework.api.model.monitor;

import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class PodInfo {

    private String podName;
    private List<ContainerInfo> containers;

    public PodInfo() {
    }

    public PodInfo(String podName, List<ContainerInfo> containers) {
        this.podName = podName;
        this.containers = containers;
    }

    public String getPodName() {
        return podName;
    }

    public void setPodName(String podName) {
        this.podName = podName;
    }

    public List<ContainerInfo> getContainers() {
        return containers;
    }

    public void setContainers(List<ContainerInfo> containers) {
        this.containers = containers;
    }
}
