package org.domeos.api.model.deployment;

/**
 * Created by anningluo on 2015/12/15.
 */
public class UpdateStatus extends UpdateReplicationCount implements Cloneable {
    private UpdatePhase phase;
    private String reason;

    public UpdateStatus(UpdatePhase phase, int oldReplicaCount, int newReplicaCount) {
        super(oldReplicaCount, newReplicaCount);
        this.phase = phase;
    }
    public UpdateStatus(UpdatePhase phase, UpdateReplicationCount count) {
        super(count.getOldReplicaCount(), count.getNewReplicaCount());
        this.phase = phase;
    }
    public UpdateStatus(UpdateStatus another) {
        super(another.getOldReplicaCount(), another.getNewReplicaCount());
        this.phase = another.phase;
        this.reason= another.reason;
    }

    public UpdatePhase getPhase() {
        return phase;
    }

    public void setPhase(UpdatePhase phase) {
        this.phase = phase;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Object clone() {
        UpdateStatus status = new UpdateStatus(phase, getOldReplicaCount(), getNewReplicaCount());
        status.setReason(reason);
        return status;
    }
}
