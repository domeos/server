package org.domeos.framework.api.model.deployment;

import org.domeos.framework.api.model.deployment.related.PolicyType;

/**
 * Created by feiliu206363 on 2016/4/27.
 */
public class Policy {
    private PolicyType policyType;
    private int updateStep;
    private boolean removeOldFirst = true;
    // delay is in millionseconds, <=0 for no delay
    private long firstActionDelay = -1;
    private long secondActionDelay = -1;
    private long maxTimeForReady = 20000;
    private long checkReadyPeriod = 1000;
    // -1 means not set for min and max PodReadyCount
    private int minPodReadyCount = -1;
    private int maxPodReadyCount = -1;

    public PolicyType getPolicyType() {
        return policyType;
    }

    public void setPolicyType(PolicyType policyType) {
        this.policyType = policyType;
    }

    public int getUpdateStep() {
        return updateStep;
    }

    public void setUpdateStep(int updateStep) {
        this.updateStep = updateStep;
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
}
