package org.domeos.framework.api.service.deployment.impl;

import org.apache.log4j.Logger;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.biz.deployment.impl.DeployEventBizImpl;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.RuntimeDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

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

    private static ExecutorService executors = Executors.newCachedThreadPool();
    private static ScheduledExecutorService monitorExectors = Executors.newSingleThreadScheduledExecutor();
    private static boolean isMonitorStart = false;
    private static Logger logger = Logger.getLogger(DeploymentStatusManagerImpl.class);
    // in ms
    private static long expirePeriod = 10 * 60 * 1000;
    private static long checkPeriod = 5000;

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

    @Override
    public long registerEvent(int deployId, DeployOperation operation, User user, List<DeploymentSnapshot> srcSnapshot,
                              List<DeploymentSnapshot> currentSnapshot, List<DeploymentSnapshot> dstSnapshot) throws DeploymentEventException, IOException {
        // ** check event status and deploy status
        DeployEvent event = eventBiz.getNewestEventByDeployId(deployId);
        if (event == null && !operation.equals(DeployOperation.START)) {
            throw new DeploymentEventException("no history event found, no start record.");
        }
        if (event != null && !isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }

        event = buildEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
        event.setOperation(operation);
        return eventBiz.createEvent(event);
    }

    @Override
    public long registerAbortEvent(int deployId, User user) throws DeploymentEventException, IOException {
        // update current event
        DeployEvent currentEvent = eventBiz.getNewestEventByDeployId(deployId);
        if (currentEvent == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_ABORT_EVENT_FAILED, "There is no deploy event for deployment with deployId=" + deployId);
        }
        if (!currentEvent.getEventStatus().equals(DeployEventStatus.PROCESSING)) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_ABORT_EVENT_FAILED, "The newest deploy event status is "
                    + currentEvent.getEventStatus() + ", can not be aborted.");
        }
        DeployEvent abortEvent = buildEvent(deployId, user, currentEvent.getCurrentSnapshot(),
                currentEvent.getCurrentSnapshot(), currentEvent.getCurrentSnapshot());
        abortEvent.setMessage("abort");
        switch (currentEvent.getOperation()) {
            case START:
                abortEvent.setOperation(DeployOperation.ABORT_START);
                break;
            case UPDATE:
                abortEvent.setOperation(DeployOperation.ABORT_UPDATE);
                break;
            case ROLLBACK:
                abortEvent.setOperation(DeployOperation.ABORT_ROLLBACK);
                break;
            case SCALE_UP:
                abortEvent.setOperation(DeployOperation.ABORT_SCALE_UP);
                break;
            case SCALE_DOWN:
                abortEvent.setOperation(DeployOperation.ABORT_SCALE_DOWN);
                break;
            default:
                throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_ABORT_EVENT_FAILED, "The newest deploy event operation is "
                + currentEvent.getOperation() + ", can not be aborted.");
        }
        currentEvent.setEventStatus(DeployEventStatus.ABORTED);
        eventBiz.updateEvent(currentEvent);
        return eventBiz.createEvent(abortEvent);
    }

    @Override
    public void freshEvent(long eid, List<DeploymentSnapshot> currentSnapshot)
            throws IOException, DeploymentEventException {
        // ** get and check latest event
        DeployEvent event = eventBiz.getEvent(eid);
        if (event == null) {
            throw new DeploymentEventException("could not find event(eid=" + eid + ")");
        }
        if (isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", not terminated");
        }
        if (event.getEventStatus().equals(DeployEventStatus.START)) {
            // ** update event
            long current = System.currentTimeMillis();
            event.setLastModify(current);
            event.setStatusExpire(current + expirePeriod);
            event.setEventStatus(DeployEventStatus.PROCESSING);
            event.setCurrentSnapshot(currentSnapshot);
            eventBiz.updateEvent(event);
            switch (event.getOperation()) {
                case UPDATE:
                    deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.UPDATING);
                    break;
                case ROLLBACK:
                    deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.BACKROLLING);
                    break;
                case SCALE_UP:
                    deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.UPSCALING);
                    break;
                case SCALE_DOWN:
                    deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.DOWNSCALING);
                    break;
                case START:
                    deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.DEPLOYING);
                    break;
                case STOP:
                    deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.STOPPING);
                    break;
                case ABORT_START:
                case ABORT_UPDATE:
                case ABORT_ROLLBACK:
                case ABORT_SCALE_UP:
                case ABORT_SCALE_DOWN:
                    deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.ABORTING);
                    break;
                default:
                    throw new DeploymentEventException("event(id=" + event.getEid() + ") operation(" + event.getOperation()
                            + ") can not match any deployment status");
            }
        }
    }

    @Override
    public void succeedEvent(long eid, List<DeploymentSnapshot> currentSnapshot)
            throws IOException, DeploymentEventException {
        // ** get and check latest event
        DeployEvent event = eventBiz.getEvent(eid);
        if (event == null) {
            throw new DeploymentEventException("could not find event(eid=" + eid + ")");
        }
        if (isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + "is in status " + event.getEventStatus() + ", has terminated");
        }
        // update event status
        long current = System.currentTimeMillis();
        event.setLastModify(current);
        event.setStatusExpire(current + expirePeriod);
        event.setEventStatus(DeployEventStatus.SUCCESS);
        event.setCurrentSnapshot(currentSnapshot);
        event.setTargetSnapshot(currentSnapshot);
        eventBiz.updateEvent(event);
        // update deployment status
        switch (event.getOperation()) {
            case UPDATE:
            case ROLLBACK:
            case SCALE_UP:
            case SCALE_DOWN:
            case START:
            case ABORT_SCALE_UP:
            case ABORT_SCALE_DOWN:
                deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.RUNNING);
                break;
            case STOP:
            case ABORT_START:
                deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.STOP);
                break;
            case ABORT_UPDATE:
                deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.UPDATE_ABORTED);
                break;
            case ABORT_ROLLBACK:
                deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.BACKROLL_ABORTED);
                break;
            default:
                throw new DeploymentEventException("Can not update deployment status according to " + event.getOperation() + " event");
        }
    }

    @Override
    public void failedEvent(long eid, List<DeploymentSnapshot> currentSnapshot, String message)
            throws IOException, DeploymentEventException {
        // ** get and check latest event
        DeployEvent event = eventBiz.getEvent(eid);
        if (event == null) {
            throw new DeploymentEventException("could not find event(eid=" + eid + ")");
        }
        if (isEventTerminal(event)) {
            throw new DeploymentEventException("latest event(" + event.getOperation() + ") with eid="
                    + event.getEid() + " is in status " + event.getEventStatus() + ", has terminated");
        }
        // update event status
        event.setEventStatus(DeployEventStatus.FAILED);
        long current = System.currentTimeMillis();
        event.setLastModify(current);
        event.setStatusExpire(current + expirePeriod);
        event.setCurrentSnapshot(currentSnapshot);
        event.setMessage(message);
        eventBiz.updateEvent(event);
        // update deployment status
        deploymentStatusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.ERROR);
    }

    @Override
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

    public boolean isEventTerminal(DeployEvent event) {
        if (event == null || event.getEventStatus() == null) {
            return false;
        }
        if (event.getEventStatus().equals(DeployEventStatus.FAILED)
                || event.getEventStatus().equals(DeployEventStatus.SUCCESS)
                || event.getEventStatus().equals(DeployEventStatus.ABORTED)) {
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

    public boolean isDeploymentStatusTerminal(Deployment deployment) {
        if (deployment == null
                || deploymentStatusBiz.getDeploymentStatus(deployment.getId()).equals(DeploymentStatus.STOP)
                || deploymentStatusBiz.getDeploymentStatus(deployment.getId()).equals(DeploymentStatus.RUNNING)
                || deploymentStatusBiz.getDeploymentStatus(deployment.getId()).equals(DeploymentStatus.ERROR)
                || deploymentStatusBiz.getDeploymentStatus(deployment.getId()).equals(DeploymentStatus.UPDATE_ABORTED)
                || deploymentStatusBiz.getDeploymentStatus(deployment.getId()).equals(DeploymentStatus.BACKROLL_ABORTED)) {
            return true;
        }
        return false;
    }

    public class EventMonitor implements Runnable {
        @Override
        public void run() {
            try {
                List<Deployment> unfinishedStatusDeployments = deploymentBiz.listUnfinishedStatusDeployment();
                for (Deployment deployment : unfinishedStatusDeployments) {
                    DeployEvent event = eventBiz.getNewestEventByDeployId(deployment.getId());
                    if (!isDeploymentStatusTerminal(deployment) && (event == null || isEventTerminal(event))) {
                        deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.ERROR);
                    }
                }
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
                if (unfinishedEvent == null || unfinishedEvent.size() == 0) {
                    return;
                }
                for (DeployEvent event : unfinishedEvent) {
                    // todo : not sync on different server
                    if (isEventTerminal(event)) {
                        continue;
                    }
                    if (event.getStatusExpire() < System.currentTimeMillis()) {
                        executors.submit(new ExpiredEventExecutor(event));
                        continue;
                    }
                    executors.submit(new EventChecker(event));
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
                Deployment deployment = deploymentBiz.getDeployment(event.getDeployId());
                if (deployment == null) {
                    throw new DataBaseContentException("get deployment with deployId=" + event.getDeployId() + " failed.");
                }
                RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(deployment.getClusterId());
                driver.expiredEvent(deployment, event);
            } catch (IOException | DeploymentEventException | KubeResponseException | KubeInternalErrorException e) {
                logger.error("change expired event status failed, eid="
                        + event.getEid() + ", deploymentId=" + event.getDeployId()
                        + ", error message=" + e.getMessage());
            } catch ( DataBaseContentException e) {
                logger.error("data base content error:" + e.getMessage());
            } catch (Exception e) {
                logger.error(e);
            }
        }
    }

    public class EventChecker implements Runnable {
        private DeployEvent event;

        public EventChecker(DeployEvent event) {
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
                RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(deployment.getClusterId());
                switch (event.getOperation()) {
                    case START:
                    case SCALE_DOWN:
                    case SCALE_UP:
                        driver.checkBasicEvent(deployment, event);
                        break;
                    case STOP:
                        driver.checkStopEvent(deployment, event);
                        break;
                    case UPDATE:
                    case ROLLBACK:
                        driver.checkUpdateEvent(deployment, event);
                        break;
                    case ABORT_START:
                    case ABORT_UPDATE:
                    case ABORT_ROLLBACK:
                    case ABORT_SCALE_UP:
                    case ABORT_SCALE_DOWN:
                        driver.checkAbortEvent(deployment, event);
                        break;
                }
            } catch (KubeResponseException | IOException | KubeInternalErrorException | DeploymentEventException e) {
                logger.error("Check deploy event status error: " + e.getMessage());
            } catch (DataBaseContentException e) {
                logger.error("Data base content error:" + e.getMessage());
            } catch (Exception e) {
                logger.error(e.getMessage());
            }
        }
    }

    @Override
    public void checkStateAvailable(DeploymentStatus curState, DeploymentStatus dstState) {
        Set<DeploymentStatus> availables = new HashSet<>();
        switch (curState) {
            case DEPLOYING:
                availables.add(DeploymentStatus.RUNNING);
                availables.add(DeploymentStatus.ABORTING);
                availables.add(DeploymentStatus.ERROR);
                break;
            case STOP:
                availables.add(DeploymentStatus.DEPLOYING);
                break;
            case UPSCALING:
            case DOWNSCALING:
            case BACKROLLING:
            case UPDATING:
                availables.add(DeploymentStatus.ABORTING);
                availables.add(DeploymentStatus.ERROR);
                availables.add(DeploymentStatus.RUNNING);
                break;
            case ERROR:
            case UPDATE_ABORTED:
            case BACKROLL_ABORTED:
                availables.add(DeploymentStatus.BACKROLLING);
                availables.add(DeploymentStatus.UPDATING); // update or rollback depends on request version
                availables.add(DeploymentStatus.STOPPING);
                break;
            case STOPPING:
                availables.add(DeploymentStatus.STOP);
                availables.add(DeploymentStatus.ERROR);
                break;
            case RUNNING:
                availables.add(DeploymentStatus.STOPPING);
                availables.add(DeploymentStatus.UPDATING);
                availables.add(DeploymentStatus.BACKROLLING);
                availables.add(DeploymentStatus.UPSCALING);
                availables.add(DeploymentStatus.DOWNSCALING);
                break;
            case ABORTING:
                availables.add(DeploymentStatus.ERROR);
                availables.add(DeploymentStatus.STOP);
                availables.add(DeploymentStatus.RUNNING);
                availables.add(DeploymentStatus.UPDATE_ABORTED);
                availables.add(DeploymentStatus.BACKROLL_ABORTED);
                break;
        }
        if (!availables.contains(dstState)) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_STATUS_NOT_ALLOW, "Can not change to " + dstState.name() + " status from " + curState.name());
        }
    }
}
