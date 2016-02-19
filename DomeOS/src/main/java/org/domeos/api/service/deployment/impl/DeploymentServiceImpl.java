package org.domeos.api.service.deployment.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.StringUtils;
import org.domeos.api.mapper.cluster.ClusterBasicMapper;
import org.domeos.api.model.cluster.ClusterBasic;
import org.domeos.api.model.deployment.*;
import org.domeos.api.model.global.LabelSelector;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.model.user.RoleType;
import org.domeos.api.model.user.User;
import org.domeos.api.service.deployment.*;
import org.domeos.api.service.deployment.impl.updater.DeployResourceStatus;
import org.domeos.api.service.deployment.impl.updater.DeployResourceStatusManager;
import org.domeos.api.service.deployment.impl.updater.DeploymentUpdater;
import org.domeos.api.service.deployment.impl.updater.DeploymentUpdaterManager;
import org.domeos.api.service.resource.ResourceService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.client.kubernetesclient.util.RCUtils;
import org.domeos.exception.DeploymentEventException;
import org.domeos.global.GlobalConstant;
import org.domeos.kubeutils.KubeUtil;
import org.domeos.shiro.AuthUtil;
import org.domeos.util.MD5Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;

/**
 */
@Service("deploymentService")
public class DeploymentServiceImpl implements DeploymentService{

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    DeployEventBiz deployEventBiz;

    @Autowired
    VersionBiz versionBiz;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    ClusterBasicMapper clusterBasicMapper;

    @Autowired
    ResourceService resourceService;

	@Autowired
    LoadBalanceBiz loadBalanceBiz;

    @Autowired
    DeploymentStatusManager deploymentStatusManager;

    @Autowired
    DeployResourceStatusManager deployResourceStatusManager;

    private DeploymentUpdaterManager updaterManager = new DeploymentUpdaterManager();

    private static Logger logger = LoggerFactory.getLogger(DeploymentServiceImpl.class);

