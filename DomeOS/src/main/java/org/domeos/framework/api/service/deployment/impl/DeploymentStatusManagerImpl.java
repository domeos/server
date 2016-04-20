package org.domeos.framework.api.service.deployment.impl;

import org.apache.log4j.Logger;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.api.model.deployment.*;
import org.domeos.framework.api.biz.deployment.impl.DeployEventBizImpl;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.engine.k8s.judgement.FailedJudgement;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.definitions.v1.ReplicationController;
import org.domeos.client.kubernetesclient.definitions.v1.ReplicationControllerList;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.client.kubernetesclient.util.RCUtils;
import org.domeos.client.kubernetesclient.util.filter.Filter;
import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdater;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdaterManager;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.text.ParseException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static org.domeos.framework.api.service.deployment.impl.DeploymentServiceImpl.buildRCLabel;
import static org.domeos.framework.api.service.deployment.impl.DeploymentServiceImpl.buildRCSelector;

/**
 * Created by anningluo on 2015/12/19.
 */
@Service("deploymentStatusManager")
public class DeploymentStatusManagerImpl implements DeploymentStatusManager {

    // TODO(sparkchen)
    // Check event method need to be redesign
    @Autowired
    private DeployEventBizImpl eventBiz;

    @Autowired
    private DeploymentStatusBiz deploymentStatusBiz;

    @Autowired
    private DeploymentBiz deploymentBiz;

    @Autowired
    private ClusterBiz clusterBiz;

    @Autowired
    private VersionBiz versionBiz;

    private static DeploymentUpdaterManager updaterManager = new DeploymentUpdaterManager();

    private static ExecutorService executors = Executors.newCachedThreadPool();
    private static ScheduledExecutorService monitorExectors = Executors.newSingleThreadScheduledExecutor();
    private static boolean isMonitorStart = false;
    private static Logger logger = Logger.getLogger(DeploymentStatusManagerImpl.class);
    private static FailedJudgement judgement = new FailedJudgement();

    // in ms
    private static long expirePeriod = 10 * 60 * 1000;
    private static long checkPeriod = 5000;
    // private ConcurrentLinkedQueue<Runnable> queue = new ConcurrentLinkedQueue<>();

    void setExpirePeriod(long expirePeriod) {
        this.expirePeriod = expirePeriod;
    }

    void setCheckPeriod(long checkPeriod) {
        this.checkPeriod = checkPeriod;
    }

    public DeploymentStatusManagerImpl() {
        if (!isMonitorStart) {
            try {
                // executors.submit(new EventMonitor());
                monitorExectors.scheduleAtFixedRate(new EventMonitor(), 30000, checkPeriod, TimeUnit.MILLISECONDS);
            } catch (Exception e) {
                logger.fatal("start deployment monitor thread failed\n" + e);
            }
            isMonitorStart = true;
        }
    }

