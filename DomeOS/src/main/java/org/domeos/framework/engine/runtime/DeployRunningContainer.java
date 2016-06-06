package org.domeos.framework.engine.runtime;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by xxs on 16/1/19.
 */
public class DeployRunningContainer {
    private long deployId;
    private long versionId;
    private double cpuTotal;
    private double memTotal;
    private List<MonitorCounterInfo> counterInfo;

    public DeployRunningContainer(long deployId, long versionId) {
        this.deployId = deployId;
        this.versionId = versionId;
        counterInfo = new LinkedList<>();
        cpuTotal = 0.0;
        memTotal = 0.0;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public long getDeployId() {
        return this.deployId;
    }

    public void setVersionId(long versionId) {
        this.versionId = versionId;
    }

    public long getVersionId() {
        return this.versionId;
    }

    public void setCounterInfo(List<MonitorCounterInfo> counterInfo) {
        this.counterInfo = counterInfo;
    }

    public List<MonitorCounterInfo> getCounterInfo() {
        return this.counterInfo;
    }

    public void setCpuTotal(double cpuTotal) {
        this.cpuTotal = cpuTotal;
    }

    public double getCpuTotal() {
        return this.cpuTotal;
    }

    public void setMemTotal(double memTotal) {
        this.memTotal = memTotal;
    }

    public double getMemTotal() {
        return this.memTotal;
    }

    public boolean insertNewRecord(String nodeName, String containerId) {
        MonitorCounterInfo counterInfo = new MonitorCounterInfo(nodeName, containerId);
        return this.counterInfo.add(counterInfo);
    }
}
