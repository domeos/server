package org.domeos.framework.engine.k8s.judgement;

import org.domeos.client.kubernetesclient.definitions.v1.ContainerStatus;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.util.DateUtil;
import org.domeos.global.GlobalConstant;

import java.text.ParseException;
import java.util.TimeZone;

/**
 * Created by anningluo on 2015/12/24.
 */
public class FailedJudgement {
    private FailedJudgementPolicy judgementPolicy = new FailedJudgementPolicy();

    public FailedJudgementPolicy getJudgementPolicy() {
        return judgementPolicy;
    }

    public void setJudgementPolicy(FailedJudgementPolicy judgementPolicy) {
        this.judgementPolicy = judgementPolicy;
    }

    // true for failed
    // false for not failed or unknow status
    public boolean isFailed(Pod pod) throws ParseException {
        if (pod == null || pod.getStatus() == null || pod.getMetadata() == null) {
            return false;
        }
        long startTime = 0;
        if (pod.getStatus().getContainerStatuses() == null) {
            if (pod.getMetadata().getCreationTimestamp() == null) {
                // is it return true better ?
                return false;
            }
            startTime = DateUtil.string2timestamp(pod.getMetadata().getCreationTimestamp(),
                    TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
        } else {
            startTime = DateUtil.string2timestamp(pod.getStatus().getStartTime(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
        }
        // PodBriefStatus podStatus = PodUtils.getStatus(pod);
        long current = System.currentTimeMillis();
        switch (PodUtils.getStatus(pod)) {
            case SuccessTerminated:
            case SuccessRunning:
            case Unknow:
                return false;
            case FailedTerminated:
                return true;
            case Pending:
                return judgementPolicy.getPendingExpireTime() > 0
                        && judgementPolicy.getPendingExpireTime() + startTime < current;
            case Running:
                if (judgementPolicy.getRunningExpireTime() > 0
                        && judgementPolicy.getRunningExpireTime() + startTime < current) {
                    // expired
                    return true;
                }
                if (pod.getStatus().getContainerStatuses() == null) {
                    return false;
                }
                for (ContainerStatus containerStatus : pod.getStatus().getContainerStatuses()) {
                    if (judgementPolicy.getMaxContainerRestartTime() > 0
                        && containerStatus.getRestartCount() > judgementPolicy.getMaxContainerRestartTime()) {
                        return true;
                    }
                }
                return false;
            case Terminating:
                return false;
        }
        return false;
    }

    public boolean isAnyFailed(PodList podList) throws ParseException {
        return !(podList == null || podList.getItems() == null) && isAnyFailed(podList.getItems());
    }

    public boolean isAnyFailed(Pod[] pods) throws ParseException {
        if (pods == null) {
            return false;
        }
        for (Pod pod : pods) {
            if (isFailed(pod)) {
                return true;
            }
        }
        return false;
    }

    // if a rc should be created, but
    public boolean isExpireForEventNotReallyHappen(long startTime) {
        return System.currentTimeMillis() - startTime > judgementPolicy.getNullExpireTime();
    }
}
