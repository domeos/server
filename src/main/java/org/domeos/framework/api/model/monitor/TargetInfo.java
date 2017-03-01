package org.domeos.framework.api.model.monitor;

import org.domeos.util.StringUtils;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class TargetInfo {

    private String node;
    private PodInfo pod;
    private ContainerInfo container;

    public TargetInfo() {
    }

    public TargetInfo(String node, PodInfo pod, ContainerInfo container) {
        this.node = node;
        this.pod = pod;
        this.container = container;
    }

    public String getNode() {
        return node;
    }

    public void setNode(String node) {
        this.node = node;
    }

    public PodInfo getPod() {
        return pod;
    }

    public void setPod(PodInfo pod) {
        this.pod = pod;
    }

    public ContainerInfo getContainer() {
        return container;
    }

    public void setContainer(ContainerInfo container) {
        this.container = container;
    }

    public boolean checkTargetType(String targetType) {
        switch (targetType) {
            case "node":
                return !StringUtils.isBlank(node);
            case "pod":
                return pod != null;
            case "container":
                return container != null;
            default:
                return false;
        }
    }
}
