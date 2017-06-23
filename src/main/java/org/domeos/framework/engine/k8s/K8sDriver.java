package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.Service;
import org.apache.commons.lang.StringUtils;
import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.DeploymentTerminatedException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerBiz;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.model.deployment.related.NetworkMode;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.engine.RuntimeDriver;
import org.domeos.framework.engine.coderepo.ReflectFactory;
import org.domeos.framework.engine.exception.DriverException;
import org.domeos.framework.engine.k8s.handler.DeployResourceHandler;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.domeos.framework.engine.k8s.util.SecretUtils;
import org.domeos.global.GlobalConstant;
import org.json.JSONException;
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
    @Autowired
    private GlobalBiz globalBiz;

    @Override
    public RuntimeDriver init(Cluster cluster) {
        this.cluster = cluster;
        return this;
    }

    @Override
    public boolean isDriverLatest(Cluster cluster) {
        boolean equal = cluster.equalWith(this.cluster);
        this.cluster = cluster;
        return equal;
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
    public void startDeploy(Deployment deployment, Version version, User user, List<EnvDraft> allExtraEnvs)
            throws DriverException, DeploymentEventException, IOException {
        KubeUtils client;
        DeployResourceHandler deployResourceHandler;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, client);
        } catch (K8sDriverException e) {
            throw new DriverException(e.getMessage());
        }
        long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                DeployOperation.START,
                user,
                null,
                null,
                buildSingleDeploymentSnapshot(version.getVersion(), deployment.getDefaultReplicas()));
        deploymentStatusManager.freshEvent(eventId, null);
        DeployEvent event = deployEventBiz.getEvent(eventId);
        try {
            //loadBalancer
            if (deployment.getNetworkMode() != NetworkMode.HOST  && deployment.getUsedLoadBalancer() == 0) {
                List<LoadBalancer> lbs = loadBalancerBiz.getInnerAndExternalLoadBalancerByDeployId(deployment.getId());
                checkLoadBalancer(client, lbs);
            }
            // create secret before the create of rc
            // judge the registry is belong to domeos or not
            checkSecret(client, version, deployment);

            deployResourceHandler.create(version, allExtraEnvs);
        } catch (Exception e) {
            failedDeployment(deployment.getId(), event, e);
        }
    }

    @Override
    public void abortDeployOperation(Deployment deployment, User user)
            throws IOException, DeploymentEventException, DeploymentTerminatedException {
        KubeUtils kubeUtils;
        DeployResourceHandler deployResourceHandler;
        try {
            kubeUtils = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, kubeUtils);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        long abortDeployEventId = deploymentStatusManager.registerAbortEvent(deployment.getId(), user);
        PodList podList = getPodListByDeployment(kubeUtils, deployment);
        deploymentStatusManager.freshEvent(abortDeployEventId, queryCurrentSnapshotWithPodRunning(podList));
        DeployEvent abortEvent = deployEventBiz.getEvent(abortDeployEventId);
        if (abortEvent.getEventStatus().equals(DeployEventStatus.PROCESSING)) {
            switch (abortEvent.getOperation()) {
                case ABORT_START:
                    try {
                        //loadBalancer
                        try {
                            LoadBalancer lb = loadBalancerBiz.getInnerLoadBalancerByDeployId(deployment.getId());
                            if (lb != null) {
                                kubeUtils.deleteService(GlobalConstant.RC_NAME_PREFIX + deployment.getName());
                            }
                        } catch (Exception e) {
                            throw new DeploymentEventException(e.getMessage());
                        }
                        deployResourceHandler.delete();
                        podList = getPodListByDeployment(kubeUtils, deployment);
                        deploymentStatusManager.succeedEvent(abortDeployEventId, queryCurrentSnapshotWithPodRunning(podList));
                    } catch (Exception e) {
                        podList = getPodListByDeployment(kubeUtils, deployment);
                        deploymentStatusManager.failedEvent(abortDeployEventId, queryCurrentSnapshotWithPodRunning(podList),
                                "abort " + abortEvent.getOperation() + " failed");
                    }
                    break;
                case ABORT_UPDATE:
                case ABORT_ROLLBACK:
                    try {
                        Boolean updateDone = deployResourceHandler.abortUpdateOrRollBack();
                        if (updateDone) {
                            podList = getPodListByDeployment(kubeUtils, deployment);
                            deploymentStatusManager.succeedEvent(abortDeployEventId, queryCurrentSnapshotWithPodRunning(podList));
                        }
                    } catch (Exception e) {
                        podList = getPodListByDeployment(kubeUtils, deployment);
                        deploymentStatusManager.failedEvent(abortDeployEventId, queryCurrentSnapshotWithPodRunning(podList),
                                "abort " + abortEvent.getOperation() + " failed");
                    }
                    break;
                case ABORT_SCALE_UP:
                case ABORT_SCALE_DOWN:
                    try {
                        deployResourceHandler.abortScales();
                    } catch (Exception e) {
                        podList = getPodListByDeployment(kubeUtils, deployment);
                        deploymentStatusManager.failedEvent(abortDeployEventId, queryCurrentSnapshotWithPodRunning(podList),
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
        DeployResourceHandler deployResourceHandler;
        try {
            kubeUtils = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, kubeUtils);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        PodList podList = getPodListByDeployment(kubeUtils, deployment);
        List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshotWithPodRunning(podList);
        long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                DeployOperation.STOP,
                user,
                currentSnapshot,
                currentSnapshot,
                null);
        deploymentStatusManager.freshEvent(eventId, currentSnapshot);
        //loadBalancer
        try {
            if (deployment.getNetworkMode() != NetworkMode.HOST  && deployment.getUsedLoadBalancer() == 0) {
                List<LoadBalancer> lbs = loadBalancerBiz.getInnerAndExternalLoadBalancerByDeployId(deployment.getId());
                if (lbs != null) {
                    for (LoadBalancer lb  : lbs) {
                        if (lb.getName().equals(deployment.getName())) {
                            kubeUtils.deleteService(GlobalConstant.RC_NAME_PREFIX + deployment.getName());
                            break;
                        }
                    }
                }
            }
            deployResourceHandler.delete();
        } catch (Exception e) {
            throw new DeploymentEventException(e.getMessage());
        }

    }

    @Override
    public void rollbackDeploy(Deployment deployment, int versionId, List<EnvDraft> allExtraEnvs, User user, Policy policy)
            throws IOException, DeploymentEventException, DeploymentTerminatedException {
        KubeUtils kubeUtils;
        DeployResourceHandler deployResourceHandler;
        try {
            kubeUtils = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, kubeUtils);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        Version version = versionBiz.getVersion(deployment.getId(), versionId);
        // check status
        PodList podList = getPodListByDeployment(kubeUtils, deployment);
        List<DeploymentSnapshot> currentRunningSnapshot = queryCurrentSnapshotWithPodRunning(podList);
        int totalReplicas = getTotalReplicas(currentRunningSnapshot);
        if (deployment.getDefaultReplicas() != -1) {
            totalReplicas = deployment.getDefaultReplicas();
        }
        long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                DeployOperation.ROLLBACK,
                user,
                currentRunningSnapshot,
                currentRunningSnapshot,
                buildSingleDeploymentSnapshot(versionId, totalReplicas));
        deploymentStatusManager.freshEvent(eventId, currentRunningSnapshot);

        // create secret before the create of rc
        // judge the registry is belong to domeos or not
        checkSecret(kubeUtils, version, deployment);
        DeployEvent event = deployEventBiz.getEvent(eventId);
        List<LoadBalancer> lbs = null;
        try {
            //loadBalancer
            if (deployment.getNetworkMode() != NetworkMode.HOST && deployment.getUsedLoadBalancer() == 0) {
                lbs = loadBalancerBiz.getInnerAndExternalLoadBalancerByDeployId(deployment.getId());
                checkLoadBalancer(kubeUtils, lbs);
            }
            deployResourceHandler.rollback(version, lbs, allExtraEnvs, policy, eventId, versionId);
        } catch (K8sDriverException | DriverException e) {
            deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.ERROR);
            event.setLastModify(System.currentTimeMillis());
            event.setEventStatus(DeployEventStatus.FAILED);
            event.setCurrentSnapshot(new ArrayList<DeploymentSnapshot>());
            event.setMessage(e.getMessage());
            deployEventBiz.updateEvent(event);
        }
    }

    @Override
    public void startUpdate(Deployment deployment, int versionId, List<EnvDraft> allExtraEnvs, User user, Policy policy)
            throws IOException, DeploymentEventException, DeploymentTerminatedException {
        // ** create KubernetesClient
        KubeUtils kubeUtils;
        DeployResourceHandler deployResourceHandler;
        try {
            kubeUtils = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, kubeUtils);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        Version dstVersion = versionBiz.getVersion(deployment.getId(), versionId);
        // ** check status
        PodList podList = getPodListByDeployment(kubeUtils, deployment);
        List<DeploymentSnapshot> currentRunningSnapshot = queryCurrentSnapshotWithPodRunning(podList);
        int totalReplicas = getTotalReplicas(currentRunningSnapshot);
        if (deployment.getDefaultReplicas() != -1) {
            totalReplicas = deployment.getDefaultReplicas();
        }
//        if (deployment.isStateful()) {
//            totalReplicas = dstVersion.getHostList().size();
//        }
        long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                DeployOperation.UPDATE,
                user,
                currentRunningSnapshot,
                currentRunningSnapshot,
                buildSingleDeploymentSnapshot(versionId, totalReplicas));
        deploymentStatusManager.freshEvent(eventId, currentRunningSnapshot);

        checkSecret(kubeUtils, dstVersion, deployment);
        Version version = versionBiz.getVersion(deployment.getId(), versionId);
        DeployEvent event = deployEventBiz.getEvent(eventId);
        List<LoadBalancer> lbs = null;
        try {
            //loadBalancer
            if (deployment.getNetworkMode() != NetworkMode.HOST  && deployment.getUsedLoadBalancer() == 0) {
                lbs = loadBalancerBiz.getInnerAndExternalLoadBalancerByDeployId(deployment.getId());
                checkLoadBalancer(kubeUtils, lbs);
            }
            deployResourceHandler.update(version, lbs, allExtraEnvs, policy, event.getEid(), versionId);
        } catch (K8sDriverException | DriverException e) {
            failedDeployment(deployment.getId(), event, e);
        }
    }

    @Override
    public void scaleUpDeployment(Deployment deployment, int versionId, int replicas, List<EnvDraft> allExtraEnvs, User user)
            throws DeploymentEventException, IOException, DeploymentTerminatedException {
        KubeUtils client;
        DeployResourceHandler deployResourceHandler;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, client);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        List<DeploymentSnapshot> currentRunningSnapshot = null;
        try {
            // ** find rc
            PodList podList = getPodListByDeployment(client, deployment);
            currentRunningSnapshot = queryCurrentSnapshotWithPodRunning(podList);
            List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(currentRunningSnapshot, versionId, replicas);
            long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                    DeployOperation.SCALE_UP,
                    user,
                    currentRunningSnapshot,
                    currentRunningSnapshot,
                    dstSnapshot);
            deploymentStatusManager.freshEvent(eventId, currentRunningSnapshot);
            Version version = versionBiz.getVersion(deployment.getId(), versionId);
            checkSecret(client, version, deployment);
            //loadBalancer
            if (deployment.getNetworkMode() != NetworkMode.HOST  && deployment.getUsedLoadBalancer() == 0) {
                List<LoadBalancer> lbs = loadBalancerBiz.getInnerAndExternalLoadBalancerByDeployId(deployment.getId());
                checkLoadBalancer(client, lbs);
            }
            if (deployment.getUsedLoadBalancer() == 0) {
                deployResourceHandler.scaleUp(version, replicas);
                deployResourceHandler.removeOtherDeploy(versionId);
            }
        } catch (IOException | K8sDriverException | DriverException e) {
            deploymentStatusManager.failedEventForDeployment(deployment.getId(), currentRunningSnapshot, e.getMessage());
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    @Override
    public void scaleDownDeployment(Deployment deployment, int versionId, int replicas, List<EnvDraft> allExtraEnvs, User user)
            throws DeploymentEventException, IOException, DeploymentTerminatedException {
        KubeUtils client;
        DeployResourceHandler deployResourceHandler;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, client);

        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        List<DeploymentSnapshot> currentRunningSnapshot = null;
        try {
            PodList podList = getPodListByDeployment(client, deployment);
            currentRunningSnapshot = queryCurrentSnapshotWithPodRunning(podList);
            List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(currentRunningSnapshot, versionId, replicas);
            long eventId = deploymentStatusManager.registerEvent(deployment.getId(),
                    DeployOperation.SCALE_DOWN,
                    user,
                    currentRunningSnapshot,
                    currentRunningSnapshot,
                    dstSnapshot);
            deploymentStatusManager.freshEvent(eventId, currentRunningSnapshot);
            Version version = versionBiz.getVersion(deployment.getId(), versionId);
            checkSecret(client, version, deployment);
            //loadBalancer
            if (deployment.getNetworkMode() != NetworkMode.HOST  && deployment.getUsedLoadBalancer() == 0) {
                List<LoadBalancer> lbs = loadBalancerBiz.getInnerAndExternalLoadBalancerByDeployId(deployment.getId());
                checkLoadBalancer(client, lbs);
            }
            if (deployment.getUsedLoadBalancer() == 0) {
                deployResourceHandler.scaleDown(version, replicas);
                deployResourceHandler.removeOtherDeploy(versionId);
            }
        } catch (IOException | K8sDriverException | DriverException e) {
            deploymentStatusManager.failedEventForDeployment(deployment.getId(), currentRunningSnapshot, e.getMessage());
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    private DeployResourceHandler getDeployResourceHandler(Deployment deployment, KubeUtils kubeUtils) throws K8sDriverException {
        String deployClass = deployment.getDeploymentType().getDeployClassName();
        if (deployClass == null) {
            throw new K8sDriverException("A deployment must have deployment type");
        }
        Server server = globalBiz.getServer();
        if (server == null) {
            throw new K8sDriverException("Global configuration of Server not set!");
        }
        DeployResourceHandler deployResourceHandler = ReflectFactory.createDeployResourceHandler(deployClass, kubeUtils, deployment, server.getUrl());
        if (deployResourceHandler == null) {
            throw new K8sDriverException("Cannot create deploy handler with deployment :" + deployment);
        }
        return deployResourceHandler;
    }

    private Map<String, String> buildDeploySelector(Deployment deployment) {
        Map<String, String> selector = new HashMap<>();
        selector.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return selector;
    }

    private PodList getPodListByDeployment(KubeUtils kubeUtils, Deployment deployment)
            throws DeploymentEventException {
        try {
            return kubeUtils.listPod(buildDeploySelector(deployment));
        } catch (K8sDriverException e) {
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    private List<DeploymentSnapshot> queryCurrentSnapshot(PodList podList) {
        if (podList == null || podList.getItems() == null || podList.getItems().size() == 0) {
            return null;
        }
        Map<Long, Long> snapshots = new HashMap<>();
        for (Pod pod : podList.getItems()) {
            if (pod == null || pod.getMetadata() == null || pod.getMetadata().getLabels() == null) {
                continue;
            }
            String longData = pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR);
            if (StringUtils.isBlank(longData)) {
                continue;
            }
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

    private List<DeploymentSnapshot> queryCurrentSnapshotWithPodRunning(PodList podList) {
        if (podList == null || podList.getItems() == null || podList.getItems().size() == 0) {
            return null;
        }
        Map<Long, Long> snapshots = new HashMap<>();
        for (Pod pod : podList.getItems()) {
            if (pod == null || pod.getMetadata() == null || pod.getMetadata().getLabels() == null) {
                continue;
            }
            String longData = pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR);
            if (StringUtils.isBlank(longData)) {
                continue;
            }
            if (!PodUtils.isPodReady(pod)) {
                continue;
            }
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
            throws ParseException, K8sDriverException {
        Deployment deployment = deploymentBiz.getDeployment(deploymentId);
        KubeUtils client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        Map<String, String> rcSelector = buildDeploySelectorWithSpecifyVersion(deployment, versionId);
        PodList podList = client.listPod(rcSelector);
        return PodUtils.isAnyFailed(podList);
    }

    @Override
    public void checkBasicEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException, DataBaseContentException, ParseException, DeploymentTerminatedException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        try {
            PodList podList = getPodListByDeployment(client, deployment);
            List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshot(podList);
            List<DeploymentSnapshot> currentRunningSnapshot = queryCurrentSnapshotWithPodRunning(podList);
            List<DeploymentSnapshot> desiredSnapshot = event.getTargetSnapshot();
            if (currentSnapshot == null && PodUtils.isExpireForEventNotReallyHappen(event.getStartTime())) {
                deleteUpdaterJob(client, deployment.getId());
                deploymentStatusManager.failedEvent(event.getEid(), null, "no replication controller found for event(eid="
                        + event.getEid() + ")");
                return;
            }
            if (desiredSnapshot == null) {
                deleteUpdaterJob(client, deployment.getId());
                deploymentStatusManager.failedEvent(event.getEid(), currentRunningSnapshot, "null desired snapshot");
                return;
            }

            for (DeploymentSnapshot deploymentSnapshot : desiredSnapshot) {
                if (checkAnyInstanceFailed(event.getDeployId(), deploymentSnapshot.getVersion())) {
                    deleteUpdaterJob(client, deployment.getId());
                    deploymentStatusManager.failedEvent(event.getEid(), currentRunningSnapshot, "one of pod is start failed");
                    return;
                }
            }
            if (isSnapshotEquals(currentSnapshot, event.getTargetSnapshot()) && isSnapshotEquals(currentRunningSnapshot, event.getTargetSnapshot())) {
                deleteUpdaterJob(client, deployment.getId());
                deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
            } else {
                deploymentStatusManager.freshEvent(event.getEid(), currentRunningSnapshot);
            }
        } catch (K8sDriverException e) {
            throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
        }
    }

    @Override
    public void checkAbortEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException, DeploymentTerminatedException {
        KubeUtils client;
        DeployResourceHandler deployResourceHandler;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, client);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        PodList podList = getPodListByDeployment(client, deployment);
        List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshot(podList);
        List<DeploymentSnapshot> currentRunningSnapshot = queryCurrentSnapshotWithPodRunning(podList);
        switch (event.getOperation()) {
            case ABORT_START:
                if (currentSnapshot == null || currentSnapshot.isEmpty()) {
                    deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
                } else {
                    try {
                        deployResourceHandler.delete();
                    } catch (K8sDriverException e) {
                        throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
                    }
                    deploymentStatusManager.freshEvent(event.getEid(), currentRunningSnapshot);
                }
                break;
            case ABORT_UPDATE:
            case ABORT_ROLLBACK:
                try {
                    deployResourceHandler.abortUpdateOrRollBack();
                    deploymentStatusManager.succeedEvent(event.getEid(), currentRunningSnapshot);
                } catch (K8sDriverException e) {
                    deploymentStatusManager.failedEvent(event.getEid(), currentRunningSnapshot, "Abort failed of rolling operation.");
                }
                break;
            case ABORT_SCALE_UP:
            case ABORT_SCALE_DOWN:
                try {
                    deployResourceHandler.abortScales();
                    deploymentStatusManager.succeedEvent(event.getEid(), currentRunningSnapshot);
                } catch (Exception e) {
                    deploymentStatusManager.failedEvent(event.getEid(), currentRunningSnapshot,
                            "Adjust deployment replicas failed when abort scale operation.");
                }
                break;
            default:
                throw new DeploymentEventException("Deploy event operation '" + event.getOperation() + "' can not be check as abort event");
        }
    }

    @Override
    public void checkStopEvent(Deployment deployment, DeployEvent event)
            throws DeploymentEventException, IOException, DeploymentTerminatedException {
        KubeUtils client;
        DeployResourceHandler deployResourceHandler;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, client);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        PodList podList = getPodListByDeployment(client, deployment);
        List<DeploymentSnapshot> currentSnapshot = queryCurrentSnapshot(podList);
        if (currentSnapshot == null || currentSnapshot.isEmpty()) {
            deploymentStatusManager.succeedEvent(event.getEid(), currentSnapshot);
        } else {
            try {
                deployResourceHandler.delete();
            } catch (K8sDriverException e) {
                throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
            }
            deploymentStatusManager.freshEvent(event.getEid(), currentSnapshot);
        }
    }

    @Override
    public void expiredEvent(Deployment deployment, DeployEvent event) throws DeploymentEventException, IOException, DeploymentTerminatedException {
        KubeUtils client;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        PodList podList = getPodListByDeployment(client, deployment);
        deploymentStatusManager.failedEvent(event.getEid(), queryCurrentSnapshotWithPodRunning(podList), "Operation expired. " + event.getMessage());
    }

    @Override
    public List<Version> getCurrnetVersionsByDeployment(Deployment deployment) throws DeploymentEventException {
        if (deployment == null) {
            return null;
        }
        KubeUtils client = null;
        DeployResourceHandler deployResourceHandler;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            deployResourceHandler = getDeployResourceHandler(deployment, client);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        // get current versions
        PodList podList = getPodListByDeployment(client, deployment);
        List<DeploymentSnapshot> deploymentSnapshots = queryCurrentSnapshot(podList);
        if (deploymentSnapshots != null && deploymentSnapshots.isEmpty()) {
            try {
                deploymentSnapshots = deployResourceHandler.queryDesiredSnapshot();
            } catch (K8sDriverException e) {
                throw new DeploymentEventException(e);
            }
        }
        List<Version> versions = null;
        if (deploymentSnapshots != null) {
            versions = new ArrayList<>(deploymentSnapshots.size());
            for (DeploymentSnapshot deploymentSnapshot : deploymentSnapshots) {
                Version version = versionBiz.getVersion(deployment.getId(), (int) deploymentSnapshot.getVersion());
                versions.add(version);
            }
        }
        return versions;
    }

    @Override
    public long getTotalReplicasByDeployment(Deployment deployment) throws DeploymentEventException {
        if (deployment == null) {
            return 0;
        }
        KubeUtils client = null;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        // get current versions
        PodList podList = getPodListByDeployment(client, deployment);
        List<DeploymentSnapshot> deploymentSnapshots = queryCurrentSnapshot(podList);
        return getTotalReplicas(deploymentSnapshots);
    }
    
    private Map<String, String> buildDeploySelectorWithSpecifyVersion(Deployment deployment, long versionV) {
        Map<String, String> selector = buildDeploySelector(deployment);
        selector.put(GlobalConstant.VERSION_STR, String.valueOf(versionV));
        return selector;
    }

    private void failedDeployment(int deployId, DeployEvent event, Exception e) {
        deploymentStatusBiz.setDeploymentStatus(deployId, DeploymentStatus.ERROR);
        event.setLastModify(System.currentTimeMillis());
        event.setEventStatus(DeployEventStatus.FAILED);
        event.setCurrentSnapshot(new ArrayList<DeploymentSnapshot>());
        event.setMessage(e.getMessage());
        deployEventBiz.updateEvent(event);
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

    private void checkSecret(KubeUtils client, Version version, Deployment deployment) throws DeploymentEventException {
        if (version != null && SecretUtils.haveDomeOSRegistry(version.getContainerDrafts())) {
            try {
                if (client.secretInfo(GlobalConstant.SECRET_NAME_PREFIX + deployment.getNamespace()) == null) {
                    Map<String, String> dataMap = new HashMap<>();
                    dataMap.put(GlobalConstant.SECRET_DOCKERCFG_DATA_KEY, SecretUtils.getDomeOSImageSecretData());
                    client.createSecret(GlobalConstant.SECRET_NAME_PREFIX + deployment.getNamespace(),
                            GlobalConstant.SECRET_DOCKERCFG_TYPE, dataMap);
                }
            } catch (K8sDriverException | JSONException e) {
                throw new DeploymentEventException("kubernetes exception with message=" + e.getMessage());
            }
        }
    }

    private Map<String, String> buildJobSelector(int deployId) {
        Map<String, String> selector = new HashMap<>();
        selector.put(GlobalConstant.JOB_DEPLOY_ID_STR, String.valueOf(deployId));
        return selector;
    }

    private void deleteUpdaterJob(KubeUtils client, int deployId) {
        try {
            client.deleteJob(buildJobSelector(deployId));
        } catch (Exception ignored) {
        }
    }
    
    private void checkLoadBalancer(KubeUtils client, List<LoadBalancer> lbs) throws K8sDriverException, DriverException {
        if (lbs != null && lbs.size() > 0) {
            for (LoadBalancer lb : lbs) {
                Service service = new K8sServiceBuilder(lb).build();
                Service oldService = client.serviceInfo(service.getMetadata().getName());
                if (oldService == null) {
                    client.createService(service);
                    logger.info("Service:" + service.getMetadata().getName() + " created successfully");
                } else {
                    logger.info("Service:" + service.getMetadata().getName() + " exists, do not need to create");
                }
            }
        }
    }
    
    @Override
    public void deletePodByDeployIdAndInsName(Deployment deployment, String insName)
            throws DeploymentEventException, IOException {
        KubeUtils kubeUtils;
        DeployResourceHandler deployResourceHandler;
        try {
            kubeUtils = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
            kubeUtils.deletePod(insName);
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
    }
}
