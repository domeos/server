package org.domeos.framework.engine.k8s.updater;

import org.apache.log4j.Logger;
import org.domeos.framework.engine.k8s.model.UpdatePolicy;
import org.domeos.framework.engine.k8s.model.UpdateReplicationCount;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.util.PodUtils;

/**
 * Created by anningluo on 2015/12/15.
 */
class RollingUpdateStrategy implements UpdateStrategy {
    private static Logger logger = Logger.getLogger(RollingUpdateStrategy.class);

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
                nextTargetCount.setOldReplicaCount(oldReadyCount - 1);
            } else if (newReadyCount > desireCount.getNewReplicaCount()) {
                nextTargetCount.setNewReplicaCount(newReadyCount - 1);
            } else {
                // fatal
                logger.fatal("bad update strategy situation");
                isFailed = true;
            }
        } else if (totalReadyPodNow < totalDesireReadyPod) {
            if (newReadyCount < desireCount.getNewReplicaCount()) {
                nextTargetCount.setNewReplicaCount(newReadyCount + 1);
            } else if (oldReadyCount < desireCount.getOldReplicaCount()) {
                nextTargetCount.setOldReplicaCount(oldReadyCount + 1);
            } else {
                logger.fatal("bad update strategy situation");
                isFailed = true;
            }
        } else {
            if (oldReadyCount <= desireCount.getOldReplicaCount()
                    && newReadyCount >= desireCount.getNewReplicaCount()) {
                // means update over
                return null;
            }
            if (newReadyCount < desireCount.getNewReplicaCount()) {
                nextTargetCount.setNewReplicaCount(newReadyCount + 1);
            }
            if (oldReadyCount > desireCount.getOldReplicaCount()) {
                nextTargetCount.setOldReplicaCount(oldReadyCount - 1);
            }
        }

        logger.debug("[SCHEDULE UPDATE]oldReadyCount=" + nextTargetCount.getOldReplicaCount()
                + ", newReadyCount=" + nextTargetCount.getNewReplicaCount());
        UpdatePolicy policy = new UpdatePolicy(nextTargetCount);
        policy.setMaxTimeForReady(-1); // never timeout
        // policy.setMinPodReadyCount(totalDesireReadyPod - delta);
        if (isFailed) {
            policy.setMaxPodReadyCount(0);
        }

        return policy;
    }
}
