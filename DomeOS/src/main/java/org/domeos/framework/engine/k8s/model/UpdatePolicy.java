package org.domeos.framework.engine.k8s.model;

/**
 * Created by anningluo on 2015/12/15.
 */

public class UpdatePolicy extends UpdateReplicationCount {
    private boolean removeOldFirst = true;
    // delay is in millionseconds, <=0 for no delay
    private long firstActionDelay = -1;
    private long secondActionDelay = -1;
    private long maxTimeForReady = 20000;
    private long checkReadyPeriod = 1000;
    // -1 means not set for min and max PodReadyCount
    private int minPodReadyCount = -1;
    private int maxPodReadyCount = -1;

    public UpdatePolicy(int oldReplicaCount, int newReplicaCount) {
        super(oldReplicaCount, newReplicaCount);
    }

    public UpdatePolicy(UpdateReplicationCount replicationCount) {
        super(replicationCount.getOldReplicaCount(), replicationCount.getNewReplicaCount());
    }

    public boolean isRemoveOldFirst() {
        return removeOldFirst;
    }

    public void setRemoveOldFirst(boolean removeOldFirst) {
        this.removeOldFirst = removeOldFirst;
    }

    public long getFirstActionDelay() {
        return firstActionDelay;
    }

    public void setFirstActionDelay(long firstActionDelay) {
        this.firstActionDelay = firstActionDelay;
    }

    public long getSecondActionDelay() {
        return secondActionDelay;
    }

    public void setSecondActionDelay(long secondActionDelay) {
        this.secondActionDelay = secondActionDelay;
    }

    public int getMinPodReadyCount() {
        return minPodReadyCount;
    }

    public void setMinPodReadyCount(int minPodReadyCount) {
        this.minPodReadyCount = minPodReadyCount;
    }

    public int getMaxPodReadyCount() {
        return maxPodReadyCount;
    }

    public void setMaxPodReadyCount(int maxPodReadyCount) {
        this.maxPodReadyCount = maxPodReadyCount;
    }

    public long getMaxTimeForReady() {
        return maxTimeForReady;
    }

    public void setMaxTimeForReady(long maxTimeForReady) {
        this.maxTimeForReady = maxTimeForReady;
    }

    public long getCheckReadyPeriod() {
        return checkReadyPeriod;
    }

    public void setCheckReadyPeriod(long checkReadyPeriod) {
        this.checkReadyPeriod = checkReadyPeriod;
    }

    public String toString() {
        return "{removeOldFirst:" + removeOldFirst
                + "; oldReplicationCount:" + getOldReplicaCount()
                + "; newReplicationCount:" + getNewReplicaCount()
                + "; minPodReadyCount:" + minPodReadyCount
                + "; maxPodReadyCount:" + maxPodReadyCount
                + "; firstActionDelay:" + firstActionDelay
                + "; secondActionDelay:" + secondActionDelay
                + "; maxTimeForReady:" + maxTimeForReady
                + "; checkReadyPeriod:" + checkReadyPeriod
                + ";}";
    }
}
