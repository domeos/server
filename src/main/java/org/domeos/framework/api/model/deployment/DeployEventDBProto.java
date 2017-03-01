package org.domeos.framework.api.model.deployment;

import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.domeos.framework.api.model.deployment.related.DeployOperation;

/**
 */
public class DeployEventDBProto {
    long eid;
    int deployId;
    DeployOperation operation;
    DeployEventStatus eventStatus;
    long statusExpire;
    long startTime;
    String content;

    public long getEid() {
        return eid;
    }

    public void setEid(long eid) {
        this.eid = eid;
    }

    public int getDeployId() {
        return deployId;
    }

    public void setDeployId(int deployId) {
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

    public long getStartTime() {
        return startTime;
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }
}
