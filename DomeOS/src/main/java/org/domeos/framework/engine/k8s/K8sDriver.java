package org.domeos.framework.engine.k8s;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.log4j.Logger;
import org.domeos.api.model.deployment.DeploymentUpdatePhase;
import org.domeos.api.model.deployment.DeploymentUpdateStatus;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.client.kubernetesclient.util.RCUtils;
import org.domeos.client.kubernetesclient.util.filter.Filter;
import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.biz.deployment.impl.DeployEventBiz;
import org.domeos.framework.api.biz.deployment.impl.DeployEventBizImpl;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.consolemodel.deployment.InnerServiceDraft;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.api.service.deployment.impl.DeploymentServiceImpl;
import org.domeos.framework.engine.RuntimeDriver;
import org.domeos.framework.engine.k8s.judgement.FailedJudgement;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdater;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdaterManager;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.text.ParseException;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static org.domeos.framework.api.service.deployment.impl.DeploymentServiceImpl.buildRCLabel;
import static org.domeos.framework.api.service.deployment.impl.DeploymentServiceImpl.buildRCSelector;

/**
 * Created by sparkchen on 16/4/8.
 */
public class K8sDriver implements RuntimeDriver {
    private Logger logger = Logger.getLogger(K8sDriver.class);
    private Cluster cluster;
    private Map<Integer, Deployment> allDeploys = new HashMap<>();
    private ExecutorService executors = Executors.newCachedThreadPool();
    private ScheduledExecutorService monitorExectors = Executors.newSingleThreadScheduledExecutor();
    private DeploymentUpdaterManager updaterManager = new DeploymentUpdaterManager();

    private DeploymentStatusManager deploymentStatusManager;
    private FailedJudgement judgement = new FailedJudgement();
    private long expirePeriod = 10 * 60 * 1000;
    private long checkPeriod = 5000;

    private DeployEventBiz eventBiz;
    private DeploymentStatusBiz statusBiz;


    public void setDeploymentStatusManager(DeploymentStatusManager deploymentStatusManager) {
        this.deploymentStatusManager = deploymentStatusManager;
    }

    @Override
    public void init(Cluster cluster, List<Deployment> allDeployment, DeployEventBiz eventBiz, DeploymentStatusBiz statusBiz) {
        this.cluster = cluster;
        for (Deployment deployment: allDeployment) {
            allDeploys.put(deployment.getId(), deployment);
        }
        monitorExectors.scheduleAtFixedRate(new EventMonitor(), 30000, checkPeriod, TimeUnit.MILLISECONDS);
        this.eventBiz = eventBiz;
        this.statusBiz = statusBiz;
    }

    @Override
    public void updateList(Cluster cluster, List<Deployment> allDeployment) {
        this.cluster = cluster;

    }
    public static List<DeploymentSnapshot> buildSingleDeploymentSnapshot(long version, int replicas) {
        List<DeploymentSnapshot> snapshots = new LinkedList<>();
        snapshots.add(new DeploymentSnapshot(version, replicas));
        return snapshots;
    }

    @Override
    public void startDeploy(Deployment deployment, Version version, User user, List<LoadBalancer> lbs) throws JsonProcessingException {
        List<DeploymentSnapshot> dstSnapshot = buildSingleDeploymentSnapshot(version.getVersion(), deployment.getDefaultReplicas());
        List<DeploymentSnapshot> emptySnapshot = new ArrayList<>();
        DeployEvent event = buildEvent(deployment.getId(), user, emptySnapshot, emptySnapshot, dstSnapshot);
        event.setOperation(DeployOperation.START);
        eventBiz.createEvent(event);

        KubeClient client;
        try {
            // ** get namespace
            String namespace = deployment.getNamespace();
            int deploymentId = deployment.getId();
            // ** create kubernetes client
            client = new KubeClient(cluster.getApi(), namespace);
            List<Node> nodeList = new LinkedList<>();
            List<String> nodeIpList = new LinkedList<>();
            if (deployment.isStateful()) {
                // can not use now!!!!!!!!!!!!!!!!!!!!
                for (int i = 0, size = version.getHostList().size(); i != size; i++) {
                    Node node = client.nodeInfo(version.getHostList().get(i));
                    if (node == null) {
                        String message = "no node found for " + version.getHostList().get(i);
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                            message);
                        throw new ApiException(ResultStat.DEPLOYMENT_START_FAILED, message);
                    } else if (node.getMetadata() == null || node.getMetadata().getAnnotations() == null
                        || !node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR)) {
                        String message = "no disk found on node";
                        if (node.getMetadata() != null) {
                            message +=  node.getMetadata().getName();
                        }
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                            message);
                        throw new ApiException(ResultStat.DEPLOYMENT_START_FAILED, message);
                    } else if (node.getStatus().getAddresses() == null
                        || node.getStatus().getAddresses().length == 0) {
                        String message = "no ip found for node=" + node.getMetadata().getName();
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                            message);
                        throw new ApiException(ResultStat.DEPLOYMENT_START_FAILED, message);
                    }
                    // ** found node ip
                    nodeList.add(i, node);
                    String nodeIp = null;
                    for (NodeAddress address : node.getStatus().getAddresses()) {
                        nodeIp = address.getAddress();
                        if (address.getType().equals("InternalIP")) {
                            break;
                        }
                    }
                    nodeIpList.add(i, nodeIp);

