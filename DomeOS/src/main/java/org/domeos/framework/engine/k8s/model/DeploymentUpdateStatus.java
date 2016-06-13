package org.domeos.framework.engine.k8s.model;

/**
 * Created by anningluo on 2015/12/16.
 */
public class DeploymentUpdateStatus implements Cloneable {
    private DeploymentUpdatePhase phase = DeploymentUpdatePhase.Unknown;
    private String reason = "";

    public DeploymentUpdateStatus(DeploymentUpdateStatus status) {
        this.phase = status.phase;
        this.reason = status.reason;
    }

    public DeploymentUpdateStatus() {
    }

    public DeploymentUpdatePhase getPhase() {
        return phase;
    }
    public void setPhase(DeploymentUpdatePhase phase) {
        this.phase = phase;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void start() {
        phase = DeploymentUpdatePhase.Starting;
    }

    public void run() {
        phase = DeploymentUpdatePhase.Running;
    }

    public void failed(String reason) {
        phase = DeploymentUpdatePhase.Failed;
        this.reason = reason;
    }

    public void succeed() {
        phase = DeploymentUpdatePhase.Succeed;
    }

    public void stop() {
        phase = DeploymentUpdatePhase.Stopped;
    }
}
