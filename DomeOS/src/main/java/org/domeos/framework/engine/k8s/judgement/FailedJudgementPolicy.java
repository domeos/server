package org.domeos.framework.engine.k8s.judgement;

/**
 * Created by anningluo on 2015/12/24.
 */
public class FailedJudgementPolicy {
    // in milliseconds
    private long pendingExpireTime = 10 * 60 * 1000; // 10 minutes
    private long runningExpireTime = 10 * 60 * 1000;
    private long nullExpireTime = 3 * 60 * 1000; // 1.5 minutes, this is for request not happen
    private int maxContainerRestartTime = 3;

    public long getPendingExpireTime() {
        return pendingExpireTime;
    }

    public void setPendingExpireTime(long pendingExpireTime) {
        this.pendingExpireTime = pendingExpireTime;
    }

    public long getRunningExpireTime() {
        return runningExpireTime;
    }

    public void setRunningExpireTime(long runningExpireTime) {
        this.runningExpireTime = runningExpireTime;
    }

    public int getMaxContainerRestartTime() {
        return maxContainerRestartTime;
    }

    public void setMaxContainerRestartTime(int maxContainerRestartTime) {
        this.maxContainerRestartTime = maxContainerRestartTime;
    }

    public long getNullExpireTime() {
        return nullExpireTime;
    }

    public void setNullExpireTime(long nullExpireTime) {
        this.nullExpireTime = nullExpireTime;
    }
}
