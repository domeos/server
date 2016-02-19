package org.domeos.kubeutils.updater;

import org.apache.log4j.Logger;
import org.domeos.api.model.deployment.UpdatePhase;
import org.domeos.api.model.deployment.UpdatePolicy;
import org.domeos.api.model.deployment.UpdateReplicationCount;
import org.domeos.api.model.deployment.UpdateStatus;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.definitions.v1.ReplicationController;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.client.kubernetesclient.util.RCUtils;
import org.domeos.kubeutils.KubeUtil;

import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.RejectedExecutionException;

/**
 * Created by anningluo on 2015/12/14.
 */
public class ReplicationControllerUpdater {
    private static ExecutorService executor = Executors.newCachedThreadPool();
    private KubeClient client = null;
    private ReplicationController oldRC;
    private ReplicationController newRC;
    private UpdateStrategy strategy;
    private final UpdateStatus status = new UpdateStatus(UpdatePhase.Unknow, 0, 0);
    private Future updateFuture = null;
    private StatusChangeHandler<UpdateStatus> statusHandler;  // call every time status change
    private static final ReplicationControllerUpdater emptyUpdater = new ReplicationControllerUpdater();
    private static Logger logger = Logger.getLogger(ReplicationControllerUpdater.class);

    public static ReplicationControllerUpdater EmptyUpdater() {
        return emptyUpdater;
    }

    public static ReplicationControllerUpdater RollingUpdater(
            KubeClient client,
            ReplicationController oldRC,
            ReplicationController newRC,
            StatusChangeHandler<UpdateStatus> handler) {
        ReplicationControllerUpdater updater = new ReplicationControllerUpdater();
        updater.oldRC = oldRC;
        updater.oldRC.getMetadata().setResourceVersion(null);
        updater.newRC = newRC;
        updater.newRC.getMetadata().setResourceVersion(null);
        updater.oldRC.getSpec().setReplicas(0);
        updater.strategy = new RollingUpdateStrategy();
        updater.client = client;
        updater.statusHandler = handler;
        return updater;
    }

    public static ReplicationControllerUpdater RollingUpdater(
            KubeClient client,
            ReplicationController oldRC,
            ReplicationController newRC) {
        return RollingUpdater(client, oldRC, newRC, null);
    }

    public ReplicationControllerUpdater(
            KubeClient client,
            ReplicationController oldRC,
            ReplicationController newRC,
            UpdateStrategy strategy) {
        ReplicationControllerUpdater updater = new ReplicationControllerUpdater();
        updater.oldRC = oldRC;
        updater.oldRC.getMetadata().setResourceVersion(null);
        updater.newRC = newRC;
        updater.newRC.getMetadata().setResourceVersion(null);
        updater.strategy = strategy;
        updater.client = client;
    }

    private ReplicationControllerUpdater(){
    }

    public void start() {
        startIn(executor);
    }

    public void startIn(ExecutorService otherExecutor) {
        updateStart(oldRC.getSpec().getReplicas(), newRC.getSpec().getReplicas());
        try {
            updateFuture = otherExecutor.submit(new UpdateReplicationController());
        } catch (RejectedExecutionException | NullPointerException e) {
            updateFailed("start executor failed with message=" + e.getMessage());
        }
    }

    public void startSynchronized() {
        updateStart(oldRC.getSpec().getReplicas(), newRC.getSpec().getReplicas());
        updateRC();
    }

    public UpdateStatus getStatus() {
        UpdateStatus statusNow;
        synchronized (status) {
            if (updateFuture != null && updateFuture.isDone()
                    && status.getPhase() != UpdatePhase.Failed
                    && status.getPhase() != UpdatePhase.Successed) {
                status.setPhase(UpdatePhase.Failed);
                status.setReason("unknown reason for update thread terminated");
            }
            statusNow = new UpdateStatus(status);
        }
        return statusNow;
    }

    public void stop() {
        if (updateFuture == null || updateFuture.isDone()) {
            return;
        }
        updateFuture.cancel(false);
        if (!updateFuture.isDone()) {
            updateFuture.cancel(true);
        }
    }

    public void continueUpdate() {

    }

    public void close() {
        if (updateFuture.isDone() || updateFuture.isCancelled()) {
            return;
        }
        stop();
    }

    private void handleStatusChange() {
        if (statusHandler != null) {
            statusHandler.handleStatusChange(status);
        }
    }

