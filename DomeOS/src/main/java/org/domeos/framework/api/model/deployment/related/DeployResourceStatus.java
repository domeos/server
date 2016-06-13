package org.domeos.framework.api.model.deployment.related;

/**
 * Created by xxs on 16/1/15.
 */
public class DeployResourceStatus {
    private long deployId;
    private double cpuTotal;    // number
    private double cpuUsed;     // number
    private double memTotal;    // MB = 1024 * 1024 Byte
    private double memUsed;     // MB = 1024 * 1024 Byte

    public void setDeployId(long deployId) {
        this.deployId = deployId;
        this.cpuTotal = 0;
        this.cpuUsed = 0;
        this.memTotal = 0;
        this.memUsed = 0;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setCpuTotal(double cpuTotal) {
        this.cpuTotal = cpuTotal;
    }

    public double getCpuTotal() {
        return this.cpuTotal;
    }

    public void setCpuUsed(double cpuUsed) {
        this.cpuUsed = cpuUsed;
    }

    public double getCpuUsed() {
        return this.cpuUsed;
    }

    public void setMemTotal(double memTotal) {
        this.memTotal = memTotal;
    }

    public double getMemTotal() {
        return this.memTotal;
    }

    public void setMemUsed(double memUsed) {
        this.memUsed = memUsed;
    }

    public double getMemUsed() {
        return this.memUsed;
    }

    public void addCpuTotal(double cpuTotal) {
        this.cpuTotal += cpuTotal;
    }

    public void addCpuUsed(double cpuUsed) {
        this.cpuUsed += cpuUsed;
    }

    public void addMemTotal(double memTotal) {
        this.memTotal += memTotal;
    }

    public void addMemUsed(double memUsed) {
        this.memUsed += memUsed;
    }
}
