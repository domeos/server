package org.domeos.framework.engine.runtime;

/**
 * Created by xxs on 16/1/21.
 */
public class MonitorCounterInfo {
    private String nodeName;
    private String containerId;

    public MonitorCounterInfo(String nodeName, String containerId) {
        this.nodeName = nodeName;
        this.containerId = containerId;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public String getNodeName() {
        return this.nodeName;
    }

    public void setContainerId(String containerId) {
        this.containerId = containerId;
    }

    public String getContainerId() {
        return this.containerId;
    }
}
