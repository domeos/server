package org.domeos.framework.engine.k8s.updater;

import io.fabric8.kubernetes.api.model.PodList;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.engine.k8s.model.UpdatePolicy;
import org.domeos.framework.engine.k8s.model.UpdateReplicationCount;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by feiliu206363 on 2016/4/27.
 */
public class UserDesignUpdateStrategy implements UpdateStrategy {
    private static Logger logger = LoggerFactory.getLogger(RollingUpdateStrategy.class);

    private Policy policy;

    public Policy getPolicy() {
        return policy;
    }

    public void setPolicy(Policy policy) {
        this.policy = policy;
    }

    public UserDesignUpdateStrategy() {

    }

    public UserDesignUpdateStrategy(Policy policy) {
        this.policy = policy;
    }

    @Override
    public UpdatePolicy scheduleUpdate(UpdateReplicationCount desireCount, PodList oldPods, PodList newPods) {
        int oldReadyCount = PodUtils.getPodReadyNumber(oldPods.getItems());
        int newReadyCount = PodUtils.getPodReadyNumber(newPods.getItems());
        UpdateReplicationCount nextTargetCount = new UpdateReplicationCount(oldReadyCount, newReadyCount);
        int delta = 1;
        int totalDesireReadyPod = desireCount.getOldReplicaCount() + desireCount.getNewReplicaCount();
        int totalReadyPodNow = oldReadyCount + newReadyCount;
        logger.debug("[SCHEDULE UPDATE]oldReadyCount=" + oldReadyCount + ", newReadyCount=" + newReadyCount
                + ", oldDesireReadyCount=" + desireCount.getOldReplicaCount()
                + ", newDesireReadyCount=" + desireCount.getNewReplicaCount());

        boolean isFailed = false;
        if (totalReadyPodNow > totalDesireReadyPod + delta) {
            if (oldReadyCount > desireCount.getOldReplicaCount()) {
                int rcCount = Math.max(desireCount.getOldReplicaCount(), oldReadyCount - policy.getUpdateStep());
                nextTargetCount.setOldReplicaCount(rcCount);
            } else if (newReadyCount > desireCount.getNewReplicaCount()) {
                int rcCount = Math.max(desireCount.getNewReplicaCount(), newReadyCount - policy.getUpdateStep());
                nextTargetCount.setNewReplicaCount(rcCount);
            } else {
                // fatal
                logger.error("bad update strategy situation");
                isFailed = true;
            }
        } else if (totalReadyPodNow < totalDesireReadyPod) {
            if (newReadyCount < desireCount.getNewReplicaCount()) {
                int rcCount = Math.min(desireCount.getNewReplicaCount(), newReadyCount + policy.getUpdateStep());
                nextTargetCount.setNewReplicaCount(rcCount);
            } else if (oldReadyCount < desireCount.getOldReplicaCount()) {
                int rcCount = Math.min(desireCount.getOldReplicaCount(), oldReadyCount + policy.getUpdateStep());
                nextTargetCount.setOldReplicaCount(rcCount);
            } else {
                logger.error("bad update strategy situation");
                isFailed = true;
            }
        } else {
            if (oldReadyCount <= desireCount.getOldReplicaCount()
                    && newReadyCount >= desireCount.getNewReplicaCount()) {
                // means update over
                return null;
            }
            if (newReadyCount < desireCount.getNewReplicaCount()) {
                int rcCount = Math.min(desireCount.getNewReplicaCount(), newReadyCount + policy.getUpdateStep());
                nextTargetCount.setNewReplicaCount(rcCount);
            }
            if (oldReadyCount > desireCount.getOldReplicaCount()) {
                int rcCount = Math.max(desireCount.getOldReplicaCount(), oldReadyCount - policy.getUpdateStep());
                nextTargetCount.setOldReplicaCount(rcCount);
            }
        }

        logger.debug("[SCHEDULE UPDATE]oldReadyCount=" + nextTargetCount.getOldReplicaCount()
                + ", newReadyCount=" + nextTargetCount.getNewReplicaCount());

        UpdatePolicy policy = generatePolicy(nextTargetCount);
        policy.setMaxTimeForReady(-1); // never timeout
        // policy.setMinPodReadyCount(totalDesireReadyPod - delta);
        if (isFailed) {
            policy.setMaxPodReadyCount(0);
        }
        return policy;
    }

    private UpdatePolicy generatePolicy(UpdateReplicationCount nextTargetCount) {
        UpdatePolicy updatePolicy = new UpdatePolicy(nextTargetCount);
        updatePolicy.setRemoveOldFirst(policy.isRemoveOldFirst());
        // delay is in millionseconds, <=0 for no delay
        updatePolicy.setFirstActionDelay(policy.getFirstActionDelay());
        updatePolicy.setSecondActionDelay(policy.getSecondActionDelay());
        updatePolicy.setMaxTimeForReady(policy.getMaxTimeForReady());
        updatePolicy.setCheckReadyPeriod(policy.getCheckReadyPeriod());
        // -1 means not set for min and max PodReadyCount
        updatePolicy.setMinPodReadyCount(policy.getMinPodReadyCount());
        updatePolicy.setMaxPodReadyCount(policy.getMaxPodReadyCount());
        return updatePolicy;
    }
}
