package org.domeos.framework.engine.k8s.model;

/**
 * Created by anningluo on 2015/12/15.
 */
public class UpdateReplicationCount implements Cloneable {
    private int oldReplicaCount;
    private int newReplicaCount;

    public UpdateReplicationCount(int oldReplicaCount, int newReplicaCount) {
        this.oldReplicaCount = oldReplicaCount;
        this.newReplicaCount = newReplicaCount;
    }

    public int getOldReplicaCount() {
        return oldReplicaCount;
    }

    public void setOldReplicaCount(int oldReplicaCount) {
        this.oldReplicaCount = oldReplicaCount;
    }

    public int getNewReplicaCount() {
        return newReplicaCount;
    }

    public void setNewReplicaCount(int newReplicaCount) {
        this.newReplicaCount = newReplicaCount;
    }

    public Object clone() {
        return new UpdateReplicationCount(oldReplicaCount, newReplicaCount);
    }
}