    // **************************** implement ***************************
    public boolean updateRC() {
        if (oldRC == null || RCUtils.getName(oldRC) == null || RCUtils.getSelector(oldRC) == null
                || newRC == null || RCUtils.getName(newRC) == null || RCUtils.getSelector(newRC) == null) {
            return false;
        }
        // init
        UpdateReplicationCount desireCount = getDesireCount(oldRC, newRC);
        UpdatePolicy todo = null;
        boolean isSuccess = true;
        String reason = null;
        synchronized (status) {
            status.setPhase(UpdatePhase.Running);
            handleStatusChange();
        }

        try {
            // check replication controller
            // make sure old replication controller existed and create new replication controller if not
            // existed
            ReplicationController oldTmpRC = client.replicationControllerInfo(RCUtils.getName(oldRC));
            newRC.getSpec().setReplicas(0);
            ReplicationController newTmpRC = client.replicationControllerInfo(RCUtils.getName(newRC));
            if (oldTmpRC == null) {
                // old deployment not exist
                isSuccess = false;
                reason = "old replication controller " + RCUtils.getName(oldRC) + " is not exist";
            }
            if (newTmpRC == null && isSuccess) {
                newTmpRC = client.createReplicationController(newRC);
                isSuccess = newTmpRC != null;
                if (!isSuccess) {
                    reason = "create new replication controller " + RCUtils.getName(newRC) + " failed";
                }
            }
            if (!isSuccess) {
                updateFailed(reason);
                return false;
            }

            // do update
            do {
                if (todo != null) {
                    // update one
                    isSuccess = updateOne(todo, oldRC, newRC);
                    if (!isSuccess) {
                        // update failed
                        // status will change in updateOne internal, should here
                        return false;
                    }
                }
                PodList oldPodList = client.listPod(RCUtils.getSelector(oldRC));
                PodList newPodList = client.listPod(RCUtils.getSelector(newRC));
                todo = strategy.scheduleUpdate(desireCount, oldPodList, newPodList);
                if (logger.isDebugEnabled()) {
                    logger.debug("update one step further with policy " + todo);
                }
            } while (todo != null);

            // delete old replication controller
            if (desireCount.getOldReplicaCount() == 0) {
                UpdateReplicationCount readyCountNow = getDesireCount(oldRC, newRC);
                if (readyCountNow.getOldReplicaCount() != 0) {
                    updateFailed("desire old pod count is 0, but get " + readyCountNow.getOldReplicaCount()
                            + ", stop delete and fail update");
                    return false;
                }
                isSuccess = client.deleteReplicationController(RCUtils.getName(oldRC));
                if (!isSuccess) {
                    updateFailed("old replication controller delete failed");
                    return false;
                }
            }
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            updateFailed("Kubernetes failed with message=" + e.getMessage());
            // isSuccess = false;
            return false;
        }
        if (isSuccess) {
            synchronized (status) {
                status.setPhase(UpdatePhase.Successed);
                handleStatusChange();
            }
        }
        return isSuccess;
    }

    public boolean updateOne(UpdatePolicy policy, ReplicationController oldRC, ReplicationController newRC)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        if (!checkUpdateStatus(policy, oldRC, newRC)) {
            return false;
        }
        // first step
        if (policy.getFirstActionDelay() > 0) {
            try {
                Thread.sleep(policy.getFirstActionDelay());
            } catch (InterruptedException e) {
                // thread is interrupt, return
                updateFailed("thread is interrupted when before first step in two step update");
                return false;
            }
            if (!checkUpdateStatus(policy, oldRC, newRC)) {
                return false;
            }
        }
        ReplicationController actionTmpRC = null;
        if (policy.isRemoveOldFirst()) {
            actionTmpRC = oldRC;
            actionTmpRC.getSpec().setReplicas(policy.getOldReplicaCount());
        } else {
            actionTmpRC = newRC;
            actionTmpRC.getSpec().setReplicas(policy.getNewReplicaCount());
        }
        client.replaceReplicationController(RCUtils.getName(actionTmpRC), actionTmpRC);
        if (!waitForReady(policy, actionTmpRC, true)) {
            return false;
        }

        // second step
        if (policy.getSecondActionDelay() > 0) {
            try {
                Thread.sleep(policy.getSecondActionDelay());
            } catch (InterruptedException e) {
                // thread is interrupt, continue
                updateFailed("thread is interrupted when before second step in two step update");
                return false;
            }
        }
        if (!checkUpdateStatus(policy, oldRC, newRC)) {
            return false;
        }
        if (!policy.isRemoveOldFirst()) {
            actionTmpRC = oldRC;
            actionTmpRC.getSpec().setReplicas(policy.getOldReplicaCount());
        } else {
            actionTmpRC = newRC;
            actionTmpRC.getSpec().setReplicas(policy.getNewReplicaCount());
        }
        client.replaceReplicationController(RCUtils.getName(actionTmpRC), actionTmpRC);