    @Override
    public HttpResponseTemp<?> createDeployment(DeploymentDraft deploymentDraft, long userId) throws Exception {
        if (deploymentDraft == null) {
            return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(null, "deployment is null");
        }

        String errInfo;
        List<LoadBalanceDraft> loadBalanceDrafts = deploymentDraft.getLoadBalanceDrafts();
        if (loadBalanceDrafts != null && loadBalanceDrafts.size() > 0) {
            for (LoadBalanceDraft loadBalanceDraft : loadBalanceDrafts) {
                loadBalanceDraft.setClusterName(deploymentDraft.getClusterName());
                errInfo = loadBalanceDraft.checkLegality();
                if (!StringUtils.isBlank(errInfo)) {
                    return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(null, errInfo);
                }
                int port = loadBalanceDraft.getPort();
                String cluster = loadBalanceDraft.getClusterName();
                if (loadBalanceBiz.getLoadBalanceByClusterPort(port, cluster) != null) {
                    return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(
                            null, "port " + port + " in cluster " + cluster + " has been taken.");
                }
            }
        }

        errInfo = deploymentDraft.checkLegality();
        if (!StringUtils.isBlank(errInfo)) {
            return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(null, errInfo);
        }

        String deployName = deploymentDraft.getDeployName();
        if (deploymentBiz.getIdByName(deployName) != null) {
            return ResultStat.DEPLOYMENT_EXIST.wrap(null);
        }

        // create deployment
        deploymentDraft.setCreateTime(System.currentTimeMillis() / 1000);
        long deployId = deploymentBiz.createDeployment(deploymentDraft);

        // create version
        Version version = versionBiz.buildVersion(deploymentDraft, deployId);
        try {
            versionBiz.createVersion(version);
        } catch (Exception e) {
            deploymentBiz.deleteDeployment(deployId);
            throw e;
        }

        Resource resource = new Resource(deployId, ResourceType.DEPLOY);
        CreatorDraft creatorDraft = deploymentDraft.getCreator();
        resource.setOwner_id(creatorDraft.getCreatorId());
        resource.setOwner_type(creatorDraft.getCreatorType());
        resource.setUpdate_time(new Date());
        resource.setRole(RoleType.MASTER.getRoleName());
        AuthUtil.addResource(resource);

        // set deploymentStatus = STOP
        deploymentStatusManager.registerStartDeploymentStatus(deployId);
        logger.info("create deploy succeed, deployId={}, ownerType={}, ownerId={}", deployId, creatorDraft.getCreatorType(), creatorDraft.getCreatorId());

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> removeDeployment(long deployId, long userId) throws IOException {
        if (!AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.DELETE)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        DeploymentStatus deploymentStatus = deploymentStatusManager.getDeploymentStatus(deployId);
        if (deploymentStatus == null || !deploymentStatus.equals(DeploymentStatus.STOP)) {
            return ResultStat.CANNOT_DELETE_DEPLOYMENT.wrap(null, "deployment should be stopped");
        }

        versionBiz.deleteAllVersion(deployId);
        deploymentBiz.deleteDeployment(deployId);
        resourceService.deleteResourceByIdAndType(ResourceType.DEPLOY, deployId);

        logger.info("delete deploy succeed, deployId={}", deployId);

        return ResultStat.OK.wrap(null);
    }

//    @Override
//    public HttpResponseTemp<?> modifyDeployment(DeploymentDraft deploymentDraft, long userId) throws JsonProcessingException, KVServerException, KVContentException {
//
//        if (deploymentDraft == null) {
//            return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(null, "deployment is null");
//        }
//
//        String errInfo = deploymentDraft.checkLegality();
//        if (!StringUtils.isBlank(errInfo)) {
//            return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(null, errInfo);
//        }
//
//        long id;
//        try {
//            id = deploymentBiz.getIdByName(deploymentDraft.getDeployName());
//        } catch (BindingException e) {
//            e.printStackTrace();
//            return ResultStat.DEPLOYMENT_NOT_EXIST.wrap(null);
//        }
//
//        if (!AuthUtil.verify(userId, id, ResourceType.DEPLOY, OperationType.MODIFY)) {
//            return ResultStat.FORBIDDEN.wrap(null);
//        }
//
//        String content = objectMapper.writeValueAsString(deploymentDraft);
////        deploymentBiz.updateDeploy(deploymentDraft.getDeployName(), content);
//        return ResultStat.OK.wrap(null);
//    }

    @Override
    public HttpResponseTemp<List<DeploymentInfo>> listDeployment(long userId) throws IOException, KubeInternalErrorException, KubeResponseException {
        List<DeploymentInfo> deploymentInfos = null;
        List<Resource> resources = AuthUtil.getResourceList(userId, ResourceType.DEPLOY);

        if (resources != null && resources.size() > 0) {
            List<Long> deployIds = new ArrayList<>(resources.size());
            deploymentInfos = new ArrayList<>(resources.size());

            for (Resource resource : resources) {
                deployIds.add(resource.getResource_id());
            }

            List<Deployment> deployments = deploymentBiz.listDeployment(deployIds);

            for (Deployment deployment : deployments) {
                DeploymentInfo deploymentInfo = new DeploymentInfo(deployment);
                deploymentInfo.setDeploymentStatus(deploymentStatusManager.getDeploymentStatus(deployment.getDeployId()));

                DeployResourceStatus deployResourceStatus = deployResourceStatusManager.getDeployResourceStatusById(deployment.getDeployId());
                if (deployResourceStatus != null) {
                    deploymentInfo.setCpuTotal(deployResourceStatus.getCpuTotal());
                    deploymentInfo.setCpuUsed(deployResourceStatus.getCpuUsed());
                    deploymentInfo.setMemoryTotal(deployResourceStatus.getMemTotal());
                    deploymentInfo.setMemoryUsed(deployResourceStatus.getMemUsed());
                }

                // set default replicas
                deploymentInfo.setReplicas(deployment.getDefaultReplicas());
                deploymentInfo.setStateful(deployment.isStateful());

                // get lastUpdateTime
                long lastUpdateTime = 0;
                List<DeployEvent> deployEvents = deployEventBiz.getEventByDeployId(deployment.getDeployId());
                if (deployEvents != null) {
                    for (DeployEvent deployEvent : deployEvents) {
                        if (deployEvent.getOperation().equals(DeployOperation.UPDATE) && deployEvent.getLastModify() > lastUpdateTime) {
                            lastUpdateTime = deployEvent.getLastModify();
                        }
                    }
                }
                deploymentInfo.setLastUpdateTime(lastUpdateTime);

                deploymentInfos.add(deploymentInfo);
            }
        }
        // sort by createTime
        if (deploymentInfos != null) {
            Collections.sort(deploymentInfos, new Comparator<DeploymentInfo>() {
                @Override
                public int compare(DeploymentInfo o1, DeploymentInfo o2) {
                    return ((Long)o2.getCreateTime()).compareTo(o1.getCreateTime());
                }
            });
        }
        return ResultStat.OK.wrap(deploymentInfos);
    }

    @Override
    public HttpResponseTemp<DeploymentDetail> getDeployment(long deployId, long userId) throws IOException, KubeInternalErrorException, KubeResponseException {
        if (!AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        DeploymentDetail deploymentDetail;

        deploymentDetail = this.buildDeploymentDetail(deployId);

        return ResultStat.OK.wrap(deploymentDetail);
    }

    @Override
    public HttpResponseTemp<?> stopDeployment(long deployId, User user) throws KubeResponseException, IOException, KubeInternalErrorException, DeploymentEventException {
        // ** get deployment
        Deployment deployment;
        try {
            deployment = deploymentBiz.getDeployment(deployId);
            if (deployment == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "no such deployment in database");
            }
        } catch (IOException ex) {
            return ResultStat.DEPLOYMENT_STOP_FAILED.wrap(null, "stop deployment error");
        }

        // ** get cluster
        String clusterName = deployment.getClusterName();
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(clusterName);
        String clusterApiServer = clusterBasic.getApi();
        long clusterId = clusterBasic.getId();

        // ** verify
        if (!AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap("no modify privilege for cluster");
        }
        if (!AuthUtil.verify(user.getId(), deployId, ResourceType.DEPLOY, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap("no modify privilege for deployment");
        }

        // ** get namespace
        String namespace = deployment.getNamespace();
        // ** create kubernetes client
        KubeClient client = new KubeClient(clusterApiServer, namespace);
        // ** get rclist
        try {
            deploymentStatusManager.registerStopEvent(
                    deployId,
                    user,
                    queryDesiredSnapshot(client, deployment),
                    queryCurrentSnapshot(client, deployment));
            deploymentBiz.updateDefaultReplicas(deployId, 0);

            // client.deleteService("domeos-" + deployment.getDeployName());
            new KubeUtil(client).deleteService(buildRCLabel(deployment));
            ReplicationControllerList rcList = client.listReplicationController(buildRCLabel(deployment));
            PodList podList = client.listPod(buildRCSelector(deployment));
            if (rcList == null && podList == null) {
                return ResultStat.OK.wrap(null);
            }
            if (rcList != null && rcList.getItems() != null) {
                for (ReplicationController rc : rcList.getItems()) {
                    client.deleteReplicationController(RCUtils.getName(rc));
                }
            }
        } catch (Exception e) {
            deploymentStatusManager.failedEventForDeployment(
                    deployId,
                    null, // queryCurrentSnapshot(client, deployment),
                    e.getMessage());
            return ResultStat.DEPLOYMENT_STOP_FAILED.wrap(e.getMessage());
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> startDeployment(long deployId, long versionId, int replicas, User user)
            throws IOException, KubeInternalErrorException, KubeResponseException, DeploymentEventException {
        // ** get deployment and version
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        Version version = versionBiz.getVersion(deployId, versionId);
        if (deployment == null || version == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such deploy or version");
        }
        long deploymentId = deployment.getDeployId();

        // ** get cluster
        String clusterName = deployment.getClusterName();
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(clusterName);
        if (clusterBasic == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such cluster for deploy, cluster name is " + clusterName);
        }
        String clusterApiServer = clusterBasic.getApi();
        long clusterId = clusterBasic.getId();

        // ** verify
        if (!AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap("no modify privilege for cluster");
        }
        if (!AuthUtil.verify(user.getId(), deployId, ResourceType.DEPLOY, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap("no modify privilege for deployment");
        }

        // set default replicas
        if (replicas == -1) {
            replicas = deployment.getDefaultReplicas();
        }
        if (deployment.isStateful()) {
            replicas = version.getHostList().size();
        }
        // ** modify event
        try {
            deploymentStatusManager.registerStartEvent(deployId, user,
                    buildSingleDeploymentSnapshot(versionId, replicas));
            deploymentBiz.updateDefaultReplicas(deployId, replicas);
        } catch (DeploymentEventException e) {
            return ResultStat.DEPLOYMENT_START_FAILED.wrap(e.getMessage());
        }

        KubeClient client;
        try {
            // ** get namespace
            String namespace = deployment.getNamespace();
            // ** create kubernetes client
            client = new KubeClient(clusterApiServer, namespace);
            List<Node> nodeList = new LinkedList<>();
            List<String> nodeIpList = new LinkedList<>();
            if (deployment.isStateful()) {
                for (int i = 0, size = version.getHostList().size(); i != size; i++) {
                    Node node = client.nodeInfo(version.getHostList().get(i));
                    if (node == null) {
                        String message = "no node found for " + version.getHostList().get(i);
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                                message);
                        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, message);
                    } else if (node.getMetadata() == null || node.getMetadata().getAnnotations() == null
                            || !node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR)) {
                        String message = "no disk found on node";
                        if (node.getMetadata() != null) {
                            message +=  node.getMetadata().getName();
                        }
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                                message);
                        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, message);
                    } else if (node.getStatus().getAddresses() == null
                            || node.getStatus().getAddresses().length == 0) {
                        String message = "no ip found for node=" + node.getMetadata().getName();
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                                message);
                        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, message);
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
                    if (version.getNetworkMode() == NetworkMode.HOST) {
                        continue;
                    }
                    // ** load balance
                    List<LoadBalanceDraft> loadBalanceDraftList = deployment.getLoadBalanceDrafts();
                    modifyExternalIPs(loadBalanceDraftList, nodeIp);
                    org.domeos.client.kubernetesclient.definitions.v1.Service service =  buildStatefulService(loadBalanceDraftList, deployment, i);
                    new KubeUtil(client).deleteService(service.getMetadata().getLabels());
                    client.createService(service);
                }
                for (int i = 0; i != version.getHostList().size(); i++) {
                    Node node = nodeList.get(i);
                    ReplicationController rc = buildReplicationController(deployment, version, i, nodeIpList);
                    if (rc == null) {
                        String message = "build replication controller of stateful deployment failed";
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                                message);
                        return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, message);
                    }
                    addDataVolumes(rc, node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR), version.getVolumes());
                    client.createReplicationController(rc);
                }
            } else {
                // ** build replication controller
                ReplicationController rc = buildReplicationController(deployment, version);
                if (rc == null || rc.getSpec() == null) {
                    String message = "build replication controller failed";
                    deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                            message);
                    return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, message);
                }
                rc.getSpec().setReplicas(replicas);
                // ** create
                client.createReplicationController(rc);
                // ** load balance
                List<LoadBalanceDraft> loadBalanceDrafts = deployment.getLoadBalanceDrafts();
                if (loadBalanceDrafts != null && loadBalanceDrafts.size() > 0) {
                    LoadBalanceDraft loadBalanceDraft = loadBalanceDrafts.get(0);
                    if (loadBalanceDraft != null) {
                        org.domeos.client.kubernetesclient.definitions.v1.Service service =
                                buildServiceForStateless(loadBalanceDraft, deployment);
                        if (service == null || service.getMetadata() == null
                                || service.getMetadata().getLabels() == null) {
                            String message = "build service for deployId=" + deployId + " failed";
                            deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                                    message);
                            return ResultStat.DEPLOYMENT_START_FAILED.wrap(message);
                        }
                        new KubeUtil(client).deleteService(service.getMetadata().getLabels());
                        client.createService(service);
                    }
                }
            }
        } catch (KubeInternalErrorException e) {
            deploymentStatusManager.failedEventForDeployment(deployId,
                null, // queryCurrentSnapshot(client, deployment),
                e.getMessage());
            return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, e.getMessage());
        } catch (KubeResponseException e)  {
            deploymentStatusManager.failedEventForDeployment(deployId,
                    null, // queryCurrentSnapshot(client, deployment),
                    e.getStatus().getMessage());
            return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, e.getStatus().getMessage());
        } catch (Exception e) {
            deploymentStatusManager.failedEventForDeployment(deployId,
                    null,
                    e.getMessage());
            return ResultStat.DEPLOYMENT_START_FAILED.wrap(null, e.getMessage());
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> startUpdate(long deployId, long versionId, int replicas, User user)
            throws IOException, KubeResponseException, KubeInternalErrorException, DeploymentEventException {
        // ** get deployment and version
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        Version version = versionBiz.getVersion(deployId, versionId);
        if (deployment == null || version == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such deploy or version");
        }
        // ** get cluster
        String clusterName = deployment.getClusterName();
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(clusterName);
        if (clusterBasic == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such cluster in database, name " + clusterName);
        }
        String clusterApiServer = clusterBasic.getApi();
        long clusterId = clusterBasic.getId();

        // ** verify
        if (!AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null, "no modify privilege for cluster");
        }
        if (!AuthUtil.verify(user.getId(), deployId, ResourceType.DEPLOY, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null, "no modify privilege for deployment");
        }

        // ** create kubeclient
        KubeClient client = new KubeClient(clusterApiServer, deployment.getNamespace());
        // ** check status
        List<DeploymentSnapshot> currentSnapshot;
        try {
            List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client,
                    buildRCLabel(deployment));
            currentSnapshot = queryCurrentSnapshot(client,
                    buildRCSelector(deployment));
            int totalReplicas = (int)getTotalReplicas(srcSnapshot);
            if (replicas != -1) {
                totalReplicas = replicas;
            }
            if (deployment.isStateful()) {
                totalReplicas = version.getHostList().size();
            }
            deploymentStatusManager.registerStartUpdateEvent(deployId, user,
                srcSnapshot,
                currentSnapshot,
                buildSingleDeploymentSnapshot(versionId, totalReplicas));
            deploymentBiz.updateDefaultReplicas(deployId, totalReplicas);
        } catch (DeploymentEventException | KubeResponseException | KubeInternalErrorException e) {
            return ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(null, e.getMessage());
        }
        try {
            // ** create and start updater
            DeploymentUpdater updater = updaterManager.createUpdater(client, deployment, version, replicas);
            updater.start();
        } catch (Exception e) {
            String message = "start updater failed with message=" + e.getMessage();
            deploymentStatusManager.failedEventForDeployment(deployId, null, message);
            return ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(null, message);
        }
        /*
        DeploymentUpdateStatus updateStatus;
        if (!isSuccess) {
            updateStatus = updater.getStatus();
            currentSnapshot = queryCurrentSnapshot(client,
                    buildRCSelector(deployment));
            deploymentStatusManager.failedEventForDeployment(deployId, currentSnapshot, updateStatus.getReason());
            return ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(updateStatus);
        }
        */
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> startRollback(long deployId, long versionId, int replicas, User user)
            throws IOException, KubeResponseException, KubeInternalErrorException, DeploymentEventException {
        // ** get deployment and version
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        Version version = versionBiz.getVersion(deployId, versionId);

        if (deployment == null || version == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such deploy or versoin in database");
        }
        // ** get cluster
        String clusterName = deployment.getClusterName();
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(clusterName);
        if (clusterBasic == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such cluster in database, name=" + clusterName);
        }
        String clusterApiServer = clusterBasic.getApi();
        long clusterId = clusterBasic.getId();

        if (!AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null, "no modify privilege for cluster");
        }
        if (!AuthUtil.verify(user.getId(), deployId, ResourceType.DEPLOY, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null, "no modify privilege for deployment");
        }

