package org.domeos.framework.api.model.deployment;

import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
import org.domeos.framework.engine.model.DataModelBase;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 */
public class DeployEvent extends DataModelBase {
    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public static Set<String> toExclude = new HashSet<String>() {{
        add("eid");
        add("deployId");
        add("operation");
        add("eventStatus");
        add("statusExpire");
    }};

    long eid;
    int deployId;
    DeployOperation operation;
    DeployEventStatus eventStatus;
    long statusExpire;

    long startTime;
    long lastModify;
    int userId;
    String userName;
    String message;
    List<DeploymentSnapshot> primarySnapshot;
    List<DeploymentSnapshot> targetSnapshot;
    List<DeploymentSnapshot> currentSnapshot;

    public DeployEvent() {
    }

    public DeployEvent(int deployId, DeployOperation operation, DeployEventStatus eventStatus, User user,
                       List<DeploymentSnapshot> primarySnapshot, List<DeploymentSnapshot> targetSnapshot, List<DeploymentSnapshot> currentSnapshot) {
        this.deployId = deployId;
        this.operation = operation;
        this.eventStatus = eventStatus;
        this.startTime = System.currentTimeMillis();
        this.lastModify = this.startTime;
        this.userId = user.getId();
        this.userName = user.getUsername();
        this.primarySnapshot = primarySnapshot;
        this.targetSnapshot = targetSnapshot;
        this.currentSnapshot = currentSnapshot;
    }

    public List<DeploymentSnapshot> getCurrentSnapshot() {
        return currentSnapshot;
    }

    public void setCurrentSnapshot(List<DeploymentSnapshot> currentSnapshot) {
        this.currentSnapshot = currentSnapshot;
    }

    public int getDeployId() {
        return deployId;
    }

    public void setDeployId(int deployId) {
        this.deployId = deployId;
    }

    public long getEid() {
        return eid;
    }

    public void setEid(long eid) {
        this.eid = eid;
    }

    public DeployEventStatus getEventStatus() {
        return eventStatus;
    }

    public void setEventStatus(DeployEventStatus eventStatus) {
        this.eventStatus = eventStatus;
    }

    public long getLastModify() {
        return lastModify;
    }

    public void setLastModify(long lastModify) {
        this.lastModify = lastModify;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public DeployOperation getOperation() {
        return operation;
    }

    public void setOperation(DeployOperation operation) {
        this.operation = operation;
    }

    public List<DeploymentSnapshot> getPrimarySnapshot() {
        return primarySnapshot;
    }

    public void setPrimarySnapshot(List<DeploymentSnapshot> primarySnapshot) {
        this.primarySnapshot = primarySnapshot;
    }

    public long getStartTime() {
        return startTime;
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    public long getStatusExpire() {
        return statusExpire;
    }

    public void setStatusExpire(long statusExpire) {
        this.statusExpire = statusExpire;
    }

    public List<DeploymentSnapshot> getTargetSnapshot() {
        return targetSnapshot;
    }

    public void setTargetSnapshot(List<DeploymentSnapshot> targetSnapshot) {
        this.targetSnapshot = targetSnapshot;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public boolean eventTerminated() {
        if (getEventStatus() == null) {
            return false;
        }
        return DeployEventStatus.FAILED.equals(eventStatus) || DeployEventStatus.SUCCESS.equals(eventStatus)
                || DeployEventStatus.ABORTED.equals(eventStatus);
    }
}