        return waitForReady(policy, actionTmpRC, false) && checkUpdateStatus(policy, oldRC, newRC);
    }

    public boolean waitForReady(UpdatePolicy policy, ReplicationController rc, boolean isFirstAction)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        int desireInt = 0;
        if (isFirstAction ^ policy.isRemoveOldFirst()) {
            // for old
            desireInt = policy.getNewReplicaCount();
        } else {
            desireInt = policy.getOldReplicaCount();
        }
        long start = System.currentTimeMillis();
        KubeUtil kubeUtil = new KubeUtil(client);
        PodList tmpPodList = client.listPod(RCUtils.getSelector(rc));
        if (tmpPodList == null && desireInt != 0) {
            return false;
        }
        while (tmpPodList != null && (desireInt != PodUtils.getPodReadyNumber(tmpPodList.getItems())
                || desireInt != tmpPodList.getItems().length)) {
            kubeUtil.clearNotRunningPod(tmpPodList);
            /*
            try {
                if (failedJudgment.isAnyFailed(tmpPodList)) {
                    return false;
                }
            } catch (ParseException e) {
                String message = "parse pod start time failed";
                logger.error(message);
                updateFailed(message);
                return false;
            }
            */
            long waitTime = 0;
            if (policy.getMaxTimeForReady() < 0) {
                waitTime = policy.getCheckReadyPeriod();
            } else {
                waitTime = Math.min(policy.getCheckReadyPeriod(),
                        policy.getMaxTimeForReady() - System.currentTimeMillis() + start);
            }
            if (waitTime < 0) {
                updateFailed("wait for once update ready timeout");
                return false;
            }
            try {
                Thread.sleep(waitTime);
            } catch (InterruptedException e) {
                updateFailed("thread is interrupted in waiting for once update ready");
                return false;
            }
            tmpPodList = client.listPod(RCUtils.getSelector(rc));
            if (tmpPodList == null && desireInt != 0) {
                return false;
            }
        }
        return true;
    }

    public UpdateReplicationCount getPodReadyCount(ReplicationController oldRC, ReplicationController newRC)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        PodList oldPods = client.listPod(RCUtils.getSelector(oldRC));
        PodList newPods = client.listPod(RCUtils.getSelector(newRC));
        return new UpdateReplicationCount(PodUtils.getPodReadyNumber(oldPods.getItems()),
                PodUtils.getPodReadyNumber(newPods.getItems()));
    }

    /*
    public boolean checkUpdateResultStatus(UpdatePolicy policy, ReplicationController oldRC, ReplicationController newRC)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        UpdateReplicationCount readyCountNow = getUpdateStatus(oldRC, newRC);

    }
    */

    // this function is used to check condition in policy whether be satisfied
    public boolean checkUpdateStatus(UpdatePolicy policy, ReplicationController oldRC, ReplicationController newRC)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        UpdateReplicationCount readyCount = getPodReadyCount(oldRC, newRC);
        int totalReadyCountNow = readyCount.getNewReplicaCount() + readyCount.getOldReplicaCount();
        if ((policy.getMinPodReadyCount() > 0 && totalReadyCountNow < policy.getMinPodReadyCount())
                || (policy.getMaxPodReadyCount() > 0 && totalReadyCountNow > policy.getMaxPodReadyCount())) {
            updateFailed("check update status failed with oldPodReadyCount=" + readyCount.getOldReplicaCount()
                    + ", newPodReadyCount=" + readyCount.getNewReplicaCount() + ", but require minPodReadyCount="
                    + policy.getMinPodReadyCount() + ", maxPodReadCount=" + policy.getMaxPodReadyCount()
                );
            return false;
        }
        return true;
    }

/*
    public static boolean checkUpdateStatus(UpdatePolicy policy, UpdateReplicationCount readyCountNow) {
        int totalReadyCountNow = readyCountNow.getNewReplicaCount() + readyCountNow.getOldReplicaCount();
        if ((policy.getMinPodReadyCount() > 0 && totalReadyCountNow < policy.getMinPodReadyCount())
                || (policy.getMaxPodReadyCount() > 0 && totalReadyCountNow > policy.getMaxPodReadyCount())) {
            return false;
        }
        return true;
    }
*/
    public UpdateReplicationCount getDesireCount(ReplicationController oldRC, ReplicationController newRC) {
        return new UpdateReplicationCount(oldRC.getSpec().getReplicas() , newRC.getSpec().getReplicas());
    }

    public class UpdateReplicationController implements Runnable {
        @Override
        public void run() {
            updateRC();
        }
    }

    public void updateFailed(String reason) {
        logger.error("update failed for reason=" + reason);
        synchronized (status) {
            status.setPhase(UpdatePhase.Failed);
            status.setReason(reason);
            handleStatusChange();
        }
    }

    public void updateStart(int oldReplicas, int newReplicas) {
        synchronized (status) {
            status.setPhase(UpdatePhase.Starting);
            status.setOldReplicaCount(oldReplicas);
            status.setNewReplicaCount(newReplicas);
            handleStatusChange();
        }
    }
}

/*
class UpdateStrategyFactory {
    private Logger logger = Logger.getLogger(UpdateStrategyFactory.class);
    UpdateStrategy getUpdateStrategy(String strategyName) {
        try {
            Class classType = Class.forName(strategyName);
            return (UpdateStrategy)classType.newInstance();
        } catch (ClassNotFoundException | InstantiationException | IllegalAccessException e) {
            logger.fatal("create update strategy=" + strategyName + " failed");
            return null;
        }
    }
}
*/