    public void registerStartEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> dstSnapshot)
            throws DeploymentEventException, IOException {
        // ** check event status and deploy status
        DeployEvent event = eventBiz.getNewestEventByDeployId(deployId);
        DeploymentStatus deploymentStatus = deploymentStatusBiz.getDeploymentStatus(deployId);
        if (event != null && !isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }
        if (deploymentStatus == null) {
            throw new DeploymentEventException("no history deployment status found, status must be STOP");
        }
//        if (event != null && deploymentStatus != null && deploymentStatus != DeploymentStatus.STOP) {
//            throw new DeploymentEventException("latest deploy status is " + deploymentStatus.name()
//                + ". status must be STOP or null");
//        }
        // ** build and register
        deploymentStatusBiz.setDeploymentStatus(deployId, DeploymentStatus.DEPLOYING);
        event = buildStartEvent(deployId, user, dstSnapshot);
        eventBiz.createEvent(event);
    }

    public void registerStopEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot)
            throws DeploymentEventException, IOException {
        // ** check event status and deploy status
        DeployEvent event = eventBiz.getNewestEventByDeployId(deployId);
        DeploymentStatus deploymentStatus = deploymentStatusBiz.getDeploymentStatus(deployId);
        if (event == null) {
            throw new DeploymentEventException("no history event found, no start record");
        }
        if (deploymentStatus == null) {
            throw new DeploymentEventException("no history deployment status found, no start record");
        }
        if (!isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }
        // if (deploymentStatus != DeploymentStatus.RUNNING) {
//        if (deploymentStatus != DeploymentStatus.RUNNING && deploymentStatus != DeploymentStatus.ERROR) {
//            throw new DeploymentEventException("latest deploy status is " + deploymentStatus.name()
//                    + ". status must be RUNNING or ERROR");
//        }
        // ** build and register
        deploymentStatusBiz.setDeploymentStatus(deployId, DeploymentStatus.STOPPING);
        event = buildStopEvent(deployId, user, srcSnapshot, currentSnapshot);
        eventBiz.createEvent(event);
    }

    public void registerStartUpdateEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot
    ) throws IOException, DeploymentEventException {
        // ** check event status and deploy status
        DeployEvent event = eventBiz.getNewestEventByDeployId(deployId);
        DeploymentStatus deploymentStatus = deploymentStatusBiz.getDeploymentStatus(deployId);
        if (event == null) {
            throw new DeploymentEventException("no history event found, no start record");
        }
        if (deploymentStatus == null) {
            throw new DeploymentEventException("no history deployment status found, no start record");
        }
        if (!isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }
//        if (deploymentStatus != DeploymentStatus.RUNNING) {
//            throw new DeploymentEventException("latest deploy status is " + deploymentStatus.name()
//                    + ". status must be RUNNING");
//        }
        // ** build and register
        deploymentStatusBiz.setDeploymentStatus(deployId, DeploymentStatus.UPDATING);
        event = buildStartUpdateEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        eventBiz.createEvent(event);
    }

    public void registerScaleUpEvent (
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot
    ) throws IOException, DeploymentEventException {
        // ** check event status and deploy status
        DeployEvent event = eventBiz.getNewestEventByDeployId(deployId);
        DeploymentStatus deploymentStatus = deploymentStatusBiz.getDeploymentStatus(deployId);
        if (event == null) {
            throw new DeploymentEventException("no history event found, no start record");
        }
        if (deploymentStatus == null) {
            throw new DeploymentEventException("no history deployment status found, no start record");
        }
        if (!isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }
//        if (deploymentStatus != DeploymentStatus.RUNNING) {
//            throw new DeploymentEventException("latest deploy status is " + deploymentStatus.name()
//                    + ". status must be RUNNING");
//        }
        // ** build and register
        deploymentStatusBiz.setDeploymentStatus(deployId, DeploymentStatus.UPSCALING);
        event = buildScaleUpEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        eventBiz.createEvent(event);
    }

    public void registerScaleDownEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot
    ) throws IOException, DeploymentEventException {
        // ** check event status and deploy status
        DeployEvent event = eventBiz.getNewestEventByDeployId(deployId);
        DeploymentStatus deploymentStatus = deploymentStatusBiz.getDeploymentStatus(deployId);
        if (event == null) {
            throw new DeploymentEventException("no history event found, no start record");
        }
        if (deploymentStatus == null) {
            throw new DeploymentEventException("no history deployment status found, no start record");
        }
        if (!isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }
//        if (deploymentStatus != DeploymentStatus.RUNNING) {
//            throw new DeploymentEventException("latest deploy status is " + deploymentStatus.name()
//                    + ". status must be RUNNING");
//        }
        // ** build and register
        deploymentStatusBiz.setDeploymentStatus(deployId, DeploymentStatus.DOWNSCALING);
        event = buildScaleDownEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        eventBiz.createEvent(event);
    }

    public void registerStartRollbackEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot
    ) throws IOException, DeploymentEventException {
        // ** check event status and deploy status
        DeployEvent event = eventBiz.getNewestEventByDeployId(deployId);
        DeploymentStatus deploymentStatus = deploymentStatusBiz.getDeploymentStatus(deployId);
        if (event == null) {
            throw new DeploymentEventException("no history event found, no start record");
        }
        if (deploymentStatus == null) {
            throw new DeploymentEventException("no history deployment status found, no start record");
        }
        if (!isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }
//        if (deploymentStatus != DeploymentStatus.RUNNING && deploymentStatus != DeploymentStatus.ERROR) {
//            throw new DeploymentEventException("latest deploy status is " + deploymentStatus.name()
//                    + ". status must be RUNNING");
//        }
        // ** build and register
        deploymentStatusBiz.setDeploymentStatus(deployId, DeploymentStatus.BACKROLLING);
        event = buildStartRollbackEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        eventBiz.createEvent(event);
    }

    public void freshEvent(long eid, List<DeploymentSnapshot> currentSnapshot)
            throws IOException, DeploymentEventException {
        // ** get and check latest event
        DeployEvent event = eventBiz.getEvent(eid);
        if (event != null && isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }
        if (event == null) {
            throw new DeploymentEventException("could not find event(eid=" + eid + ")");
        }
        // ** update event
        long current = System.currentTimeMillis();
        event.setLastModify(current);
        event.setStatusExpire(current + expirePeriod);
        event.setEventStatus(DeployEventStatus.PROCESSING);
        event.setCurrentSnapshot(currentSnapshot);
        eventBiz.updateEvent(event.getEid(), event);
        // TODO(openxxs) check each operation internal status, such as STOPPING, UPDATING, DOWNSCALing, etc.
//        deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.DEPLOYING);
    }

    public void succeedEvent(long eid, List<DeploymentSnapshot> currentSnapshot)
            throws IOException, DeploymentEventException {
        // ** get and check latest event
        DeployEvent event = eventBiz.getEvent(eid);
        if (event != null && isEventTerminal(event)) {
            throw  new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                + event.getEid() + "is in status " + event.getEventStatus() + ", has terminated");
        }
        if (event == null) {
            throw new DeploymentEventException("could not find event(eid=" + eid + ")");
        }
        // ** update status
        long current = System.currentTimeMillis();
        event.setLastModify(current);
        event.setStatusExpire(current + expirePeriod);
        event.setEventStatus(DeployEventStatus.SUCCESS);
        event.setCurrentSnapshot(currentSnapshot);
        eventBiz.updateEvent(event.getEid(), event);
        if (event.getOperation() == DeployOperation.STOP) {
            deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.STOP);
        } else {
            deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.RUNNING);
        }
    }

    public void failedEvent(long eid, List<DeploymentSnapshot> currentSnapshot, String message)
            throws IOException, DeploymentEventException {
        // ** get and check latest event
        DeployEvent event = eventBiz.getEvent(eid);
        if (event != null && isEventTerminal(event)) {
//            deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.ERROR);
            throw  new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", has terminated");
        }
        if (event == null) {
//            deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.ERROR);
            throw new DeploymentEventException("could not find event(eid=" + eid + ")");
        }
        // ** update status
        long current = System.currentTimeMillis();
        event.setLastModify(current);
        event.setStatusExpire(current + expirePeriod);
        event.setEventStatus(DeployEventStatus.FAILED);
        event.setCurrentSnapshot(currentSnapshot);
        event.setMessage(message);
        eventBiz.updateEvent(event.getEid(), event);
        deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.ERROR);
    }

    public void failedEventForDeployment(int deploymentId, List<DeploymentSnapshot> currentSnapshot, String message)
        throws IOException, DeploymentEventException {
        try {
            failedEvent(eventBiz.getNewestEventByDeployId(deploymentId).getEid(), currentSnapshot, message);
        } catch (DeploymentEventException e) {
            deploymentStatusBiz.setDeploymentStatus(deploymentId, DeploymentStatus.ERROR);
            throw e;
        }
    }

    public DeployEvent buildEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot) {
        DeployEvent event = new DeployEvent();
        long startTime = System.currentTimeMillis();
        event.setStartTime(startTime);
        event.setLastModify(startTime);
        event.setStatusExpire(startTime + expirePeriod);
        event.setPrimarySnapshot(srcSnapshot);
        event.setCurrentSnapshot(currentSnapshot);
        event.setTargetSnapshot(dstSnapshot);
        event.setDeployId(deployId);
        event.setEventStatus(DeployEventStatus.START);
        event.setUserId(user.getId());
        event.setUserName(user.getUsername());
        return event;
    }

    public DeployEvent buildStartUpdateEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot) {
        DeployEvent event = buildEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        event.setOperation(DeployOperation.UPDATE);
        return event;
    }

    public DeployEvent buildStartEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> dstSnapshot) {
        List<DeploymentSnapshot> emptySnapshot = new LinkedList<>();
        DeployEvent event = buildEvent(deployId, user, emptySnapshot, emptySnapshot, dstSnapshot);
        event.setOperation(DeployOperation.START);
        return event;
    }

    public DeployEvent buildStopEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot) {
        List<DeploymentSnapshot> emptySnapshot = new LinkedList<>();
        DeployEvent event = buildEvent(deployId, user, srcSnapshot, currentSnapshot, emptySnapshot);
        event.setOperation(DeployOperation.STOP);
        return event;
    }

    public DeployEvent buildStartRollbackEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot
    ) {
        DeployEvent event = buildEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        event.setOperation(DeployOperation.ROLLBACK);
        return event;
    }

    public DeployEvent buildScaleUpEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot
    ) {
        DeployEvent event = buildEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        event.setOperation(DeployOperation.SCALE_UP);
        return event;
    }

    public DeployEvent buildScaleDownEvent(
            int deployId,
            User user,
            List<DeploymentSnapshot> srcSnapshot,
            List<DeploymentSnapshot> currentSnapshot,
            List<DeploymentSnapshot> dstSnapshot
    ) {
        DeployEvent event = buildEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        event.setOperation(DeployOperation.SCALE_DOWN);
        return event;
    }

    public boolean isEventTerminal(DeployEvent event) {
        if (event == null || event.getEventStatus() == null) {
            return false;
        }
        if (event.getEventStatus() == DeployEventStatus.FAILED
                || event.getEventStatus() == DeployEventStatus.SUCCESS) {
            return true;
        }
        // todo : expire may be not consistence on different server
        //          it should use mysql time.
        /*
        if (event.getStatusExpire() < System.currentTimeMillis()) {
            return true;
        }
        */
        return false;
    }

    public DeploymentStatus getDeploymentStatus(int deployId) throws IOException {
        return deploymentStatusBiz.getDeploymentStatus(deployId);
    }


    public List<DeploymentSnapshot> queryCurrentSnapshot(int deploymentId)
            throws KubeResponseException, IOException, KubeInternalErrorException, DataBaseContentException {
        Deployment deployment = deploymentBiz.getDeployment(deploymentId);
        if (deployment == null) {
            throw new DataBaseContentException("get deployment with deployId=" + deploymentId + " failed.");
        }
        return DeploymentServiceImpl.queryCurrentSnapshot(buildKubeClient(deployment), deployment);
    }

    public List<DeploymentSnapshot> queryCurrentSnapshot(KubeClient client, Deployment deployment)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return DeploymentServiceImpl.queryCurrentSnapshot(client, deployment);
    }

    public class EventMonitor implements Runnable {
        @Override
        public void run() {
            try {
                List<DeployEvent> unfinishedEvent = null;
                if (eventBiz == null) {
                    return;
                }
                try {
                    unfinishedEvent = eventBiz.getUnfinishedEvent();
                } catch (Exception e) {
                    logger.error("monitor event failed when query unfinished event to mysql with message="
                            + e.getMessage());
                }
                if (unfinishedEvent == null) {
                    return;
                }
                for (DeployEvent event : unfinishedEvent) {
                    // todo : not sync on different server
                    if (event.getEventStatus() == DeployEventStatus.SUCCESS
                            || event.getEventStatus() == DeployEventStatus.FAILED) {
                        continue;
                    }
                    if (event.getStatusExpire() < System.currentTimeMillis()) {
                        executors.submit(new ExpiredEventExecutor(event));
                        continue;
                    }
                    switch (event.getOperation()) {
                        case START:
                        case SCALE_DOWN:
                        case SCALE_UP:
                            executors.submit(new BasicEventChecker(event));
                            break;
                        case STOP:
                            executors.submit(new StopEventChecker(event));
                            break;
                        case UPDATE:
                        case ROLLBACK:
                            executors.submit(new StartUpdateEventChecker(event));
                            break;
                    }
                }
            } catch (Exception e) {
                logger.error(e.getMessage());
            }
        }
    }

    public class ExpiredEventExecutor implements Runnable {
        private DeployEvent event;
        public ExpiredEventExecutor(DeployEvent event) {
            this.event = event;
        }
        @Override
        public void run() {
            try {
                failedEvent(event.getEid(), queryCurrentSnapshot(event.getDeployId()), "expired");
            } catch (IOException | DeploymentEventException | KubeResponseException | KubeInternalErrorException e) {
                logger.error("change expired event status failed, eid="
                        + event.getEid() + ", deploymentId=" + event.getDeployId()
                        + ", error message=" + e.getMessage());
            } catch (DataBaseContentException e) {
                logger.error("data base content error:" + e.getMessage());
            } catch (Exception e) {
                logger.error(e);
            }
        }
    }

    public class BasicEventChecker implements Runnable {
        private DeployEvent event;
        public BasicEventChecker(DeployEvent event) {
            this.event = event;
        }
        @Override
        public void run() {
            try {
                Deployment deployment = deploymentBiz.getDeployment(event.getDeployId());
                if (deployment == null) {
                    throw new DataBaseContentException("no deployment found for event="
                            + event.getDeployId() + " with deployId=" + event.getDeployId());
                }
                KubeClient client = buildKubeClient(deployment);
                List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshot(client, deployment);
                List<DeploymentSnapshot> desiredSnapshot = event.getTargetSnapshot();
                if (currentSnapshot == null && judgement.isExpireForEventNotReallyHappen(event.getStartTime())) {
                    failedEvent(event.getEid(), null, "no replication controller found for event(eid="
                            + event.getEid() +  ")");
                    return;
                }
                if (desiredSnapshot == null) {
                    failedEvent(event.getEid(), currentSnapshot, "null desired snapshot");
                    return;
                }
                List<DeploymentSnapshot> desiredSnapshotInKubernetes =
                        DeploymentServiceImpl.queryDesiredSnapshot(client, deployment);
                if (!isSnapshotEquals(desiredSnapshot, desiredSnapshotInKubernetes)
                        && judgement.isExpireForEventNotReallyHappen(event.getStartTime())) {
                    failedEvent(event.getEid(), currentSnapshot, "the desiredSnapshot is not equals with the"
                        + " desiredSnapshot in kubernetes event will be mark to failed(eid=" + event.getEid()
                            + ")");
                    return;
                }
                for (DeploymentSnapshot deploymentSnapshot : desiredSnapshot) {
                    if (checkAnyPodFailed(event.getDeployId(), deploymentSnapshot.getVersion())) {
                        failedEvent(event.getEid(), currentSnapshot, "one of pod is start failed");
                        return;
                    }
                }
                if (isSnapshotEquals(currentSnapshot, event.getTargetSnapshot())) {
                    succeedEvent(event.getEid(), currentSnapshot);
                } else {
                    freshEvent(event.getEid(), currentSnapshot);
                }
            } catch (KubeResponseException | IOException | KubeInternalErrorException | DeploymentEventException e) {
                logger.error("internal error occur when check start event status, message=" + e.getMessage());
            } catch (DataBaseContentException e) {
                logger.error("data base content error:" + e.getMessage());
            } catch (Exception e) {
                logger.error(e);
            }
        }
    }

    public class StopEventChecker implements Runnable {
        private DeployEvent event;
        public StopEventChecker(DeployEvent event) {
            this.event = event;
        }
        @Override
        public void run() {
            try {
                List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshot(event.getDeployId());
                if (currentSnapshot == null || currentSnapshot.isEmpty()) {
                    succeedEvent(event.getEid(), currentSnapshot);
                    return;
                }
                Deployment deployment = deploymentBiz.getDeployment(event.getDeployId());
                if (deployment == null) {
                    throw new DataBaseContentException("no deployment found for event="
                            + event.getDeployId() + " with deployId=" + event.getDeployId());
                }
                KubeClient client = buildKubeClient(deployment);
                ReplicationControllerList rcList = client.listReplicationController(buildRCLabel(deployment));
                if (rcList != null && rcList.getItems() != null && rcList.getItems().length != 0) {
                    for (ReplicationController rc : rcList.getItems()) {
                        client.deleteReplicationController(RCUtils.getName(rc));
                    }
                    freshEvent(event.getEid(), currentSnapshot);
                    return;
                }
                PodList podList = client.listPod(buildRCSelector(deployment));
                if (podList != null && podList.getItems() != null && podList.getItems().length != 0) {
                    for (Pod pod : podList.getItems()) {
                        client.deletePod(PodUtils.getName(pod));
                    }
                    freshEvent(event.getEid(), currentSnapshot);
                }
            } catch (KubeResponseException | IOException | KubeInternalErrorException | DeploymentEventException e) {
                logger.error("internal error occur when check stop event status, message=" + e.getMessage());
            } catch (DataBaseContentException e) {
                logger.error("data base content error:" + e.getMessage());
            } catch (Exception e) {
                logger.error(e);
            }
        }
    }

    public class StartUpdateEventChecker implements Runnable {
        private DeployEvent event;
        public StartUpdateEventChecker(DeployEvent event) {
            this.event = event;
        }
        @Override
        public void run() {
            try {
                DeploymentUpdater updater = updaterManager.getUpdater(event.getDeployId());
                if (updater == null) {
                    return;
                }
                List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshot(event.getDeployId());
                DeploymentUpdateStatus currentStatus = updater.getStatus();
                if (currentStatus.getPhase() == DeploymentUpdatePhase.Failed) {
                    failedEvent(event.getEid(), currentSnapshot, currentStatus.getReason());
                } else if (currentStatus.getPhase() == DeploymentUpdatePhase.Succeed) {
                    // has terminated
                    succeedEvent(event.getEid(), currentSnapshot);
                } else {
                    freshEvent(event.getEid(), currentSnapshot);
                }
            } catch (KubeResponseException | IOException | KubeInternalErrorException | DeploymentEventException e) {
                logger.error("internal error occur when check stop event status, message=" + e.getMessage());
            } catch (DataBaseContentException e) {
                logger.error("data base content error:" + e.getMessage());
            } catch (Exception e) {
                logger.error(e);
            }
        }
    }

    public static boolean isSnapshotEquals(List<DeploymentSnapshot> one, List<DeploymentSnapshot> another) {
        if (one == null || another == null) {
            return false;
        }
        Map<Long, Long> versionCount = new HashMap<>();
        for (DeploymentSnapshot deploymentSnapshot : one) {
            if (deploymentSnapshot.getReplicas() > 0) {
                // ignore zero replicas
                versionCount.put(deploymentSnapshot.getVersion(), deploymentSnapshot.getReplicas());
            }
        }
        for (DeploymentSnapshot deploymentSnapshot : another) {
            if (deploymentSnapshot.getReplicas() <= 0) {
                // ignore zero replicas
                continue;
            }
            if (!versionCount.containsKey(deploymentSnapshot.getVersion())) {
                return false;
            }
            if (versionCount.get(deploymentSnapshot.getVersion()) != deploymentSnapshot.getReplicas()) {
                return false;
            }
            versionCount.remove(deploymentSnapshot.getVersion());
        }
        return versionCount.isEmpty();
    }

    public boolean checkAnyPodFailed(int deploymentId, long versionId)
            throws IOException, KubeResponseException, ParseException, KubeInternalErrorException {
        Deployment deployment = deploymentBiz.getDeployment(deploymentId);
        Version version = versionBiz.getVersion(deploymentId, versionId);
        return checkAnyPodFailed(deployment, version);
    }

    public boolean checkAnyPodFailed(Deployment deployment, Version version)
            throws KubeResponseException, IOException, KubeInternalErrorException, ParseException {
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        String clusterApiServer = cluster.getApi();
        KubeClient client = new KubeClient(clusterApiServer, deployment.getNamespace());
        Map<String, String> rcSelector = DeploymentServiceImpl.buildRCSelectorWithSpecifyVersion(deployment, version);
        PodList podList = client.listPod(rcSelector);
        Filter.getPodNotTerminatedFilter().filter(podList);
        return judgement.isAnyFailed(podList);
    }

    public KubeClient buildKubeClient(Deployment deployment) throws DataBaseContentException {
        if (deployment == null) {
            return null;
        }
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw new DataBaseContentException("no cluster found for deployId="
                    + deployment.getName() + ", clusterId = " + deployment.getClusterId());
        }
        String clusterApiServer = cluster.getApi();
        return new KubeClient(clusterApiServer, deployment.getNamespace());
    }
}
