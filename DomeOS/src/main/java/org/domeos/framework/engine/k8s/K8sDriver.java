package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.*;
import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerBiz;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.consolemodel.deployment.InnerServiceDraft;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.engine.DeploymentUpdaterManager;
import org.domeos.framework.engine.RuntimeDriver;
import org.domeos.framework.engine.exception.DriverException;
import org.domeos.framework.engine.k8s.judgement.FailedJudgement;
import org.domeos.framework.engine.k8s.model.DeploymentUpdatePhase;
import org.domeos.framework.engine.k8s.model.DeploymentUpdateStatus;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdater;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.domeos.framework.engine.k8s.util.RCUtils;
import org.domeos.framework.engine.k8s.util.filter.Filter;
import org.domeos.global.GlobalConstant;
import org.domeos.util.MD5Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.text.ParseException;
import java.util.*;

/**
 * Created by sparkchen on 16/4/8.
 */
@Component
@Scope("prototype")
public class K8sDriver implements RuntimeDriver {
    private Logger logger = LoggerFactory.getLogger(K8sDriver.class);
    private Cluster cluster;
    private DeploymentUpdaterManager updaterManager = new DeploymentUpdaterManager();
    private FailedJudgement judgement = new FailedJudgement();

    @Autowired
    private DeploymentStatusManager deploymentStatusManager;
    @Autowired
    private DeployEventBiz deployEventBiz;
    @Autowired
    private DeploymentStatusBiz deploymentStatusBiz;
    @Autowired
    private DeploymentBiz deploymentBiz;
    @Autowired
    private VersionBiz versionBiz;
    @Autowired
    private LoadBalancerBiz loadBalancerBiz;

    @Override
    public RuntimeDriver init(Cluster cluster) {
        this.cluster = cluster;
        return this;
    }

    @Override
    public void updateList(Cluster cluster) {
        this.cluster = cluster;
    }

    private static List<DeploymentSnapshot> buildSingleDeploymentSnapshot(long version, int replicas) {
        List<DeploymentSnapshot> snapshots = new LinkedList<>();
        snapshots.add(new DeploymentSnapshot(version, replicas));
        return snapshots;
    }

    @Override
    public void startDeploy(Deployment deployment, Version version, User user, List<LoadBalancer> lbs, List<EnvDraft> allExtraEnvs)
            throws DriverException, DeploymentEventException, IOException {
        DeployEvent event = new DeployEvent(deployment.getId(), DeployOperation.START, DeployEventStatus.START, user,
                new ArrayList<DeploymentSnapshot>(), new ArrayList<DeploymentSnapshot>(), new ArrayList<DeploymentSnapshot>());
        long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                DeployOperation.START,
                user,
                null,
                null,
                buildSingleDeploymentSnapshot(version.getVersion(), deployment.getDefaultReplicas()));
        deploymentStatusManager.freshEvent(eventId, null);
        try {
            KubeUtils client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            if (deployment.isStateful()) {
//                List<Node> nodeList = new LinkedList<>();
//                List<String> nodeIpList = new LinkedList<>();
//                // can not use now!!!!!!!!!!!!!!!!!!!!
////                for (int i = 0, size = versionId.getHostList().size(); i != size; i++) {
////                    Node node = client.nodeInfo(versionId.getHostList().get(i));
////                    if (node == null) {
////                        String message = "no node found for " + versionId.getHostList().get(i);
////                        deploymentStatusManager.failedEventForDeployment(deployId, queryCurrentSnapshot(client, deployment),
////                            message);
////                        throw new ApiException(ResultStat.DEPLOYMENT_START_FAILED, message);
////                    } else if (node.getMetadata() == null || node.getMetadata().getAnnotations() == null
////                        || !node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR)) {
////                        String message = "no disk found on node";
////                        if (node.getMetadata() != null) {
////                            message +=  node.getMetadata().getName();
////                        }
////                        deploymentStatusManager.failedEventForDeployment(deployId, queryCurrentSnapshot(client, deployment),
////                            message);
////                        throw new ApiException(ResultStat.DEPLOYMENT_START_FAILED, message);
////                    } else if (node.getStatus().getAddresses() == null
////                        || node.getStatus().getAddresses().length == 0) {
////                        String message = "no ip found for node=" + node.getMetadata().getName();
////                        deploymentStatusManager.failedEventForDeployment(deployId, queryCurrentSnapshot(client, deployment),
////                            message);
////                        throw new ApiException(ResultStat.DEPLOYMENT_START_FAILED, message);
////                    }
////                    // ** found node ip
////                    nodeList.add(i, node);
////                    String nodeIp = null;
////                    for (NodeAddress address : node.getStatus().getAddresses()) {
////                        nodeIp = address.getAddress();
////                        if (address.getType().equals("InternalIP")) {
////                            break;
////                        }
////                    }
////                    nodeIpList.add(i, nodeIp);
////
////                    // ** continue only when HOST mode
////                    if (deployment.getNetworkMode() == NetworkMode.HOST) {
////                        continue;
////                    }
////                    // TODO (sparkchen)
////                    // ** load balance
//////                    List<LoadBalanceDraft> loadBalanceDraftList = deployment.getLoadBalanceDrafts();
//////                    modifyExternalIPs(loadBalanceDraftList, nodeIp);
//////                    org.domeos.client.kubernetesclient.definitions.v1.Service service =  buildStatefulService(loadBalanceDraftList, deployment, i);
//////                    new KubernetesUtil(client).deleteService(service.getMetadata().getLabels());
//////                    client.createService(service);
////                }
////                for (int i = 0; i != versionId.getHostList().size(); i++) {
////                    Node node = nodeList.get(i);
////                    List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
////                    ReplicationController rc = buildReplicationController(deployment, versionId, i, nodeIpList, allExtraEnvs);
////                    if (rc == null) {
////                        String message = "build replication controller of stateful deployment failed";
////                        deploymentStatusManager.failedEventForDeployment(deployId, queryCurrentSnapshot(client, deployment),
////                                message);
////                        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, message);
////                    }
////                    addDataVolumes(rc, node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR), versionId.getVolumes());
////                    client.createReplicationController(rc);
////                }
            } else {
                for (LoadBalancer loadBalancer : lbs) {
                    Service service = new DomeOSServiceBuilder(loadBalancer).build();
                    if (service == null) {
                        throw new DriverException("Bad LoadBalancerService info, lbId=" + loadBalancer.getId() + ", deployment=" + deployment.getName());
                    }
                    Service oldService = client.serviceInfo(service.getMetadata().getName());
                    if (oldService == null) {
                        client.createService(service);
                        logger.info("Service:" + service.getMetadata().getName() + " created successfully");
                    } else {
                        logger.info("Service:" + service.getMetadata().getName() + " exists, do not need to create");
                    }
                }
                ReplicationController rc = new RcBuilder(deployment, lbs, version, allExtraEnvs, deployment.getDefaultReplicas()).build();
                if (rc == null || rc.getSpec() == null) {
                    String message = "build replication controller for deployment:" + deployment.getName() + " failed";
                    // fail to create RC, so set status to ERROR
                    deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.ERROR);
                    event.setLastModify(System.currentTimeMillis());
                    event.setEventStatus(DeployEventStatus.FAILED);
                    event.setCurrentSnapshot(new ArrayList<DeploymentSnapshot>());
                    event.setMessage(message);
                    deployEventBiz.updateEvent(event);
                    throw new DriverException(message);
                }
                // ** create
                client.createReplicationController(rc);
            }
        } catch (Exception e) {
            deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.ERROR);
            event.setLastModify(System.currentTimeMillis());
            event.setEventStatus(DeployEventStatus.FAILED);
            event.setCurrentSnapshot(new ArrayList<DeploymentSnapshot>());
            event.setMessage(e.getMessage());
            deployEventBiz.updateEvent(event);