                    // ** continue only when HOST mode
                    if (deployment.getNetworkMode() == NetworkMode.HOST) {
                        continue;
                    }
                    // TODO (sparkchen)
                    // ** load balance
//                    List<LoadBalanceDraft> loadBalanceDraftList = deployment.getLoadBalanceDrafts();
//                    modifyExternalIPs(loadBalanceDraftList, nodeIp);
//                    org.domeos.client.kubernetesclient.definitions.v1.Service service =  buildStatefulService(loadBalanceDraftList, deployment, i);
//                    new KubeUtil(client).deleteService(service.getMetadata().getLabels());
//                    client.createService(service);
                }
//                for (int i = 0; i != version.getHostList().size(); i++) {
//                    Node node = nodeList.get(i);
//                    List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
//                    ReplicationController rc = buildReplicationController(deployment, version, i, nodeIpList, allExtraEnvs);
//                    if (rc == null) {
//                        String message = "build replication controller of stateful deployment failed";
//                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
//                                message);
//                        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, message);
//                    }
//                    addDataVolumes(rc, node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR), version.getVolumes());
//                    client.createReplicationController(rc);
//                }
            } else {
//                // ** build replication controller
//                List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
//                //  ReplicationController rc = buildReplicationController(deployment, version, allExtraEnvs);
//                ReplicationController rc = new RcBuilder(deployment,null, version, allExtraEnvs).build();
//                if (rc == null || rc.getSpec() == null) {
//                    String message = "build replication controller failed";
//                    deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
//                        message);
//                    return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, message);
//                }
//                rc.getSpec().setReplicas(replicas);
//                // ** create
//                client.createReplicationController(rc);
//                // ** load balance
//                List<LoadBalancer> loadBalancers = loadBalancerBiz.getLBSByDeploy(deploymentId);
//                for (LoadBalancer loadBalancer : loadBalancers) {
//                    if (loadBalancer.getType() == LoadBalanceType.EXTERNAL_SERVICE) {
//                        org.domeos.client.kubernetesclient.definitions.v1.Service service =
//                            buildServiceForStateless(loadBalancer, deployment);
//                        if (service == null || service.getMetadata() == null
//                            || service.getMetadata().getLabels() == null) {
//                            String message = "build service for deployId=" + deployId + " failed";
//                            deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
//                                message);
//                            return ResultStat.DEPLOYMENT_START_FAILED.wrap(message);
//                        }
//                        new KubeUtil(client).deleteService(service.getMetadata().getLabels());
//                        client.createService(service);
//                    } else if (loadBalancer.getType() == LoadBalanceType.INNER_SERVICE) {
//                        InnerServiceDraft innerServiceDraft = new InnerServiceDraft(loadBalancer);
//                        List<InnerServiceDraft> innerServiceDraftList = new ArrayList<>();
//                        innerServiceDraftList.add(innerServiceDraft);
//                        org.domeos.client.kubernetesclient.definitions.v1.Service service =
//                            buildInnerService(innerServiceDraftList, deployment);
//                        if (service == null || service.getMetadata() == null || service.getMetadata().getLabels() == null) {
//                            String message = "build internal service for deployId=" + deployId + " failed";
//                            deploymentStatusManager.failedEventForDeployment(deploymentId,
//                                queryCurrentSnapshot(client, deployment), message);
//                            return ResultStat.DEPLOYMENT_START_FAILED.wrap(message);
//                        }
//                        new KubeUtil(client).deleteService(service.getMetadata().getLabels());
//                        client.createService(service);
//                    }
//                }

            }
        } catch (KubeInternalErrorException e) {
//            deploymentStatusManager.failedEventForDeployment(deployId,
//                null, // queryCurrentSnapshot(client, deployment),
//                e.getMessage());
    //        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, e.getMessage());
        } catch (KubeResponseException e)  {
//            deploymentStatusManager.failedEventForDeployment(deployId,
//                null, // queryCurrentSnapshot(client, deployment),
//                e.getStatus().getMessage());
    //        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, e.getStatus().getMessage());
        } catch (Exception e) {
//            deploymentStatusManager.failedEventForDeployment(deployId,
//                null,
//                e.getMessage());
    //        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, e.getMessage());
        }


    }

    @Override
    public void stopDeploy(Deployment deployment) {

    }

    @Override
    public void rollbackDeploy(Deployment deployment) {

    }

    @Override
    public void startUpdate(Deployment deployment, long version, int replicas) {

    }

    @Override
    public void scaleUpDeployment(Deployment deployment, long version, int replicas) {

    }

    @Override
    public void scaleDownDeployment(Deployment deployment, long version, int replicas) {

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
                Deployment deployment = allDeploys.get(event.getDeployId());
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
                Deployment deployment = allDeploys.get(event.getDeployId());
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


    public List<DeploymentSnapshot> queryCurrentSnapshot(int deploymentId)
        throws KubeResponseException, IOException, KubeInternalErrorException, DataBaseContentException {
        Deployment deployment = allDeploys.get(deploymentId);
        if (deployment == null) {
            throw new DataBaseContentException("get deployment with deployId=" + deploymentId + " failed.");
        }
        return DeploymentServiceImpl.queryCurrentSnapshot(buildKubeClient(deployment), deployment);
    }

    public List<DeploymentSnapshot> queryCurrentSnapshot(KubeClient client, Deployment deployment)
        throws KubeResponseException, IOException, KubeInternalErrorException {
        return DeploymentServiceImpl.queryCurrentSnapshot(client, deployment);
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

    public boolean checkAnyPodFailed(int deploymentId, long versionV)
        throws IOException, KubeResponseException, ParseException, KubeInternalErrorException {
        Deployment deployment = allDeploys.get(deploymentId);
        return checkAnyPodFailed(deployment, versionV);
    }

    public boolean checkAnyPodFailed(Deployment deployment, long versionV)
        throws KubeResponseException, IOException, KubeInternalErrorException, ParseException {
        String clusterApiServer = cluster.getApi();
        KubeClient client = new KubeClient(clusterApiServer, deployment.getNamespace());
        Map<String, String> rcSelector = buildRCSelectorWithSpecifyVersion(deployment, versionV);
        PodList podList = client.listPod(rcSelector);
        Filter.getPodNotTerminatedFilter().filter(podList);
        return judgement.isAnyFailed(podList);
    }
    public Map<String, String> buildRCSelectorWithSpecifyVersion(Deployment deployment, long versionV) {
        Map<String, String> selector = buildRCSelector(deployment);
        selector.put(GlobalConstant.VERSION_STR, String.valueOf(versionV));
        return selector;
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
    public KubeClient buildKubeClient(Deployment deployment) throws DataBaseContentException {
        if (deployment == null) {
            return null;
        }
        String clusterApiServer = cluster.getApi();
        return new KubeClient(clusterApiServer, deployment.getNamespace());
    }
    public void failedEvent(long eid, List<DeploymentSnapshot> currentSnapshot, String message)
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
        event.setEventStatus(DeployEventStatus.FAILED);
        event.setCurrentSnapshot(currentSnapshot);
        event.setMessage(message);
        eventBiz.updateEvent(event.getEid(), event);
        statusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.ERROR);
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
        statusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.DEPLOYING);
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
            statusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.STOP);
        } else {
            statusBiz.setDeploymentStatus(event.getDeployId(), DeploymentStatus.RUNNING);
        }
    }

}