//        if (version.getLogDraft() != null) {
//            // set log flume image related
//            clusterLogService.setLogDraft(version, clusterId);
//            String logDraftCheckLegality = version.getLogDraft().checkContainerLegality();
//            if (!StringUtils.isBlank(logDraftCheckLegality)) {
//                return ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(logDraftCheckLegality);
//            }
//        }

        KubeClient client = new KubeClient(clusterApiServer, deployment.getNamespace());

        // check status
        List<DeploymentSnapshot> currentSnapshot;
        try {
            List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client,
                    buildRCLabel(deployment));
            currentSnapshot = queryCurrentSnapshot(client,
                    buildRCSelector(deployment));
            int totalReplicas = (int)getTotalReplicas(srcSnapshot);
            if (replicas != -1) {
                totalReplicas = replicas;
            }
            deploymentStatusManager.registerStartRollbackEvent(deployId, user,
                srcSnapshot,
                currentSnapshot,
                buildSingleDeploymentSnapshot(versionId, totalReplicas));
            deploymentBiz.updateDefaultReplicas(deployId, totalReplicas);
        } catch (DeploymentEventException | KubeResponseException | KubeInternalErrorException e) {
            ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(e.getMessage());
        }
        try {
            DeploymentUpdater updater = updaterManager.createUpdater(client, deployment, version, replicas);
            updater.start();
        } catch (Exception e) {
            String message = "start updater failed with message=" + e.getMessage();
            deploymentStatusManager.failedEventForDeployment(deployId, null, message);
            return ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(null, message);
        }
        /*
        DeploymentUpdateStatus updateStatus;
        if (!isSuccess) {
            updateStatus = updater.getStatus();
            currentSnapshot = queryCurrentSnapshot(client,
                    buildRCSelector(deployment));
            deploymentStatusManager.failedEventForDeployment(deployId, currentSnapshot, updateStatus.getReason());
            return ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(updateStatus);
        }
        */
        return ResultStat.OK.wrap(null);
    }