//            deploymentStatusManager.failedEventForDeployment(deployId,
//                null, // queryCurrentSnapshot(client, deployment),
//                e.getMessage());
            //        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, e.getMessage());
        }
    }

    @Override
    public void abortDeployOperation(Deployment deployment, User user)
            throws IOException, DeploymentEventException {
        KubeUtils kubeUtils;
        try {
            kubeUtils = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        long abortDeployEventId = deploymentStatusManager.registerAbortEvent(deployment.getId(), user);
        deploymentStatusManager.freshEvent(abortDeployEventId, queryCurrentSnapshot(kubeUtils, deployment));
        DeployEvent abortEvent = deployEventBiz.getEvent(abortDeployEventId);
        if (abortEvent.getEventStatus().equals(DeployEventStatus.PROCESSING)) {
            switch (abortEvent.getOperation()) {
                case ABORT_START:
                    try {
                        // TODO (openxxs) tmp solution: for old load balancer
                        try {
                            List<LoadBalancer> loadBalancers = loadBalancerBiz.getLBSByDeploy(deployment.getId());
                            if (loadBalancers != null && loadBalancers.size() > 0) {
                                kubeUtils.deleteService(new K8sLabel(GlobalConstant.LOAD_BALANCER_ID_STR,
                                        String.valueOf(loadBalancers.get(0).getId())));
                            }
                        } catch (Exception e) {
                            throw new DeploymentEventException(e.getMessage());
                        }
                        deleteDeployInstance(deployment);
                        deploymentStatusManager.succeedEvent(abortDeployEventId, queryCurrentSnapshot(kubeUtils, deployment));
                    } catch (Exception e) {
                        deploymentStatusManager.failedEvent(abortDeployEventId, queryCurrentSnapshot(kubeUtils, deployment),
                                "abort " + abortEvent.getOperation() + " failed");
                    }
                    break;
                case ABORT_UPDATE:
                case ABORT_ROLLBACK:
                    try {
                        DeploymentUpdater updater = updaterManager.getUpdater(deployment.getId());
                        if (updater != null) {
                            updaterManager.removeUpdater(deployment.getId());
                        }
                        if (updater == null) {
                            deploymentStatusManager.succeedEvent(abortDeployEventId, queryCurrentSnapshot(kubeUtils, deployment));
                        }
                    } catch (Exception e) {
                        deploymentStatusManager.failedEvent(abortDeployEventId, queryCurrentSnapshot(kubeUtils, deployment),
                                "abort " + abortEvent.getOperation() + " failed");
                    }
                    break;
                case ABORT_SCALE_UP:
                case ABORT_SCALE_DOWN:
                    try {
                        adjustReplicasForScale(deployment);
                        deploymentStatusManager.succeedEvent(abortDeployEventId, queryCurrentSnapshot(kubeUtils, deployment));
                    } catch (Exception e) {
                        deploymentStatusManager.failedEvent(abortDeployEventId, queryCurrentSnapshot(kubeUtils, deployment),
                                "abort " + abortEvent.getOperation() + " failed");
                    }
                    break;
                default:
                    throw new DeploymentEventException("There is no deploy event operation named " + abortEvent.getOperation());
            }
        }
    }

    @Override
    public void stopDeploy(Deployment deployment, User user)
            throws DeploymentEventException, IOException {
        KubeUtils kubeUtils;
        try {
            kubeUtils = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }

        List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshot(kubeUtils, deployment);
        long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                DeployOperation.STOP,
                user,
                queryDesiredSnapshot(kubeUtils, deployment),
                currentSnapshot,
                null);
        deploymentStatusManager.freshEvent(eventId, currentSnapshot);
        // TODO (openxxs) tmp solution: for old load balancer
        try {
            List<LoadBalancer> loadBalancers = loadBalancerBiz.getLBSByDeploy(deployment.getId());
            if (loadBalancers != null && loadBalancers.size() > 0) {
                kubeUtils.deleteService(new K8sLabel(GlobalConstant.LOAD_BALANCER_ID_STR, String.valueOf(loadBalancers.get(0).getId())));
            }
            deleteDeployInstance(deployment);
        } catch (Exception e) {
            throw new DeploymentEventException(e.getMessage());
        }

    }

    @Override
    public void rollbackDeploy(Deployment deployment, int versionId, int replicas, List<EnvDraft> allExtraEnvs, User user, Policy policy)
            throws IOException, DeploymentEventException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        Version version = versionBiz.getVersion(deployment.getId(), versionId);
        // check status
        List<DeploymentSnapshot> currentSnapshot;
        List<DeploymentSnapshot> srcSnapshot;
        try {
            currentSnapshot = queryCurrentSnapshot(client, buildRCSelector(deployment));
            srcSnapshot = queryDesiredSnapshot(client, buildRCLabel(deployment));
        } catch (K8sDriverException e) {
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
        int totalReplicas = getTotalReplicas(srcSnapshot);
        if (replicas != -1) {
            totalReplicas = replicas;
        }
        long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                DeployOperation.ROLLBACK,
                user,
                srcSnapshot,
                currentSnapshot,
                buildSingleDeploymentSnapshot(versionId, totalReplicas));
        deploymentStatusManager.freshEvent(eventId, currentSnapshot);

        // TODO (openxxs) tmp solution: check load balancer status
        List<LoadBalancer> lbs = loadBalancerBiz.getLBSByDeploy(deployment.getId());
        if (lbs != null && lbs.size() > 0) {
            for (LoadBalancer loadBalancer : lbs) {
                Service service = new DomeOSServiceBuilder(loadBalancer).build();
                if (service == null || service.getMetadata() == null) {
                    deploymentStatusManager.failedEvent(eventId, currentSnapshot,
                            "Bad loadBalancer service info with Id=" + loadBalancer.getId() + ", deployment=" + deployment.getName());
                    return;
                }
                Service oldService;
                try {
                    oldService = client.serviceInfo(service.getMetadata().getName());
                } catch (K8sDriverException e) {
                    throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
                }
                if (oldService == null) {
                    deploymentStatusManager.failedEvent(eventId, currentSnapshot,
                            "LoadBalancerService with Id=" + loadBalancer.getId() + "does not exist, deployment=" + deployment.getName());
                    return;
                }
            }
        }

        DeploymentUpdater updater = updaterManager.createUpdater(client, deployment, version, replicas, allExtraEnvs, policy, lbs);
        updater.start();
    }

    @Override
    public void startUpdate(Deployment deployment, int versionId, int replicas, List<EnvDraft> allExtraEnvs, User user, Policy policy)
            throws IOException, DeploymentEventException {
        // ** create KubernetesClient
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        Version dstVersion = versionBiz.getVersion(deployment.getId(), versionId);
        // ** check status
        List<DeploymentSnapshot> currentSnapshot;
        List<DeploymentSnapshot> desiredSnapshot;
        try {
            currentSnapshot = queryCurrentSnapshot(client, buildRCSelector(deployment));
            desiredSnapshot = queryDesiredSnapshot(client, buildRCLabel(deployment));
        } catch (K8sDriverException e) {
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
        int totalReplicas = getTotalReplicas(desiredSnapshot);
        if (replicas != -1) {
            totalReplicas = replicas;
        }
        if (deployment.isStateful()) {
            totalReplicas = dstVersion.getHostList().size();
        }
        long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                DeployOperation.UPDATE,
                user,
                currentSnapshot,
                currentSnapshot,
                buildSingleDeploymentSnapshot(versionId, totalReplicas));
        deploymentStatusManager.freshEvent(eventId, currentSnapshot);

        // TODO (openxxs) tmp solution: check load balancer status
        List<LoadBalancer> lbs = loadBalancerBiz.getLBSByDeploy(deployment.getId());
        if (lbs != null && lbs.size() > 0) {
            for (LoadBalancer loadBalancer : lbs) {
                Service service = new DomeOSServiceBuilder(loadBalancer).build();
                if (service == null || service.getMetadata() == null) {
                    deploymentStatusManager.failedEvent(eventId, currentSnapshot,
                            "Bad loadBalancer service info with Id=" + loadBalancer.getId() + ", deployment=" + deployment.getName());
                    return;
                }
                Service oldService;
                try {
                    oldService = client.serviceInfo(service.getMetadata().getName());
                } catch (K8sDriverException e) {
                    throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
                }
                if (oldService == null) {
                    deploymentStatusManager.failedEvent(eventId, currentSnapshot,
                            "LoadBalancerService with Id=" + loadBalancer.getId() + "does not exist, deployment=" + deployment.getName());
                    return;
                }
            }
        }

        // ** create and start updater
        DeploymentUpdater updater = updaterManager.createUpdater(client, deployment, dstVersion, replicas, allExtraEnvs, policy, lbs);
        updater.start();
    }

    @Override
    public void scaleUpDeployment(Deployment deployment, int versionId, int replicas, List<EnvDraft> allExtraEnvs, User user)
            throws DeploymentEventException, IOException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        Map<String, String> rcSelector = buildRCLabel(deployment);
        List<DeploymentSnapshot> currentSnapshot = null;
        try {
            ReplicationControllerList rcList = client.listReplicationController(rcSelector);
            // ** choose the first rc template, treating it as no status
            if (rcList == null || rcList.getItems() == null || rcList.getItems().size() == 0
                    || rcList.getItems().get(0) == null) {
                // ** no rc found
                throw new DeploymentEventException("no replication controller found");
            }

            // ** find rc
            if (checkVersion(versionId, rcList.getItems())) {
                List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client, deployment);
                currentSnapshot = queryCurrentSnapshot(client, deployment);
                List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(srcSnapshot, versionId, replicas);

                long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                        DeployOperation.SCALE_UP,
                        user,
                        srcSnapshot,
                        currentSnapshot,
                        dstSnapshot);
                deploymentStatusManager.freshEvent(eventId, currentSnapshot);
                // ** do scale
                String rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + versionId;
                client.scaleReplicationController(rcName, replicas);
            } else {
                ReplicationController targetRC = findMaxVersionRC(rcList.getItems());
                if (targetRC == null) {
                    throw new DeploymentEventException("rc is null");
                }
                versionId = Integer.parseInt(targetRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));

                // ** register event
                List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client, deployment);
                currentSnapshot = queryCurrentSnapshot(client, deployment);
                List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(srcSnapshot, versionId, replicas);

                long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                        DeployOperation.SCALE_UP,
                        user,
                        srcSnapshot,
                        currentSnapshot,
                        dstSnapshot);
                deploymentStatusManager.freshEvent(eventId, currentSnapshot);
                // ** do scale
                client.scaleReplicationController(RCUtils.getName(targetRC), replicas);
            }

            removeOtherRC(client, versionId, rcList.getItems());
        } catch (IOException | K8sDriverException e) {
            deploymentStatusManager.failedEventForDeployment(deployment.getId(), currentSnapshot, e.getMessage());
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    private boolean checkVersion(int versionId, List<ReplicationController> rcList) {
        // check if version k8s equals target version

        if (versionId <= 0 || rcList.size() <= 0) {
            return false;
        }

        Set<Integer> versionSet = new HashSet<>();
        for (ReplicationController tmpRC : rcList) {
            int tmpId = Integer.parseInt(tmpRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            versionSet.add(tmpId);
        }

        return versionSet.contains(versionId);
    }

    private void removeOtherRC(KubeUtils client, int verionId, List<ReplicationController> rcList) {
        for (ReplicationController tmpRC : rcList) {
            int tmpId = Integer.parseInt(tmpRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            if (tmpId != verionId) {
                try {
                    client.deleteReplicationController(RCUtils.getName(tmpRC));
                } catch (IOException | K8sDriverException e) {
                    logger.warn("delete rc error, e=" + e.getMessage());
                }
            }
        }
    }

    @Override
    public void scaleDownDeployment(Deployment deployment, int versionId, int replicas, List<EnvDraft> allExtraEnvs, User user)
            throws DeploymentEventException, IOException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        Map<String, String> rcSelector = buildRCLabel(deployment);

        List<DeploymentSnapshot> currentSnapshot = null;
        try {
            ReplicationControllerList rcList = client.listReplicationController(rcSelector);
            // ** choose the first rc template, treated it as no status
            if (rcList == null || rcList.getItems() == null || rcList.getItems().size() == 0
                    || rcList.getItems().get(0) == null) {
                // no rc found
                throw new DeploymentEventException("no replication controller found");
            }
            // ** find rc
            if (checkVersion(versionId, rcList.getItems())) {
                // ** register event
                List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client, deployment);
                currentSnapshot = queryCurrentSnapshot(client, deployment);
                List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(srcSnapshot, versionId, replicas);

                long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                        DeployOperation.SCALE_DOWN,
                        user,
                        srcSnapshot,
                        currentSnapshot,
                        dstSnapshot);
                deploymentStatusManager.freshEvent(eventId, currentSnapshot);

                // ** do scale
                String rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + versionId;
                client.scaleReplicationController(rcName, replicas);
            } else {
                ReplicationController targetRC = findMaxVersionRC(rcList.getItems());
                if (targetRC == null) {
                    throw new DeploymentEventException("no replication controller found");
                }

                versionId = Integer.parseInt(targetRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
                // ** register event
                List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client, deployment);
                currentSnapshot = queryCurrentSnapshot(client, deployment);
                List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(srcSnapshot, versionId, replicas);

                long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                        DeployOperation.SCALE_DOWN,
                        user,
                        srcSnapshot,
                        currentSnapshot,
                        dstSnapshot);
                deploymentStatusManager.freshEvent(eventId, currentSnapshot);

                // ** do scale
                client.scaleReplicationController(RCUtils.getName(targetRC), replicas);
            }

            removeOtherRC(client, versionId, rcList.getItems());
        } catch (IOException | K8sDriverException e) {
            deploymentStatusManager.failedEventForDeployment(deployment.getId(), currentSnapshot, e.getMessage());
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    private Map<String, String> buildRCSelector(Deployment deployment) {
        Map<String, String> selector = new HashMap<>();
        selector.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return selector;
    }

    private Map<String, String> buildRCLabel(Deployment deployment) {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return label;
    }

    private List<DeploymentSnapshot> queryDesiredSnapshot(KubeUtils kubeUtils, Deployment deployment)
            throws IOException, DeploymentEventException {
        try {
            return queryDesiredSnapshot(kubeUtils, buildRCLabel(deployment));
        } catch (K8sDriverException e) {
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    private List<DeploymentSnapshot> queryDesiredSnapshot(KubeUtils kubeUtils, Map<String, String> rcLabel)
            throws IOException, K8sDriverException {
        ReplicationControllerList rcList = kubeUtils.listReplicationController(rcLabel);
        if (rcList == null || rcList.getItems() == null || rcList.getItems().size() == 0) {
            // no rc found
            return null;
        }
        Map<Long, Long> snapshots = new HashMap<>();
        for (ReplicationController rc : rcList.getItems()) {
            if (rc == null || rc.getMetadata() == null || rc.getMetadata().getLabels() == null ||
                    !rc.getMetadata().getLabels().containsKey(GlobalConstant.VERSION_STR)) {
                continue;
            }
            Long version = Long.parseLong(rc.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            if (snapshots.containsKey(version)) {
                snapshots.put(version, snapshots.get(version) + rc.getSpec().getReplicas());
            } else {
                snapshots.put(version, (long) rc.getSpec().getReplicas());
            }
        }
        List<DeploymentSnapshot> snapshotList = new LinkedList<>();
        for (Map.Entry<Long, Long> entry : snapshots.entrySet()) {
            snapshotList.add(new DeploymentSnapshot(entry.getKey(), entry.getValue()));
        }
        return snapshotList;
    }

    public List<DeploymentSnapshot> queryCurrentSnapshot(KubeUtils kubeUtils, Deployment deployment)
            throws IOException, DeploymentEventException {
        try {
            return queryCurrentSnapshot(kubeUtils, buildRCSelector(deployment));
        } catch (K8sDriverException e) {
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    private List<DeploymentSnapshot> queryCurrentSnapshot(KubeUtils kubeUtils, Map<String, String> rcSelector)
            throws IOException, K8sDriverException {
        PodList podList = kubeUtils.listPod(rcSelector);
        if (podList == null || podList.getItems() == null || podList.getItems().size() == 0) {
            return null;
        }
        Map<Long, Long> snapshots = new HashMap<>();
        for (Pod pod : podList.getItems()) {
            if (pod == null || pod.getMetadata() == null || pod.getMetadata().getLabels() == null) {
                continue;
            }
            if (!PodUtils.isPodReady(pod)) {
                continue;
            }
            String longData = pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR);
            Long version = Long.parseLong(longData);
            if (!snapshots.containsKey(version)) {
                snapshots.put(version, 1L);
            } else {
                snapshots.put(version, snapshots.get(version) + 1);
            }
        }
        List<DeploymentSnapshot> snapshotList = new LinkedList<>();
        for (Map.Entry<Long, Long> entry : snapshots.entrySet()) {
            snapshotList.add(new DeploymentSnapshot(entry.getKey(), entry.getValue()));
        }
        return snapshotList;
    }

    private int getTotalReplicas(List<DeploymentSnapshot> snapshots) {
        int replicas = 0;
        if (snapshots == null || snapshots.size() == 0) {
            return replicas;
        }
        for (DeploymentSnapshot snapshot : snapshots) {
            replicas += snapshot.getReplicas();
        }
        return replicas;
    }

    private boolean checkAnyInstanceFailed(int deploymentId, long versionId)
            throws IOException, ParseException, K8sDriverException {
        Deployment deployment = deploymentBiz.getDeployment(deploymentId);
        KubeUtils client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        Map<String, String> rcSelector = buildRCSelectorWithSpecifyVersion(deployment, versionId);
        PodList podList = client.listPod(rcSelector);
        Filter.getPodNotTerminatedFilter().filter(podList);
        return judgement.isAnyFailed(podList);
    }

    @Override
    public void checkUpdateEvent(Deployment deployment, DeployEvent event)
            throws IOException, DeploymentEventException {
        DeploymentUpdater updater = updaterManager.getUpdater(event.getDeployId());
        if (updater == null) {
            return;
        }
        updater.checkStatus();
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        List<DeploymentSnapshot> currentSnapshot;
        currentSnapshot = queryCurrentSnapshot(client, deployment);
        DeploymentUpdateStatus currentStatus = updater.getStatus();
        logger.error("update event, eid=" + event.getEid() + ", currentSnapshot" + currentSnapshot + ", status=" + currentStatus.getPhase());
        if (currentStatus.getPhase() == DeploymentUpdatePhase.Failed) {
            deploymentStatusManager.failedEvent(event.getEid(), currentSnapshot, currentStatus.getReason());
            updaterManager.removeUpdater(event.getDeployId());
        } else if (currentStatus.getPhase() == DeploymentUpdatePhase.Succeed) {
            deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
            updaterManager.removeUpdater(event.getDeployId());
        } else {
            deploymentStatusManager.freshEvent(event.getEid(), currentSnapshot);
        }
    }

    @Override
    public void checkBasicEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException, DataBaseContentException, ParseException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        try {
            List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshot(client, deployment);
            List<DeploymentSnapshot> desiredSnapshot = event.getTargetSnapshot();
            if (currentSnapshot == null && judgement.isExpireForEventNotReallyHappen(event.getStartTime())) {
                deploymentStatusManager.failedEvent(event.getEid(), null, "no replication controller found for event(eid="
                        + event.getEid() + ")");
                return;
            }
            if (desiredSnapshot == null) {
                deploymentStatusManager.failedEvent(event.getEid(), currentSnapshot, "null desired snapshot");
                return;
            }
            List<DeploymentSnapshot> desiredSnapshotInKubernetes;

            desiredSnapshotInKubernetes = queryDesiredSnapshot(client, deployment);

            if (!isSnapshotEquals(desiredSnapshot, desiredSnapshotInKubernetes)
                    && judgement.isExpireForEventNotReallyHappen(event.getStartTime())) {
                deploymentStatusManager.failedEvent(event.getEid(), currentSnapshot, "the desiredSnapshot is not equals with the"
                        + " desiredSnapshot in kubernetes event will be mark to failed(eid=" + event.getEid()
                        + ")");
                return;
            }
            for (DeploymentSnapshot deploymentSnapshot : desiredSnapshot) {
                if (checkAnyInstanceFailed(event.getDeployId(), deploymentSnapshot.getVersion())) {
                    deploymentStatusManager.failedEvent(event.getEid(), currentSnapshot, "one of pod is start failed");
                    return;
                }
            }
            if (isSnapshotEquals(currentSnapshot, event.getTargetSnapshot())) {
                deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
            } else {
                deploymentStatusManager.freshEvent(event.getEid(), currentSnapshot);
            }
        } catch (K8sDriverException e) {
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    @Override
    public void checkAbortEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        List<DeploymentSnapshot> currentSnapshot;

        currentSnapshot = queryCurrentSnapshot(client, deployment);
        switch (event.getOperation()) {
            case ABORT_START:
                if (currentSnapshot == null || currentSnapshot.isEmpty()) {
                    deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
                } else {
                    try {
                        deleteDeployInstance(deployment);
                    } catch (K8sDriverException e) {
                        throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
                    }
                    deploymentStatusManager.freshEvent(event.getEid(), currentSnapshot);
                }
                break;
            case ABORT_UPDATE:
            case ABORT_ROLLBACK:
                DeploymentUpdater updater = updaterManager.getUpdater(event.getDeployId());
                if (updater == null) {
                    deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
                } else {
                    updaterManager.removeUpdater(event.getDeployId());
                    deploymentStatusManager.freshEvent(event.getEid(), currentSnapshot);
                }
                break;
            case SCALE_UP:
            case SCALE_DOWN:
                try {
                    adjustReplicasForScale(deployment);
                    deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
                } catch (Exception e) {
                    deploymentStatusManager.failedEvent(event.getEid(), currentSnapshot, "Adjust RC replicas failed when abort scale operation.");
                }
                break;
            default:
                throw new DeploymentEventException("Deploy event operation '" + event.getOperation() + "' can not be check as abort event");
        }
    }

    @Override
    public void checkStopEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        List<DeploymentSnapshot> currentSnapshot;

        currentSnapshot = queryCurrentSnapshot(client, deployment);
        if (currentSnapshot == null || currentSnapshot.isEmpty()) {
            deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
        } else {
            try {
                deleteDeployInstance(deployment);
            } catch (K8sDriverException e) {
                throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
            }
            deploymentStatusManager.freshEvent(event.getEid(), currentSnapshot);
        }
    }

    @Override
    public void expiredEvent(Deployment deployment, DeployEvent event) throws DeploymentEventException, IOException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }

        deploymentStatusManager.failedEvent(event.getEid(), queryCurrentSnapshot(client, deployment), "Operation expired. " + event.getMessage());
    }

    private Map<String, String> buildRCSelectorWithSpecifyVersion(Deployment deployment, long versionV) {
        Map<String, String> selector = buildRCSelector(deployment);
        selector.put(GlobalConstant.VERSION_STR, String.valueOf(versionV));
        return selector;
    }

    public void addDataVolumes(ReplicationController rc, String disk, List<String> mountPoint) {
        String deployId = rc.getMetadata().getLabels().get(GlobalConstant.DEPLOY_ID_STR);
        List<Volume> volumes = new ArrayList<>(mountPoint.size());
        List<VolumeMount> volumeMounts = new ArrayList<>(mountPoint.size());
        for (String aMountPoint : mountPoint) {
            // String volumeName = "data-" + RandomStringUtils.randomAlphabetic(10).toLowerCase();
            String volumeName = "data-" + deployId + "-" + MD5Util.getMD5InHex(aMountPoint);
            volumes.add(new VolumeBuilder()
                    .withName(volumeName)
                    .withHostPath(new HostPathVolumeSource())
                    .withNewHostPath(disk + "/domeos/delpoyment/" + deployId + "/" + aMountPoint)
                    .build());
//                    .withNewHostPath()
//                    .withHostPath(new HostPathVolumeSource()
//                    .putPath(disk + "/domeos/delpoyment/"
//                            + deployId + "/" + mountPoint.get(i)));
            volumeMounts.add(new VolumeMountBuilder()
                    .withName(volumeName)
                    .withMountPath(aMountPoint)
                    .build());
        }
        rc.getSpec().getTemplate().getSpec().setVolumes(volumes);
        for (Container container : rc.getSpec().getTemplate().getSpec().getContainers()) {
            container.setVolumeMounts(volumeMounts);
        }
    }

    // buildRCSelector will decide which pods will be selected
    public Map<String, String> buildRCSelectorWithSpecifyVersion(Deployment deployment, Version version) {
        Map<String, String> selector = buildRCSelector(deployment);
        selector.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        return selector;
    }

    private void addIndex(Map<String, String> selector, int index) {
        selector.put("index", String.valueOf(index));
    }

    // this function will add or replace version in oldSnapshot
    private List<DeploymentSnapshot> buildDeploymentSnapshotWith(
            List<DeploymentSnapshot> oldSnapshot, long version, long replicas) {
        List<DeploymentSnapshot> result = new LinkedList<>();
        if (oldSnapshot == null) {
            return null;
        }
        boolean isFind = false;
        for (DeploymentSnapshot oneSnapshot : oldSnapshot) {
            if (oneSnapshot.getVersion() == version) {
                result.add(new DeploymentSnapshot(version, replicas));
                isFind = true;
            } else {
                result.add(new DeploymentSnapshot(oneSnapshot));
            }
        }
        if (!isFind) {
            result.add(new DeploymentSnapshot(version, replicas));
        }
        return result;
    }


    public List<DeploymentSnapshot> buildDeploymentSnapshotWith(
            List<DeploymentSnapshot> oldSnapshot,
            Map<Long, Long> replicas
    ) {
        if (oldSnapshot == null || oldSnapshot.size() == 0) {
            return null;
        }
        List<DeploymentSnapshot> result = new LinkedList<>();
        for (DeploymentSnapshot oneSnapshot : oldSnapshot) {
            long version = oneSnapshot.getVersion();
            if (replicas.containsKey(version)) {
                result.add(new DeploymentSnapshot(version, replicas.get(version)));
                replicas.remove(oneSnapshot.getVersion());
            } else {
                result.add(new DeploymentSnapshot(oneSnapshot));
            }
        }
        for (Map.Entry<Long, Long> entry : replicas.entrySet()) {
            result.add(new DeploymentSnapshot(entry.getKey(), entry.getValue()));
        }
        return result;
    }

    private ReplicationController findMaxVersionRC(List<ReplicationController> rcArray) {
        if (rcArray == null || rcArray.size() == 0) {
            return null;
        }
        long maxVersionId = -1;
        ReplicationController maxVersionRC = null;
        for (ReplicationController rc : rcArray) {
            long tmpVersionId = Long.parseLong(rc.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            if (maxVersionId < tmpVersionId) {
                maxVersionId = tmpVersionId;
                maxVersionRC = rc;
            }
        }
        return maxVersionRC;
    }

    private ReplicationController findRC(List<ReplicationController> rcArray, long versionId) {
        if (rcArray == null || rcArray.size() == 0) {
            return null;
        }
        for (ReplicationController rc : rcArray) {
            if (versionId == Long.parseLong(rc.getMetadata().getLabels().get(GlobalConstant.VERSION_STR))) {
                return rc;
            }
        }
        return null;
    }

    private Service buildServiceForStateless(LoadBalancer loadBalancer, Deployment deployment) {
        // * init metadata
        Service service = new ServiceBuilder()
                .withNewMetadata()
                .withName(GlobalConstant.RC_NAME_PREFIX + deployment.getName())
                .withLabels(buildRCLabel(deployment))
                .withNamespace(deployment.getNamespace())
                .endMetadata()
                .build();

        // * init rc spec
        ServiceSpec spec = new ServiceSpec();
        // ** init pod template
        List<String> ips = loadBalancer.getExternalIPs();
        spec.setExternalIPs(ips);

        if (loadBalancer.getLoadBalancerPorts() != null && loadBalancer.getLoadBalancerPorts().size() > 0) {
            List<ServicePort> servicePorts = new ArrayList<>(1);

            servicePorts.add(new ServicePortBuilder()
                    .withPort(loadBalancer.getLoadBalancerPorts().get(0).getPort())
                    .withTargetPort(new IntOrString(loadBalancer.getLoadBalancerPorts().get(0).getTargetPort()))
                    .build());
            spec.setPorts(servicePorts);
        }

        spec.setType(GlobalConstant.NODE_PORT_STR);

        // *** create pod selector
        spec.setSelector(buildRCSelector(deployment));

        service.setSpec(spec);
        return service;
    }

    private Service buildInnerService(List<InnerServiceDraft> innerServiceDrafts, Deployment deployment) {
        Service service = new ServiceBuilder()
                .withNewMetadata()
                .withName(GlobalConstant.RC_NAME_PREFIX + deployment.getName())
                .withLabels(buildRCLabel(deployment))
                .withNamespace(deployment.getNamespace())
                .endMetadata()
                .build();
        // init metadata
        // init rc spec
        ServiceSpec spec = new ServiceSpec();
        List<ServicePort> servicePorts = new ArrayList<>(innerServiceDrafts.size());
        for (InnerServiceDraft innerServiceDraft : innerServiceDrafts) {
            InnerServiceProtocol innerServiceProtocol = innerServiceDraft.getProtocol();
            if (innerServiceProtocol == null) {
                innerServiceProtocol = InnerServiceProtocol.TCP;
            }
            servicePorts.add(new ServicePortBuilder()
                    .withProtocol(innerServiceProtocol.toString())
                    .withPort(innerServiceDraft.getPort())
                    .withTargetPort(new IntOrString(innerServiceDraft.getTargetPort()))
                    .build());
        }
        spec.setPorts(servicePorts);
        spec.setType(GlobalConstant.CLUSTER_IP_STR);
        spec.setSelector(buildRCSelector(deployment));
        service.setSpec(spec);
        return service;
    }

    private Service buildStatefulService(List<LoadBalanceDraft> loadBalanceDraft,
                                         Deployment deployment, int index) {
        if (deployment == null || loadBalanceDraft == null || loadBalanceDraft.size() == 0) {
            return null;
        }
        Map<String, String> labels = buildRCLabel(deployment);
        addIndex(labels, index);

        // * init metadata
        Service service = new ServiceBuilder()
                .withNewMetadata()
                .withName(buildStatefulServiceName(deployment, index))
                .withLabels(labels)
                .withNamespace(deployment.getNamespace())
                .endMetadata()
                .build();

        // * init rc spec
        ServiceSpec spec = new ServiceSpec();
        List<String> ips = loadBalanceDraft.get(0).getExternalIPs();
        spec.setExternalIPs(ips);
        List<ServicePort> servicePorts = new ArrayList<>(loadBalanceDraft.size());
        for (LoadBalanceDraft draft : loadBalanceDraft) {
            servicePorts.add(new ServicePortBuilder()
                    .withPort(draft.getPort())
                    .withTargetPort(new IntOrString(draft.getTargetPort()))
                    .withName(draft.getName())
                    .build());
        }

        // ** init pod template
        spec.setPorts(servicePorts);
        spec.setType(GlobalConstant.NODE_PORT_STR);

        // *** create pod selector
        Map<String, String> selectors = buildRCSelector(deployment);
        addIndex(selectors, index);
        spec.setSelector(selectors);

        service.setSpec(spec);
        return service;
    }

    private String buildStatefulServiceName(Deployment deployment, int index) {
        return buildStatefulServiceName(deployment) + "-" + index;
    }

    private String buildStatefulServiceName(Deployment deployment) {
        if (deployment.getName().length() > 12) {
            return deployment.getName().substring(0, 12) + "-" + deployment.getId();
        }
        return deployment.getName();
    }

    private boolean isSnapshotEquals(List<DeploymentSnapshot> one, List<DeploymentSnapshot> another) {
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

    private void deleteDeployInstance(Deployment deployment) throws IOException, K8sDriverException {
        KubeUtils client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        ReplicationControllerList rcList = client.listReplicationController(buildRCLabel(deployment));
        if (rcList != null && rcList.getItems() != null) {
            for (ReplicationController rc : rcList.getItems()) {
                client.deleteReplicationController(RCUtils.getName(rc));
            }
        }
        PodList podList = client.listPod(buildRCSelector(deployment));
        if (podList != null && podList.getItems() != null) {
            for (Pod pod : podList.getItems()) {
                client.deletePod(PodUtils.getName(pod));
            }
        }
    }

    private void adjustReplicasForScale(Deployment deployment)
            throws IOException, DeploymentEventException, K8sDriverException {
        KubeUtils client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        ReplicationControllerList rcList = client.listReplicationController(buildRCLabel(deployment));
        if (rcList == null || rcList.getItems() == null || rcList.getItems().size() == 0
                || rcList.getItems().get(0) == null) {
            throw new DeploymentEventException("no replication controller found");
        }
        for (ReplicationController rc : rcList.getItems()) {
            int currentPodNumber;
            Map<String, String> podSelector = rc.getSpec().getSelector();
            PodList podList = client.listPod(podSelector);
            if (podList == null || podList.getItems() == null) {
                currentPodNumber = 0;
            } else {
                currentPodNumber = PodUtils.getPodReadyNumber(podList.getItems());
            }
            client.scaleReplicationController(RCUtils.getName(rc), currentPodNumber);
        }
    }
}
