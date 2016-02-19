package org.domeos.api.model.deployment;

/**
 */
public class DeployEventDBProto {
    long eid;
    long deployId;
    DeployOperation operation;
    DeployEventStatus eventStatus;
    long statusExpire;
    String content;

    public long getEid() {
        return eid;
    }

    public void setEid(long eid) {
        this.eid = eid;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public DeployOperation getOperation() {
        return operation;
    }

    public void setOperation(DeployOperation operation) {
        this.operation = operation;
    }

    public DeployEventStatus getEventStatus() {
        return eventStatus;
    }

    public void setEventStatus(DeployEventStatus eventStatus) {
        this.eventStatus = eventStatus;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public long getStatusExpire() {
        return statusExpire;
    }

    public void setStatusExpire(long statusExpire) {
        this.statusExpire = statusExpire;
    }
}
