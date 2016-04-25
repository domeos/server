package org.domeos.framework.api.model.deployment;

import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;

import java.util.List;

/**
 */
public class DeployEvent {
    long eid;
    int deployId;
    long startTime;
    long lastModify;
    DeployOperation operation;
    long userId;
    String userName;
    DeployEventStatus eventStatus;
    long statusExpire;
    String message;
    List<DeploymentSnapshot> primarySnapshot;
    List<DeploymentSnapshot> targetSnapshot;
    List<DeploymentSnapshot> currentSnapshot;

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

    public long getStartTime() {
        return startTime;
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    public long getLastModify() {
        return lastModify;
    }

    public void setLastModify(long lastModify) {
        this.lastModify = lastModify;
    }

    public DeployOperation getOperation() {
        return operation;
    }

    public void setOperation(DeployOperation operation) {
        this.operation = operation;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public DeployEventStatus getEventStatus() {
        return eventStatus;
    }

    public void setEventStatus(DeployEventStatus eventStatus) {
        this.eventStatus = eventStatus;
    }

    public long getStatusExpire() {
        return statusExpire;
    }

    public void setStatusExpire(long statusExpire) {
        this.statusExpire = statusExpire;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<DeploymentSnapshot> getPrimarySnapshot() {
        return primarySnapshot;
    }

    public void setPrimarySnapshot(List<DeploymentSnapshot> primarySnapshot) {
        this.primarySnapshot = primarySnapshot;
    }

    public List<DeploymentSnapshot> getTargetSnapshot() {
        return targetSnapshot;
    }

    public void setTargetSnapshot(List<DeploymentSnapshot> targetSnapshot) {
        this.targetSnapshot = targetSnapshot;
    }

    public List<DeploymentSnapshot> getCurrentSnapshot() {
        return currentSnapshot;
    }

    public void setCurrentSnapshot(List<DeploymentSnapshot> currentSnapshot) {
        this.currentSnapshot = currentSnapshot;
    }
}