//    @Override
//    public HttpResponseTemp<?> deleteUpdate(long deployId, long userId)
//            throws KVContentException, KVServerException, IOException {
//        Deployment deployment = deploymentBiz.getDeploy(deployId);
//
//        updaterManager.removeUpdater(deployId);
//        return ResultStat.OK.wrap(null);
//    }
//
//    @Override
//    public HttpResponseTemp<DeploymentUpdateStatus> getUpdateStatus(long deployId, long userId)
//            throws KVContentException, KVServerException, IOException {
//        Deployment deployment = deploymentBiz.getDeploy(deployId);
//
//        return ResultStat.OK.wrap(updaterManager.getUpdater(deployId).getStatus());
//    }

    @Override
    public HttpResponseTemp<?> scaleUpDeployment(long deployId, long versionId, int replicas, User user)
            throws IOException, DeploymentEventException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such deploy in database");
        }
        String clusterName = deployment.getClusterName();
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(clusterName);
        if (clusterBasic == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such cluster in database, name=" + clusterName);
        }
        String clusterApiServer = clusterBasic.getApi();
        long clusterId = clusterBasic.getId();

        if (!AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap("no modify privilege for cluster");
        }

        KubeClient client = new KubeClient(clusterApiServer, deployment.getNamespace());
        Map<String, String> rcSelector = buildRCLabel(deployment);
        ReplicationController targetRC;
        List<DeploymentSnapshot> currentSnapshot = null;
        try {
            ReplicationControllerList rcList = client.listReplicationController(rcSelector);
            // ** choose the first rc template, treating it as no status
            if (rcList == null || rcList.getItems() == null || rcList.getItems().length == 0
                    || rcList.getItems()[0] == null) {
                // ** no rc found
                return ResultStat.DEPLOYMENT_SCALE_NO_RC_FOUND.wrap(null, "no replication controller found");
            }
            // ** find rc
            if (versionId == -1) {
                targetRC = findMaxVersionRC(rcList.getItems());
                if (targetRC == null) {
                    return ResultStat.DEPLOYMENT_SCALE_BAD_RC_FOUND.wrap(null, "rc is null");
                }
                versionId = Long.parseLong(targetRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            } else {
                targetRC = findRC(rcList.getItems(), versionId);
                if (targetRC == null) {
                    // ** ** no rc online for versionId now, build new
                    Version version = versionBiz.getVersion(deployId, versionId);
                    targetRC = buildReplicationController(deployment, version);
                }
            }
            // ** register event
            List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client, deployment);
            currentSnapshot = queryCurrentSnapshot(client, deployment);
            List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(srcSnapshot, versionId, replicas);
            deploymentStatusManager.registerScaleUpEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
            deploymentBiz.updateDefaultReplicas(deployId, replicas);
            // ** do scale
            targetRC.getSpec().setReplicas(replicas);
            scaleRCEvenNotExist(client, targetRC);
        } catch (KubeResponseException | KubeInternalErrorException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, currentSnapshot, e.getMessage());
            return ResultStat.KUBE_EXCEPTION.wrap(null, "kubernetes exception with message=" + e.getMessage());
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, currentSnapshot, e.getMessage());
            return ResultStat.KUBE_EXCEPTION.wrap(null, "deployment event exception with message=" + e.getMessage());
        } catch (Exception e) {
            deploymentStatusManager.failedEventForDeployment(deployId, currentSnapshot, e.getMessage());
            return ResultStat.KUBE_EXCEPTION.wrap(null, "unknown exception with message=" + e.getMessage());
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> scaleDownDeployment(long deployId, long versionId, int replicas, User user)
            throws IOException, DeploymentEventException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such deploy in database");
        }
        String clusterName = deployment.getClusterName();
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(clusterName);
        if (clusterBasic == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such cluster in database, name=" + clusterName);
        }
        String clusterApiServer = clusterBasic.getApi();
        long clusterId = clusterBasic.getId();

        if (!AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap("no modify privilege for cluster");
        }

        KubeClient client = new KubeClient(clusterApiServer, deployment.getNamespace());
        Map<String, String> rcSelector = buildRCLabel(deployment);
        ReplicationController targetRC;
        List<DeploymentSnapshot> currentSnapshot = null;
        try {
            ReplicationControllerList rcList = client.listReplicationController(rcSelector);
            // ** choose the first rc template, treated it as no status
            if (rcList == null || rcList.getItems() == null || rcList.getItems().length == 0
                    || rcList.getItems()[0] == null) {
                // no rc found
                return ResultStat.DEPLOYMENT_SCALE_NO_RC_FOUND.wrap(null, "no replication controller found");
            }
            // ** find rc
            if (versionId == -1) {
                targetRC = findMaxVersionRC(rcList.getItems());
                if (targetRC == null) {
                    return ResultStat.DEPLOYMENT_SCALE_BAD_RC_FOUND.wrap(null, "rc is null");
                }
                versionId = Long.parseLong(targetRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            } else {
                targetRC = findRC(rcList.getItems(), versionId);
                if (targetRC == null) {
                    // ** ** no rc online now, build new
                    Version version = versionBiz.getVersion(deployId, versionId);
                    targetRC = buildReplicationController(deployment, version);
                }
            }
            // ** register event
            List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client, deployment);
            currentSnapshot = queryCurrentSnapshot(client, deployment);
            List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(srcSnapshot, versionId, replicas);
            deploymentStatusManager.registerScaleDownEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
            deploymentBiz.updateDefaultReplicas(deployId, replicas);
            // ** do scale
            targetRC.getSpec().setReplicas(replicas);
            scaleRCEvenNotExist(client, targetRC);
        } catch (KubeResponseException | KubeInternalErrorException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, currentSnapshot, e.getMessage());
            return ResultStat.KUBE_EXCEPTION.wrap(null, "kubernetes exception with message=" + e.getMessage());
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, currentSnapshot, e.getMessage());
            return ResultStat.KUBE_EXCEPTION.wrap(null, "deployment event exception with message=" + e.getMessage());
        } catch (Exception e) {
            deploymentStatusManager.failedEventForDeployment(deployId, currentSnapshot, e.getMessage());
            return ResultStat.KUBE_EXCEPTION.wrap(null, "unknown exception with message=" + e.getMessage());
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<List<DeployEvent>> listDeployEvent(long deployId, long userId) throws IOException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such deploy in database");
        }
        String clusterName = deployment.getClusterName();
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(clusterName);
        if (clusterBasic == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such cluster in database, name=" + clusterName);
        }
        long clusterId = clusterBasic.getId();

        if (!AuthUtil.verify(userId, clusterId, ResourceType.CLUSTER, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null, "no list privilege for cluster");
        }
        if (deployId < 1) {
            return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(null, "deployId is illegal");
        }
        List<DeployEvent> deployEvents = deployEventBiz.getEventByDeployId(deployId);

        // sort by eid
        if (deployEvents != null) {
            Collections.sort(deployEvents, new Comparator<DeployEvent>() {
                @Override
                public int compare(DeployEvent o1, DeployEvent o2) {
                    return ((Long) o2.getEid()).compareTo(o1.getEid());
                }
            });
        }

        return ResultStat.OK.wrap(deployEvents);
    }

    private DeploymentDetail buildDeploymentDetail(long deployId) throws IOException, KubeInternalErrorException, KubeResponseException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            return null;
        }
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(deployment.getClusterName());
        if (clusterBasic == null) {
            logger.warn("no such cluster in database!");
            return null;
        }

        DeploymentDetail deploymentDetail = new DeploymentDetail();
        deploymentDetail.setDeployId(deployment.getDeployId());
        deploymentDetail.setDeployName(deployment.getDeployName());
        deploymentDetail.setNamespace(deployment.getNamespace());
        deploymentDetail.setStateful(deployment.isStateful());
        deploymentDetail.setScalable(deployment.isScalable());
        deploymentDetail.setDefaultReplicas(deployment.getDefaultReplicas());
        deploymentDetail.setClusterName(clusterBasic.getName());
        deploymentDetail.setClusterId(clusterBasic.getId());

        // set last update time
        long lastUpdateTime = 0;
        List<DeployEvent> deployEvents = deployEventBiz.getEventByDeployId(deployId);
        if (deployEvents != null && deployEvents.size() > 0) {
            for (DeployEvent deployEvent : deployEvents) {
                if (deployEvent.getOperation().equals(DeployOperation.UPDATE) && deployEvent.getLastModify() > lastUpdateTime) {
                    lastUpdateTime = deployEvent.getLastModify();
                }
            }
        }
        deploymentDetail.setLastUpdateTime(lastUpdateTime);

        // set deployment status
        deploymentDetail.setDeploymentStatus(deploymentStatusManager.getDeploymentStatus(deployId));

        // set current replicas
        String clusterApiServer = clusterBasic.getApi();
        String namespace = deployment.getNamespace();
        long currentReplicas;
        KubeClient client = new KubeClient(clusterApiServer, namespace);
        List<DeploymentSnapshot> deploymentSnapshots = queryCurrentSnapshot(client, deployment);
        currentReplicas = getTotalReplicas(deploymentSnapshots);
        deploymentDetail.setCurrentReplicas(currentReplicas);

        // get current versions
        if (deploymentSnapshots != null) {
            List<VersionDetail> versionDetails = new ArrayList<>(deploymentSnapshots.size());
            for (DeploymentSnapshot deploymentSnapshot : deploymentSnapshots) {
                VersionDetail versionDetail = versionBiz.buildVersionDetail(deployId, deploymentSnapshot.getVersion());
                if (versionDetail != null) {
                    versionDetails.add(versionDetail);
                }
            }
            deploymentDetail.setCurrentVersions(versionDetails);
        } else {
            deploymentDetail.setCurrentVersions(null);
        }

        deploymentDetail.setHealthChecker(deployment.getHealthChecker());

        deploymentDetail.setLoadBalanceDrafts(deployment.getLoadBalanceDrafts());

        return deploymentDetail;
    }

    public static ReplicationController buildReplicationController(Deployment deployment, Version version) {
        return buildReplicationController(deployment, version, -1, null);
    }

    // may modify version
    public static ReplicationController buildReplicationController(
            Deployment deployment,
            Version version,
            int index,
            List<String> nodeIpList) {
        if (deployment == null || version == null) {
            return null;
        }
        if (!deployment.isStateful()) {
            index = -1;
        } else if (nodeIpList == null
                || version.getHostList() == null
                || index < 0
                || index >= version.getHostList().size()) {
            return null;
        }
        ReplicationController rc = new ReplicationController();
        // * init rc metadate
        String rcName = null;
        Map<String, String> rcLabel = buildRCLabelWithSpecifyVersion(deployment, version);
        if (index < 0) {
            rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getDeployName() + "-v" + version.getVersion();
        } else {
            rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getDeployName() + "-v" + version.getVersion() + "-i" + index;
            addIndex(rcLabel, index);
        }
        rc.putMetadata(new ObjectMeta())
                .getMetadata()
                .putName(rcName.toLowerCase())
                .putLabels(rcLabel)
                .putNamespace(deployment.getNamespace());

        // * init rc spec
        ReplicationControllerSpec rcSpec = new ReplicationControllerSpec();
        Map<String, String> rcSelector = buildRCSelectorWithSpecifyVersion(deployment, version);
        if (index < 0) {
            rcSpec.setReplicas(deployment.getDefaultReplicas());
        } else {
            rcSpec.setReplicas(1);
            addIndex(rcSelector, index);
        }
        // ** init pod template
        rcSpec.putTemplate(new PodTemplateSpec())
                .getTemplate()
                .putMetadata(new ObjectMeta())
                .getMetadata()
                .putLabels(rcSelector)
                .putDeletionGracePeriodSeconds(0);
        // *** create node selector
        rcSpec.getTemplate()
                .putSpec(new PodSpec());
        if (index < 0) {
            Map<String, String> nodeSelector = new HashMap<>();
            List<LabelSelector> selectors = version.getLabelSelectors();
            if (selectors != null) {
                for (LabelSelector selector : version.getLabelSelectors()) {
                    if (selector.getName() == null) {
                        continue;
                    }
                    if (selector.getContent() == null) {
                        selector.setContent("");
                    }
                    nodeSelector.put(selector.getName(), selector.getContent());
                }
            }
            rcSpec.getTemplate().getSpec().putNodeSelector(nodeSelector);
        } else if (index < version.getHostList().size()){
            String nodeName = version.getHostList().get(index);
            rcSpec.getTemplate().getSpec()
                    .putNodeName(nodeName)
                    .putHostNetwork(version.getNetworkMode() == NetworkMode.HOST);
        } else {
            return null;
        }
        /*
        if (deployment.getHostEnv() != null) {
            nodeSelector.put("hostEnv", deployment.getHostEnv().toString());
        }
        */
        // *** init container and node selector
        /*
        if (index >= 0 && index < version.getHostList().size()) {
            addHostNetworkEnvs(deployment, version);
        }
        */
        Container[] containers = buildContainer(deployment, version, index, nodeIpList);
        if (containers == null) {
            return null;
        }
        rcSpec.getTemplate()
                .getSpec()
                .putContainers(containers);
        // if configure to autoCollect or autoDelete log, need to set volumes
        // so that data can be shared accross different containers in a Pod
        if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
            Volume[] volumes = LogDraft.formatPodVolume(version.getLogDraft());
            rcSpec.getTemplate().getSpec().setVolumes(volumes);
        }
        rc.setSpec(rcSpec);
        return rc;
    }

    public static void addDataVolumes(ReplicationController rc, String disk, List<String> mountPoint) {
        String deployId = rc.getMetadata().getLabels().get(GlobalConstant.DEPLOY_ID_STR);
        Volume[] volumes = new Volume[mountPoint.size()];
        VolumeMount[] volumeMounts = new VolumeMount[mountPoint.size()];
        for (int i = 0; i < mountPoint.size(); i++) {
            // String volumeName = "data-" + RandomStringUtils.randomAlphabetic(10).toLowerCase();
            String volumeName = "data-" + deployId + "-" + MD5Util.getMD5InHex(mountPoint.get(i));
            volumes[i] = new Volume();
            volumes[i].setName(volumeName);
            volumes[i].setHostPath(new HostPathVolumeSource()
                    .putPath(disk + "/domeos/delpoyment/"
                            + deployId + "/" + mountPoint.get(i)));
            volumeMounts[i] = new VolumeMount();
            volumeMounts[i].setName(volumeName);
            volumeMounts[i].setMountPath(mountPoint.get(i));
        }
        rc.getSpec().getTemplate().getSpec().setVolumes(volumes);
        for (Container container : rc.getSpec().getTemplate().getSpec().getContainers()) {
            container.putVolumeMounts(volumeMounts);
        }
    }

    public static Container[] buildContainer(Deployment deployment, Version version, int index, List<String> nodeIpList) {
        if (version == null || version.getContainerDrafts() == null || version.getContainerDrafts().size() == 0) {
            return null;
        }
        int size = version.getContainerDrafts().size();
        List<Container> containers = new ArrayList<>(size);
        HealthChecker healthChecker = deployment.getHealthChecker();
        Probe probe = buildProbe(healthChecker);

        List<EnvDraft> extraEnvs = null;
        if (index >= 0 && index < version.getHostList().size()) {
            extraEnvs = buildHostNetworkEnvs(deployment, version, nodeIpList);
        }
        // idx used to distinguish container name
        int idx = 0;
        for (ContainerDraft containerDraft : version.getContainerDrafts()) {
            Container container = new Container();
            container.putImage(containerDraft.formatImage() + ":" + containerDraft.getTag())
                    .putName(deployment.getDeployName() + "-" + idx)
                    .putResources(formatResource(containerDraft));

            // ** ** add env
            List<EnvDraft> containerEnvs = new LinkedList<>();
            if (extraEnvs != null) {
                containerEnvs.addAll(extraEnvs);
            }
            if (containerDraft.getEnvs() != null) {
                containerEnvs.addAll(containerDraft.getEnvs());
            }
            if (index >= 0) {
                containerEnvs.add(new EnvDraft("HOST_INDEX", String.valueOf(index)));
                containerEnvs.add(new EnvDraft("HOST_SIZE", String.valueOf(version.getHostList().size())));
            }
            if (!checkEnv(containerEnvs, containerDraft.getEnvCheckers())) {
                return null;
            }
            EnvVar[] envs = formatEnv(containerEnvs);
            container.setEnv(envs);

            if (probe != null) {
                container.setLivenessProbe(probe);
            }

            // if configure to autoCollect or autoDelete log, need to set volumeMount
            if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
                VolumeMount[] volumeMounts = LogDraft.formatOriginalContainerVolumeMount(version.getLogDraft());
                container.setVolumeMounts(volumeMounts);
            }
            containers.add(container);
            idx++;
        }
        // if configured to autoCollect or autoDelete log, then need to add flume-image container
        if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
            Container container = new Container();
            LogDraft logDraft = version.getLogDraft();
            container.putImage(logDraft.getFlumeDraft().formatImage() + ":" + logDraft.getFlumeDraft().getTag())
                .putName(deployment.getDeployName() + "-" + idx)
                .putEnv(LogDraft.formatEnv(logDraft))
                .putVolumeMounts(LogDraft.formatFlumeContainerVolumeMount(logDraft))
                .putResources(formatResource(logDraft.getFlumeDraft()));
            containers.add(container);
            size++;
        }
        return containers.toArray(new Container[size]);
    }

    private static Probe buildProbe(HealthChecker healthChecker) {
        if (healthChecker == null || healthChecker.getType().equals(HealthCheckerType.NONE)) {
            return null;
        }
        Probe probe = new Probe();
        probe.setTimeoutSeconds(healthChecker.getTimeout());
        probe.setInitialDelaySeconds(30);
        switch (healthChecker.getType()) {
            case HTTP:
                HTTPGetAction httpGetAction = new HTTPGetAction();
                httpGetAction.setPath(healthChecker.getUrl());
                httpGetAction.setPort(healthChecker.getPort());
                probe.setHttpGet(httpGetAction);
                break;
            case TCP:
                TCPSocketAction tcpSocketAction = new TCPSocketAction();
                tcpSocketAction.setPort(healthChecker.getPort());
                probe.setTcpSocket(tcpSocketAction);
                break;
            default:
                return null;
        }
        return probe;
    }

    public static EnvVar[] formatEnv(List<EnvDraft> envDrafts) {
        if (envDrafts == null || envDrafts.size() == 0) {
            return null;
        }
        List<EnvVar> envs = new ArrayList<>(envDrafts.size());
        for (EnvDraft envDraft : envDrafts) {
            EnvVar tmpEnv = new EnvVar();
            tmpEnv.putName(envDraft.getKey()).putValue(envDraft.getValue());
            envs.add(tmpEnv);
        }
        return envs.toArray(new EnvVar[envs.size()]);
    }

    public static ResourceRequirements formatResource(ContainerDraft containerDraft) {
        ResourceRequirements result = new ResourceRequirements();
        Map<String, String> resource = new HashMap<>();
        if (containerDraft.getCpu() > 0) {
            resource.put("cpu", String.valueOf(containerDraft.getCpu()));
        }
        if (containerDraft.getMem() > 0) {
            resource.put("memory", String.valueOf(containerDraft.getMem()) + "Mi");
        }
        result.setLimits(resource);
        return result;
    }

    // these two function buildRCLabelWithSpecifyVersion and buildRCSelectorWithSpecifyVersion
    // are very important because they will get the basic information to query what RC and pod
    // a depolyment occupy. And it will avoid overlap pods between different deployment and
    // different version
    public static Map<String, String> buildRCLabelWithSpecifyVersion(Deployment deployment, Version version) {
        Map<String, String> label = buildRCLabel(deployment);
        label.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        return label;
    }

    public static Map<String, String> buildRCLabel(Deployment deployment) {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getDeployId()));
        return label;
    }

    // buildRCSelector will decide which pods will be selected
    public static Map<String, String> buildRCSelectorWithSpecifyVersion(Deployment deployment, Version version) {
        Map<String, String> selector = buildRCSelector(deployment);
        selector.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        return selector;
    }

    public static Map<String, String> buildRCSelector(Deployment deployment) {
        Map<String, String> selector = new HashMap<>();
        selector.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getDeployId()));
        return selector;
    }

    public static void addIndex(Map<String, String> selector, int index) {
        selector.put("index", String.valueOf(index));
    }

    // get snapshot
    public static List<DeploymentSnapshot> queryDesiredSnapshot(KubeClient client, Deployment deployment)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return queryDesiredSnapshot(client, buildRCLabel(deployment));
    }

    public static List<DeploymentSnapshot> queryDesiredSnapshot(KubeClient client, Map<String, String> rcLabel)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        ReplicationControllerList rcList = client.listReplicationController(rcLabel);
        if (rcList == null || rcList.getItems() == null || rcList.getItems().length == 0) {
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

    public static List<DeploymentSnapshot> queryCurrentSnapshot(KubeClient client, Deployment deployment)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return queryCurrentSnapshot(client, buildRCSelector(deployment));
    }

    public static List<DeploymentSnapshot> queryCurrentSnapshot(KubeClient client, Map<String, String> rcSelector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        PodList podList = client.listPod(rcSelector);
        if (podList == null || podList.getItems() == null || podList.getItems().length == 0) {
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

    public static List<DeploymentSnapshot> buildSingleDeploymentSnapshot(long version, int replicas) {
        List<DeploymentSnapshot> snapshots = new LinkedList<>();
        snapshots.add(new DeploymentSnapshot(version, replicas));
        return snapshots;
    }

    // this function will add or replace version in oldSnapshot
    public static List<DeploymentSnapshot> buildDeploymentSnapshotWith(
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

    public static List<DeploymentSnapshot> buildDeploymentSnapshotWith(
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

    public static long getTotalReplicas(List<DeploymentSnapshot> snapshots) {
        long replicas = 0;
        if (snapshots == null || snapshots.size() == 0) {
            return replicas;
        }
        for (DeploymentSnapshot snapshot : snapshots) {
            replicas += snapshot.getReplicas();
        }
        return replicas;
    }

    public static void scaleRCEvenNotExist(KubeClient client, ReplicationController rc)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        int replicas  = rc.getSpec().getReplicas();
        String rcName = RCUtils.getName(rc);
        ReplicationController tmpRC =  client.replicationControllerInfo(rcName);
        if (tmpRC == null) {
            // create rc
            client.createReplicationController(rc);
            return;
        }
        if (tmpRC.getSpec().getReplicas() == replicas) {
            return;
        }
        client.replaceReplicationController(RCUtils.getName(rc), rc);
    }

    public static ReplicationController findMaxVersionRC(ReplicationController[] rcArray) {
        if (rcArray == null || rcArray.length == 0) {
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

    public static ReplicationController findRC(ReplicationController[] rcArray, long versionId) {
        if (rcArray == null || rcArray.length == 0) {
            return null;
        }
        for (ReplicationController rc : rcArray) {
            if (versionId == Long.parseLong(rc.getMetadata().getLabels().get(GlobalConstant.VERSION_STR))) {
                return rc;
            }
        }
        return null;
    }

    private org.domeos.client.kubernetesclient.definitions.v1.Service buildServiceForStateless(LoadBalanceDraft loadBalanceDraft, Deployment deployment) {
        org.domeos.client.kubernetesclient.definitions.v1.Service service = new org.domeos.client.kubernetesclient.definitions.v1.Service();

        // * init metadate
        service.putMetadata(new ObjectMeta())
                .getMetadata()
                .putName(GlobalConstant.RC_NAME_PREFIX + deployment.getDeployName())
                .putLabels(buildRCLabel(deployment))
                .putNamespace(deployment.getNamespace());

        // * init rc spec
        ServiceSpec spec = new ServiceSpec();
        // ** init pod template
        List<String> ips = loadBalanceDraft.getExternalIPs();
        spec.setExternalIPs(ips.toArray(new String[ips.size()]));

        ServicePort[] servicePorts = new ServicePort[1];
        ServicePort servicePort = new ServicePort();
        servicePort.putPort(loadBalanceDraft.getPort())
                .putTargetPort(loadBalanceDraft.getTargetPort());
        servicePorts[0] = servicePort;
        spec.setPorts(servicePorts);

        spec.setType(GlobalConstant.NODE_PORT_STR);

        // *** create pod selector
        spec.setSelector(buildRCSelector(deployment));

        service.setSpec(spec);
        return service;
    }

    private static org.domeos.client.kubernetesclient.definitions.v1.Service buildStatefulService(List<LoadBalanceDraft> loadBalanceDraft, Deployment deployment, int index) {
        if (deployment == null || loadBalanceDraft == null || loadBalanceDraft.size() == 0) {
            return null;
        }
        org.domeos.client.kubernetesclient.definitions.v1.Service service = new org.domeos.client.kubernetesclient.definitions.v1.Service();
        Map<String, String> labels = buildRCLabel(deployment);
        addIndex(labels, index);

        // * init metadate
        service.putMetadata(new ObjectMeta())
                .getMetadata()
                .putName(buildStatefulServiceName(deployment, index))
                .putLabels(labels)
                .putNamespace(deployment.getNamespace());

        // * init rc spec
        ServiceSpec spec = new ServiceSpec();
        List<String> ips = loadBalanceDraft.get(0).getExternalIPs();
        spec.setExternalIPs(ips.toArray(new String[ips.size()]));
        ServicePort[] servicePorts = new ServicePort[loadBalanceDraft.size()];
        for (int i = 0; i < loadBalanceDraft.size(); i++) {
            LoadBalanceDraft draft = loadBalanceDraft.get(i);
            ServicePort servicePort = new ServicePort();
            servicePort.putPort(draft.getPort())
                    .putTargetPort(draft.getTargetPort());
            servicePort.setName(draft.getName());
            servicePorts[i] = servicePort;
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

    public static void modifyExternalIPs(List<LoadBalanceDraft> drafts, String ip) {
        if (drafts == null || ip == null) {
            return;
        }
        for (LoadBalanceDraft draft : drafts) {
            LinkedList<String> externalIPs = new LinkedList<>();
            draft.setExternalIPs(externalIPs);
            externalIPs.add(ip);
        }
    }

    public static String buildStatefulServiceName(Deployment deployment, int index) {
        return buildStatefulServiceName(deployment) + "-" + index;
    }

    public static String buildStatefulServiceName(Deployment deployment) {
        if (deployment.getDeployName().length() > 12) {
            return deployment.getDeployName().substring(0, 12) + "-" + deployment.getDeployId();
        }
        return deployment.getDeployName();
    }

    public static void addEnv(Version version, EnvDraft envDraft) {
        if (version == null || version.getContainerDrafts() == null || envDraft == null) {
            return;
        }
        for (ContainerDraft draft : version.getContainerDrafts()) {
            if (draft.getEnvs() == null) {
                draft.setEnvs(new LinkedList<EnvDraft>());
            }
            draft.getEnvs().add(envDraft);
        }
    }

    public static String formatEnvInPod(String originEnvName) {
        String result = originEnvName.toUpperCase();
        return result.replaceAll("[.-]", "_");
    }

    public static List<EnvDraft> buildHostNetworkEnvs(Deployment deployment, Version version, List<String> nodeIpList) {
        int size = version.getHostList().size();
        List<EnvDraft> hostNetworkEnvs = new LinkedList<>();
        boolean isHostMode = version.getNetworkMode() == NetworkMode.HOST;
        hostNetworkEnvs.add(new EnvDraft("BASIC_SERVICE_NAME", formatEnvInPod(buildStatefulServiceName(deployment))));
        for (int i = 0; i != size; i++) {
            String svcName = formatEnvInPod(buildStatefulServiceName(deployment, i));
            if (isHostMode) {
                hostNetworkEnvs.add(new EnvDraft(svcName + "_SERVICE_HOST", nodeIpList.get(i)));
            }
            for (LoadBalanceDraft loadBalanceDraft : deployment.getLoadBalanceDrafts()) {
                if (isHostMode) {
                    hostNetworkEnvs.add(new EnvDraft(svcName + "_SERVICE_PORT_"
                            + formatEnvInPod(loadBalanceDraft.getName()),
                            String.valueOf(loadBalanceDraft.getTargetPort())));
                }
                hostNetworkEnvs.add(new EnvDraft(svcName + "_SERVICE_TARGET_PORT_"
                            + formatEnvInPod(loadBalanceDraft.getName()),
                            String.valueOf(loadBalanceDraft.getTargetPort())));
            }
        }
        return hostNetworkEnvs;
    }

    public static boolean checkEnv(List<EnvDraft> envs, List<EnvDraft> checker) {
        if (checker == null) {
            return true;
        }
        Map<String, String> checkerMap = new HashMap<>();
        for (EnvDraft draft : checker) {
            checkerMap.put(draft.getKey(), draft.getValue());
        }
        for (EnvDraft draft : envs) {
            String oneChecker = checkerMap.get(draft.getKey());
            if (oneChecker == null) {
                continue;
            }
            if (!Pattern.compile(oneChecker).matcher(draft.getValue()).matches()) {
                return false;
            }
        }
        return true;
    }
}
