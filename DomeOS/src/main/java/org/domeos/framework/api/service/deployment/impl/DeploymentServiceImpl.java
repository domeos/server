package org.domeos.framework.api.service.deployment.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.deployment.LoadBalanceDraft;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.Container;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.client.kubernetesclient.util.RCUtils;
import org.domeos.exception.DeploymentEventException;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerBiz;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.consolemodel.CreatorDraft;
import org.domeos.framework.api.consolemodel.deployment.*;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.DeployIlegalException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.mapper.global.GlobalMapper;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.deployment.DeploymentService;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.k8s.KubeUtil;
import org.domeos.framework.engine.k8s.RcBuilder;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdater;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdaterManager;
import org.domeos.framework.engine.runtime.IResourceStatus;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.MD5Util;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

/**
 */
@Service("deploymentService")
public class DeploymentServiceImpl implements DeploymentService {

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    ResourceBiz resourceBiz;

    @Autowired
    VersionBiz versionBiz;

    @Autowired
    LoadBalancerBiz loadBalancerBiz;

    @Autowired
    DeploymentStatusManager deploymentStatusManager;

    @Autowired
    @Qualifier("deployResourceStatusManager")
    IResourceStatus resourceStatus;

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    DeployEventBiz deployEventBiz;

    @Autowired
    K8SEventBiz k8SEventBiz;

    @Autowired
    GlobalMapper globalMapper;

    @Autowired
    OperationHistory operationHistory;

    private String domeosAddr = null;

    private DeploymentUpdaterManager updaterManager = new DeploymentUpdaterManager();

    private static Logger logger = LoggerFactory.getLogger(DeploymentServiceImpl.class);


    private void checkDeployPermit(int deployId, OperationType operationType) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, operationType);
    }


    public List<LoadBalanceDraft> getLBFromDraft(DeploymentDraft deploymentDraft) {
        return null;
    }


    @Override
    public int createDeployment(DeploymentDraft deploymentDraft) throws Exception {
        if (deploymentDraft == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_LEGAL, "deployment is null");
        }
//
//        if (loadBalanceDrafts != null && loadBalanceDrafts.size() > 0) {
//            for (LoadBalanceDraft loadBalanceDraft : loadBalanceDrafts) {
//                loadBalanceDraft.setClusterName(deploymentDraft.getClusterName());
//                errInfo = loadBalanceDraft.checkLegality();
//                if (!StringUtils.isBlank(errInfo)) {
//                    throw new DeployIlegalException(errInfo);
//                }
//                errInfo = loadBalanceDraft.checkExternalIPs();
//                if (!StringUtils.isBlank(errInfo)) {
//                    throw new DeployIlegalException(errInfo);
//                }
//                int port = loadBalanceDraft.getPort();
//                String cluster = loadBalanceDraft.getClusterName();
//                if (loadBalanceBiz.getLoadBalanceByClusterPort(port, cluster) != null) {
//                    throw new DeployIlegalException( "port " + port + " in cluster " + cluster + " has been taken.");
//                }
//            }
//        }

        if (CurrentThreadInfo.getUser() == null) {
            throw new PermitException("no user logged in");
        }
        List<LoadBalancer> lbs = deploymentDraft.toLoadBalancer();
        for (LoadBalancer loadBalancer : lbs) {
            String err = loadBalancer.checkLegality();
            if (!StringUtils.isBlank(err)) {
                throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_LEGAL, err);
            }
        }
        String errInfo = deploymentDraft.checkLegality();
        if (!StringUtils.isBlank(errInfo)) {
            throw new DeployIlegalException(errInfo);
        }
        Cluster cluster = clusterBiz.getClusterById(deploymentDraft.getClusterId());
        if (cluster == null) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_NOT_EXIST);
        }

        String deployName = deploymentDraft.getDeployName();
        List<Deployment> list = deploymentBiz.getListByName(GlobalConstant.DEPLOY_TABLE_NAME, deployName, Deployment.class);
        if (list != null && list.size() != 0) {
            for (Deployment one : list) {
                if (one.getClusterId() == deploymentDraft.getClusterId() &&
                        one.getNamespace().equals(deploymentDraft.getNamespace())) {
                    throw ApiException.wrapResultStat(ResultStat.DEPLOYMENT_EXIST);
                }
            }
        }
        Deployment deployment = deploymentDraft.toDeployment();
        deployment.setState(DeploymentStatus.STOP.name());
        try {
            deploymentBiz.createDeployment(deployment);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
        try {
            loadBalancerBiz.insertLoadBalancers(deployment.getId(), lbs);
        } catch (Exception e) {
            deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployment.getId());
            throw ApiException.wrapUnknownException(e);
        }

        Version version = deploymentDraft.toVersion();
        version.setDeployId(deployment.getId());
        version.setCreateTime(deployment.getCreateTime());
        try {
            versionBiz.insertVersionWithLogCollect(version, cluster);
        } catch (Exception e) {
            // failed
            deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployment.getId());
            throw ApiException.wrapUnknownException(e);
        }


        Resource resource = new Resource(deployment.getId(), ResourceType.DEPLOY);
        CreatorDraft creatorDraft = deploymentDraft.getCreator();
        resource.setOwnerId(creatorDraft.getCreatorId());
        resource.setOwnerType(creatorDraft.getCreatorType());
        resource.setUpdateTime(System.currentTimeMillis());
        resource.setRole(Role.MASTER);
        resourceBiz.addResource(resource);

        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                resource.getResourceId(),
                resource.getResourceType(),
                OperationType.BUILD,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));

        // TODO(sparkchen)
        logger.info("create deploy succeed, deployId={}, ownerType={}, ownerId={}",
                deployment.getId(), creatorDraft.getCreatorType(), creatorDraft.getCreatorId());

        return deployment.getId();
    }


    private List<Resource> getResourceList() {
        int userId = CurrentThreadInfo.getUserId();
        return AuthUtil.getResourceList(userId, ResourceType.DEPLOY);
    }

    private User checkOpPermit(int deployId, int clusterId) {
        User user = CurrentThreadInfo.getUser();
        if (user != null) {
            if (!AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.MODIFY)) {
                throw new PermitException("no modify privilege for clusterId " + clusterId);
            }
            if (!AuthUtil.verify(user.getId(), deployId, ResourceType.DEPLOY, OperationType.MODIFY)) {
                throw new PermitException("no modify privilege for deployment");
            }
        } else {
            throw new PermitException("");
        }
        return user;
    }


    private void checkStateAvailable(DeploymentStatus dst, Deployment deployment) {
        DeploymentStatus src = DeploymentStatus.valueOf(deployment.getState());
        Set<DeploymentStatus> availables = new HashSet<>();
        switch (src) {
            case DEPLOYING:
                availables.add(DeploymentStatus.STOPPING);
                break;
            case STOP:
                availables.add(DeploymentStatus.DEPLOYING);
                availables.add(DeploymentStatus.UPDATING);
                break;
            case DOWNSCALING:
            case UPSCALING:
            case UPDATING:
            case BACKROLLING:
                availables.add(DeploymentStatus.STOPPING);
                break;
            case ERROR:
                availables.add(DeploymentStatus.BACKROLLING);
                availables.add(DeploymentStatus.STOPPING);
                break;
            case STOPPING:
                break;
            case RUNNING:
                availables.add(DeploymentStatus.STOPPING);
                availables.add(DeploymentStatus.UPDATING);
                availables.add(DeploymentStatus.BACKROLLING);
                availables.add(DeploymentStatus.UPSCALING);
                availables.add(DeploymentStatus.DOWNSCALING);
                break;
        }
        if (!availables.contains(dst)) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_STATUS_NOT_ALLOW, "Can not change to " + dst.name() + " status from " + src.name());
        }
    }


    @Override
    public void removeDeployment(int deployId) throws IOException {

        checkDeployPermit(deployId, OperationType.DELETE);
        Deployment deployment = deploymentBiz.getById(GlobalConstant.DEPLOY_TABLE_NAME, deployId, Deployment.class);
        DeploymentStatus deploymentStatus = deploymentStatusManager.getDeploymentStatus(deployId);
        if (deploymentStatus == null || !deploymentStatus.equals(DeploymentStatus.STOP)) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_DEPLOYMENT, "deployment status is " + deployment.getState() + " now");
        }

        loadBalancerBiz.deleteLBSByDeploy(deployId);
        versionBiz.disableAllVersion(deployId);
        deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployId);

        resourceBiz.deleteResourceByIdAndType(deployId, ResourceType.DEPLOY);
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                deployId,
                ResourceType.DEPLOY,
                OperationType.DELETE,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        logger.info("delete deploy succeed, deployId={}", deployId);

    }


    @Override
    public void modifyDeployment(int deployId, DeploymentDraft deploymentDraft) throws Exception {
        checkDeployPermit(deployId, OperationType.MODIFY);
        if (deploymentDraft == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_LEGAL, "deployment is null");
        }

        String errInfo = deploymentDraft.checkLegality();
        if (!StringUtils.isBlank(errInfo)) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_LEGAL, errInfo);
        }
        Deployment oldDeploy = deploymentBiz.getDeployment(deployId);
        if (oldDeploy == null) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOYMENT_NOT_EXIST);
        }
        Deployment newDeploy = deploymentDraft.toDeployment();

        newDeploy.setId(oldDeploy.getId());
        newDeploy.setState(oldDeploy.getState());
        deploymentBiz.update(newDeploy);
        // TODO(sparkchen)
        // Acturally Operation

        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                deployId,
                ResourceType.DEPLOY,
                OperationType.MODIFY,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));

    }


    @Override
    public List<DeploymentInfo> listDeployment() throws IOException, KubeInternalErrorException, KubeResponseException {
        List<DeploymentInfo> deploymentInfos = new ArrayList<>();
        List<Resource> resources = getResourceList();
        if (resources == null || resources.size() == 0) {
            return deploymentInfos;
        }
        List<Deployment> deployments = deploymentBiz.getListByReousrce(
                GlobalConstant.DEPLOY_TABLE_NAME, resources, Deployment.class);

        for (Deployment deployment : deployments) {
            DeploymentInfo deploymentInfo = new DeploymentInfo(deployment);
            deploymentInfo.setDeploymentStatus(deploymentStatusManager.getDeploymentStatus(deployment.getId()));
            DeployResourceStatus deployResourceStatus = resourceStatus.getDeployResourceStatusById(deployment.getId());
            if (deployResourceStatus != null) {
                deploymentInfo.setCpuTotal(deployResourceStatus.getCpuTotal());
                deploymentInfo.setCpuUsed(deployResourceStatus.getCpuUsed());
                deploymentInfo.setMemoryTotal(deployResourceStatus.getMemTotal());
                deploymentInfo.setMemoryUsed(deployResourceStatus.getMemUsed());
            }
            String serviceDnsName = "";
            List<LoadBalancer> loadBalancers = loadBalancerBiz.getLBSByDeploy(deployment.getId());
            if (loadBalancers != null) {
                for (LoadBalancer lb : loadBalancers) {
                    serviceDnsName += lb.getDnsName() + " ";
                }
            }
            // set cluster name
            Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
            if (cluster == null) {
                throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST,
                        "deployment " + deployment.getName() + " requires the cluster (clusterId: " + deployment.getClusterId() + ") information");
            }
            deploymentInfo.setClusterName(cluster.getName());
            // set service DNS names
            // start TODO(openxxs) need to set real loadBalancer serviceDnsName
            if (loadBalancers != null && loadBalancers.size() > 0) {
                serviceDnsName = buildServiceDnsName(deployment);
            }
            // end TODO
            deploymentInfo.setServiceDnsName(serviceDnsName);
            deploymentInfo.setCreateTime(deployment.getCreateTime());
            deploymentInfos.add(deploymentInfo);
        }

        // sort by createTime
        Collections.sort(deploymentInfos, new Comparator<DeploymentInfo>() {
            @Override
            public int compare(DeploymentInfo o1, DeploymentInfo o2) {
                return ((Long) o2.getCreateTime()).compareTo(o1.getCreateTime());
            }
        });
        return deploymentInfos;
    }


    @Override
    public DeploymentDetail getDeployment(int deployId) throws IOException, KubeInternalErrorException, KubeResponseException {
        checkDeployPermit(deployId, OperationType.GET);

        Deployment deployment = deploymentBiz.getDeployment(deployId);

        if (deployment == null) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOYMENT_NOT_EXIST);
        }
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, "ClusterId: " + deployment.getClusterId() + " not exists");
        }

        DeploymentDetail deploymentDetail = new DeploymentDetail();
        deploymentDetail.setDeployId(deployment.getId());
        deploymentDetail.setDeployName(deployment.getName());
        deploymentDetail.setNamespace(deployment.getNamespace());
        deploymentDetail.setStateful(deployment.isStateful());
        deploymentDetail.setScalable(deployment.isScalable());
        deploymentDetail.setDefaultReplicas(deployment.getDefaultReplicas());
        deploymentDetail.setClusterName(cluster.getName());
        deploymentDetail.setClusterId(cluster.getId());
        deploymentDetail.setNetworkMode(deployment.getNetworkMode());
        deploymentDetail.setLastUpdateTime(deployment.getLastUpdateTime());
        deploymentDetail.setHealthChecker(deployment.getHealthChecker());

        // set deploymentStatus
        deploymentDetail.setDeploymentStatus(deploymentStatusManager.getDeploymentStatus(deployId));

        final List<LoadBalancer> loadBalancers = loadBalancerBiz.getLBSByDeploy(deployId);

        deploymentDetail.setExposePortNum(deployment.getExposePortNum());
        deploymentDetail.setAccessType(DeploymentAccessType.DIY);
        if (loadBalancers != null && loadBalancers.size() != 0) {
            if (loadBalancers.get(0).getType().equals(LoadBalanceType.NGINX)) {
                deploymentDetail.setAccessType(DeploymentAccessType.DIY);
            } else {
                deploymentDetail.setAccessType(DeploymentAccessType.K8S_SERVICE);
            }
            String serviceDnsName = "";
            for (LoadBalancer lb : loadBalancers) {
                serviceDnsName += lb.getDnsName() + " ";
                if (lb.getType() == LoadBalanceType.INNER_SERVICE) {
                    if (deploymentDetail.getInnerServiceDrafts() == null) {
                        deploymentDetail.setInnerServiceDrafts(new ArrayList<InnerServiceDraft>());
                    }
                    deploymentDetail.getInnerServiceDrafts().add(new InnerServiceDraft(lb));
                } else {
                    if (deploymentDetail.getLoadBalanceDrafts() == null) {
                        deploymentDetail.setLoadBalanceDrafts(new ArrayList<LoadBalanceDraft>());
                    }
                    deploymentDetail.getLoadBalanceDrafts().add(new LoadBalanceDraft(lb));
                }
            }
            // set service DNS names
            // start TODO(openxxs) need to set real loadBalancer serviceDnsName
            if (loadBalancers != null) {
                serviceDnsName = buildServiceDnsName(deployment);
            }
            // end TODO
            deploymentDetail.setServiceDnsName(serviceDnsName);
        }
        // set deployment status
        deploymentDetail.setDeploymentStatus(deploymentStatusManager.getDeploymentStatus(deployId));

        // set current replicas
        String clusterApiServer = cluster.getApi();
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
                Version version = versionBiz.getVersion(deployId, deploymentSnapshot.getVersion());
                VersionDetail versionDetail = new VersionDetail(version, deployment);
                versionDetails.add(versionDetail);
            }
            deploymentDetail.setCurrentVersions(versionDetails);
        } else {
            deploymentDetail.setCurrentVersions(null);
        }
        deploymentDetail.setHealthChecker(deployment.getHealthChecker());
        return deploymentDetail;
    }


    @Override
    public void stopDeployment(int deployId) throws KubeResponseException, IOException, KubeInternalErrorException, DeploymentEventException {

        // ** get deployment
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment in database");
        }

        // ** get cluster
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        String clusterApiServer = cluster.getApi();
        int clusterId = cluster.getId();
        checkOpPermit(deployId, clusterId);
        checkStateAvailable(DeploymentStatus.STOPPING, deployment);

        User user = CurrentThreadInfo.getUser();
        deploymentBiz.updateState(GlobalConstant.DEPLOY_TABLE_NAME, DeploymentStatus.STOPPING.name(), deployId);

        // TODO(sparkchen)
        // record event

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

            new KubeUtil(client).deleteService(buildRCLabel(deployment));
            ReplicationControllerList rcList = client.listReplicationController(buildRCLabel(deployment));
            PodList podList = client.listPod(buildRCSelector(deployment));
            if (rcList == null && podList == null) {
                return;
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
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_STOP_FAILED, e.getMessage());
        }

        return;
    }


    @Override
    public void startDeployment(int deployId, long versionId, int replicas)
            throws IOException, KubeInternalErrorException, KubeResponseException, DeploymentEventException, DaoException {

        // ** get deployment and version
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        Version version = versionBiz.getVersion(deployId, versionId);

        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        User user = checkOpPermit(deployId, cluster.getId());
        checkStateAvailable(DeploymentStatus.DEPLOYING, deployment);

        // ** get cluster
        String clusterApiServer = cluster.getApi();

        // set default replicas
        if (replicas == -1) {
            replicas = deployment.getDefaultReplicas();
        }
        if (deployment.isStateful()) {
            replicas = version.getHostList().size();
        }
        deployment.setState(DeploymentStatus.DEPLOYING.name());
        deployment.setLastUpdateTime(System.currentTimeMillis());
        deployment.setDefaultReplicas(replicas);
        deploymentBiz.update(deployment);


        // ** modify event
        try {
            deploymentStatusManager.registerStartEvent(deployId, user,
                    buildSingleDeploymentSnapshot(versionId, replicas));
        } catch (DeploymentEventException e) {
            deployment.setState(DeploymentStatus.ERROR.name());
            deploymentBiz.update(deployment);
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, e.getMessage());
        }

        KubeClient client;
        try {
            // ** get namespace
            String namespace = deployment.getNamespace();
            int deploymentId = deployment.getId();
            // ** create kubernetes client
            client = new KubeClient(clusterApiServer, namespace);
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
                        throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, message);
                    } else if (node.getMetadata() == null || node.getMetadata().getAnnotations() == null
                            || !node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR)) {
                        String message = "no disk found on node";
                        if (node.getMetadata() != null) {
                            message += node.getMetadata().getName();
                        }
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                                message);
                        throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, message);
                    } else if (node.getStatus().getAddresses() == null
                            || node.getStatus().getAddresses().length == 0) {
                        String message = "no ip found for node=" + node.getMetadata().getName();
                        deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                                message);
                        throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, message);
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
                // ** build replication controller
                List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
                //  ReplicationController rc = buildReplicationController(deployment, version, allExtraEnvs);
                ReplicationController rc = new RcBuilder(deployment, null, version, allExtraEnvs).build();
                if (rc == null || rc.getSpec() == null) {
                    String message = "build replication controller failed";
                    deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                            message);
                    throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, message);
                }
                rc.getSpec().setReplicas(replicas);
                // ** create
                client.createReplicationController(rc);
                // ** load balance
                List<LoadBalancer> loadBalancers = loadBalancerBiz.getLBSByDeploy(deploymentId);
                for (LoadBalancer loadBalancer : loadBalancers) {
                    if (loadBalancer.getType() == LoadBalanceType.EXTERNAL_SERVICE) {
                        org.domeos.client.kubernetesclient.definitions.v1.Service service =
                                buildServiceForStateless(loadBalancer, deployment);
                        if (service == null || service.getMetadata() == null
                                || service.getMetadata().getLabels() == null) {
                            String message = "build service for deployId=" + deployId + " failed";
                            deploymentStatusManager.failedEventForDeployment(deploymentId, queryCurrentSnapshot(client, deployment),
                                    message);
                            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, message);
                        }
                        new KubeUtil(client).deleteService(service.getMetadata().getLabels());
                        client.createService(service);
                    } else if (loadBalancer.getType() == LoadBalanceType.INNER_SERVICE) {
                        InnerServiceDraft innerServiceDraft = new InnerServiceDraft(loadBalancer);
                        List<InnerServiceDraft> innerServiceDraftList = new ArrayList<>();
                        innerServiceDraftList.add(innerServiceDraft);
                        org.domeos.client.kubernetesclient.definitions.v1.Service service =
                                buildInnerService(innerServiceDraftList, deployment);
                        if (service == null || service.getMetadata() == null || service.getMetadata().getLabels() == null) {
                            String message = "build internal service for deployId=" + deployId + " failed";
                            deploymentStatusManager.failedEventForDeployment(deploymentId,
                                    queryCurrentSnapshot(client, deployment), message);
                                throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, message);
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
            throw ApiException.wrapKnownException(ResultStat.DEPLOYMENT_START_FAILED, e);
        } catch (KubeResponseException e) {
            deploymentStatusManager.failedEventForDeployment(deployId,
                    null, // queryCurrentSnapshot(client, deployment),
                    e.getStatus().getMessage());
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, e.getStatus().getMessage());
        } catch (Exception e) {
            deploymentStatusManager.failedEventForDeployment(deployId,
                    null,
                    e.getMessage());
            throw ApiException.wrapUnknownException(e);
        }

    }


    @Override
    public HttpResponseTemp<?> startUpdate(int deployId, long versionId, int replicas)
            throws IOException, KubeResponseException, KubeInternalErrorException, DeploymentEventException, DaoException {

        Deployment deployment = deploymentBiz.getDeployment(deployId);
        Version version = versionBiz.getVersion(deployId, versionId);

        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        User user = checkOpPermit(deployId, cluster.getId());
        String clusterApiServer = cluster.getApi();
        checkStateAvailable(DeploymentStatus.UPDATING, deployment);

        // ** create kubeclient
        KubeClient client = new KubeClient(clusterApiServer, deployment.getNamespace());
        // ** check status
        List<DeploymentSnapshot> currentSnapshot;
        try {
            List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client,
                    buildRCLabel(deployment));
            currentSnapshot = queryCurrentSnapshot(client,
                    buildRCSelector(deployment));
            int totalReplicas = (int) getTotalReplicas(srcSnapshot);
            if (replicas != -1) {
                totalReplicas = replicas;
            }
            if (deployment.isStateful()) {
                totalReplicas = version.getHostList().size();
            }
            deployment.setDefaultReplicas(totalReplicas);
            deployment.setLastUpdateTime(System.currentTimeMillis());
            deployment.setState(DeploymentStatus.UPDATING.name());
            deploymentBiz.update(deployment);
            deploymentStatusManager.registerStartUpdateEvent(deployId, user,
                    srcSnapshot,
                    currentSnapshot,
                    buildSingleDeploymentSnapshot(versionId, totalReplicas));
        } catch (DeploymentEventException | KubeResponseException | KubeInternalErrorException e) {
            return ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(null, e.getMessage());
        }
        try {
            // ** create and start updater
            List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
            DeploymentUpdater updater = updaterManager.createUpdater(client, deployment, version, replicas, allExtraEnvs);
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
    public HttpResponseTemp<?> startRollback(int deployId, long versionId, int replicas)
            throws IOException, KubeResponseException, KubeInternalErrorException, DeploymentEventException {

        // ** get deployment and version
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        Version version = versionBiz.getVersion(deployId, versionId);

        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        User user = checkOpPermit(deployId, cluster.getId());
        String clusterApiServer = cluster.getApi();
        checkStateAvailable(DeploymentStatus.BACKROLLING, deployment);

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
            int totalReplicas = (int) getTotalReplicas(srcSnapshot);
            if (replicas != -1) {
                totalReplicas = replicas;
            }
            deployment.setLastUpdateTime(System.currentTimeMillis());
            deployment.setDefaultReplicas(totalReplicas);
            deployment.setState(DeploymentStatus.BACKROLLING.name());
            deploymentBiz.update(deployment);
            deploymentStatusManager.registerStartRollbackEvent(deployId, user,
                    srcSnapshot,
                    currentSnapshot,
                    buildSingleDeploymentSnapshot(versionId, totalReplicas));
        } catch (DeploymentEventException | KubeResponseException | KubeInternalErrorException e) {
            ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(e.getMessage());
        } catch (DaoException e) {
            e.printStackTrace();
        }

        try {
            List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
            DeploymentUpdater updater = updaterManager.createUpdater(client, deployment, version, replicas, allExtraEnvs);
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
    public HttpResponseTemp<?> scaleUpDeployment(int deployId, long versionId, int replicas)
            throws IOException, DeploymentEventException {

        Deployment deployment = deploymentBiz.getDeployment(deployId);

        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        User user = checkOpPermit(deployId, cluster.getId());
        String clusterApiServer = cluster.getApi();
        checkStateAvailable(DeploymentStatus.UPSCALING, deployment);

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
                versionId = Integer.parseInt(targetRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            } else {
                targetRC = findRC(rcList.getItems(), versionId);
                if (targetRC == null) {
                    // ** ** no rc online for versionId now, build new
                    Version version = versionBiz.getVersion(deployId, versionId);
                    List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
                    targetRC = new RcBuilder(deployment, null, version, allExtraEnvs).build();
                }
            }
            // ** register event
            List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client, deployment);
            currentSnapshot = queryCurrentSnapshot(client, deployment);
            List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(srcSnapshot, versionId, replicas);
            deployment.setDefaultReplicas(replicas);
            deployment.setLastUpdateTime(System.currentTimeMillis());
            deployment.setState(DeploymentStatus.UPSCALING.name());
            deploymentBiz.update(deployment);
            deploymentStatusManager.registerScaleUpEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
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
    public HttpResponseTemp<?> scaleDownDeployment(int deployId, long versionId, int replicas)
            throws IOException, DeploymentEventException {

        Deployment deployment = deploymentBiz.getDeployment(deployId);

        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        User user = checkOpPermit(deployId, cluster.getId());
        String clusterApiServer = cluster.getApi();
        checkStateAvailable(DeploymentStatus.DOWNSCALING, deployment);

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
                versionId = Integer.parseInt(targetRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            } else {
                targetRC = findRC(rcList.getItems(), versionId);
                if (targetRC == null) {
                    // ** ** no rc online now, build new
                    Version version = versionBiz.getVersion(deployId, versionId);
                    List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
                    targetRC = new RcBuilder(deployment, null, version, allExtraEnvs).build();
                }
            }
            // ** register event
            List<DeploymentSnapshot> srcSnapshot = queryDesiredSnapshot(client, deployment);
            currentSnapshot = queryCurrentSnapshot(client, deployment);
            List<DeploymentSnapshot> dstSnapshot = buildDeploymentSnapshotWith(srcSnapshot, versionId, replicas);
            deployment.setDefaultReplicas(replicas);
            deployment.setLastUpdateTime(System.currentTimeMillis());
            deployment.setState(DeploymentStatus.DOWNSCALING.name());
            deploymentBiz.update(deployment);

            deploymentStatusManager.registerScaleDownEvent(deployId, user, srcSnapshot, currentSnapshot, dstSnapshot);
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
    public List<DeployEvent> listDeployEvent(int deployId) throws IOException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deploy in database");
        }
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such cluster in database, clusterId = " + deployment.getClusterId());
        }
        int clusterId = cluster.getId();

        AuthUtil.verify(CurrentThreadInfo.getUserId(), clusterId, ResourceType.CLUSTER, OperationType.GET);
        if (deployId < 1) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_LEGAL, "deployId is illegal");
        }
        List<DeployEvent> events = new LinkedList<>();
        List<DeployEvent> deployEvents = deployEventBiz.getEventByDeployId(deployId);
        if (deployEvents != null) {
            events.addAll(deployEvents);
        }

        List<Event> eventList = k8SEventBiz.getEventsByDeployName(deployment.getClusterId(), deployment.getName());
        List<EventInfo> eventInfos = k8SEventBiz.translateEvent(eventList);
        List<DeployEvent> transEvents = translateK8sEvents(deployId, eventInfos);
        if (transEvents != null) {
            events.addAll(transEvents);
        }

        // sort by startTime
        if (events.size() != 0) {
            Collections.sort(events, new Comparator<DeployEvent>() {
                @Override
                public int compare(DeployEvent o1, DeployEvent o2) {
                    return ((Long) o2.getStartTime()).compareTo(o1.getStartTime());
                }
            });
        }

        return events;
    }


    private List<DeployEvent> translateK8sEvents(int deployId, List<EventInfo> eventInfos) {
        List<DeployEvent> deployEvents = new LinkedList<>();
        int i = 0;
        for (EventInfo eventInfo : eventInfos) {
            deployEvents.add(translateK8sEvent(deployId, eventInfo));
            i++;
            // at most 20 events
            if (i >= 20) {
                break;
            }
        }
        return deployEvents;
    }


    private DeployEvent translateK8sEvent(int deployId, EventInfo eventInfo) {
        DeployEvent deployEvent = new DeployEvent();
        deployEvent.setDeployId(deployId);
        deployEvent.setLastModify(eventInfo.getLastTS());
        String message = String.format("reason:%s, count:%d, message:%s", eventInfo.getReason(), eventInfo.getCount(), eventInfo.getMessage());
        deployEvent.setMessage(message);
        deployEvent.setStartTime(eventInfo.getLastTS());
        deployEvent.setOperation(DeployOperation.KUBERNETES);
        deployEvent.setUserName("system");
        return deployEvent;
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


    public static Map<String, String> buildRCLabel(Deployment deployment) {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
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
        selector.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
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
        int replicas = rc.getSpec().getReplicas();
        String rcName = RCUtils.getName(rc);
        ReplicationController tmpRC = client.replicationControllerInfo(rcName);
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


    private org.domeos.client.kubernetesclient.definitions.v1.Service buildServiceForStateless(LoadBalancer loadBalancer, Deployment deployment) {
        org.domeos.client.kubernetesclient.definitions.v1.Service service = new org.domeos.client.kubernetesclient.definitions.v1.Service();

        // * init metadata
        service.putMetadata(new ObjectMeta())
                .getMetadata()
                .putName(GlobalConstant.RC_NAME_PREFIX + deployment.getName())
                .putLabels(buildRCLabel(deployment))
                .putNamespace(deployment.getNamespace());

        // * init rc spec
        ServiceSpec spec = new ServiceSpec();
        // ** init pod template
        List<String> ips = loadBalancer.getExternalIPs();
        spec.setExternalIPs(ips.toArray(new String[ips.size()]));

        ServicePort[] servicePorts = new ServicePort[1];
        ServicePort servicePort = new ServicePort();
        servicePort.putPort(loadBalancer.getPort())
                .putTargetPort(loadBalancer.getTargetPort());
        servicePorts[0] = servicePort;
        spec.setPorts(servicePorts);

        spec.setType(GlobalConstant.NODE_PORT_STR);

        // *** create pod selector
        spec.setSelector(buildRCSelector(deployment));

        service.setSpec(spec);
        return service;
    }


    private org.domeos.client.kubernetesclient.definitions.v1.Service buildInnerService(List<InnerServiceDraft> innerServiceDrafts, Deployment deployment) {
        org.domeos.client.kubernetesclient.definitions.v1.Service service = new org.domeos.client.kubernetesclient.definitions.v1.Service();
        // init metadata
        service.putMetadata(new ObjectMeta())
                .getMetadata()
                .putName(GlobalConstant.RC_NAME_PREFIX + deployment.getName())
                .putLabels(buildRCLabel(deployment))
                .putNamespace(deployment.getNamespace());
        // init rc spec
        ServiceSpec spec = new ServiceSpec();
        ServicePort[] servicePorts = new ServicePort[innerServiceDrafts.size()];
        int i = 0;
        for (InnerServiceDraft innerServiceDraft : innerServiceDrafts) {
            ServicePort servicePort = new ServicePort();
            InnerServiceProtocol innerServiceProtocol = innerServiceDraft.getProtocol();
            if (innerServiceProtocol == null) {
                innerServiceProtocol = InnerServiceProtocol.TCP;
            }
            servicePort.putProtocol(innerServiceProtocol.toString())
                    .putPort(innerServiceDraft.getPort())
                    .putTargetPort(innerServiceDraft.getTargetPort());
            servicePorts[i] = servicePort;
            i++;
        }
        spec.setPorts(servicePorts);
        spec.setType(GlobalConstant.CLUSTER_IP_STR);
        spec.setSelector(buildRCSelector(deployment));
        service.setSpec(spec);
        return service;
    }


    private static org.domeos.client.kubernetesclient.definitions.v1.Service buildStatefulService(List<LoadBalanceDraft> loadBalanceDraft,
                                                                                                  Deployment deployment, int index) {
        if (deployment == null || loadBalanceDraft == null || loadBalanceDraft.size() == 0) {
            return null;
        }
        org.domeos.client.kubernetesclient.definitions.v1.Service service = new org.domeos.client.kubernetesclient.definitions.v1.Service();
        Map<String, String> labels = buildRCLabel(deployment);
        addIndex(labels, index);

        // * init metadata
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
//
//    public static void modifyExternalIPs(List<LoadBalanceDraft> drafts, String ip) {
//        if (drafts == null || ip == null) {
//            return;
//        }
//        for (LoadBalanceDraft draft : drafts) {
//            LinkedList<String> externalIPs = new LinkedList<>();
//            draft.setExternalIPs(externalIPs);
//            externalIPs.add(ip);
//        }
//    }


    public static String buildStatefulServiceName(Deployment deployment, int index) {
        return buildStatefulServiceName(deployment) + "-" + index;
    }


    public static String buildStatefulServiceName(Deployment deployment) {
//        if (deployment.getDeployName().length() > 12) {
//            return deployment.getDeployName().substring(0, 12) + "-" + deployment.getDeployId();
//        }
//        return deployment.getDeployName();
        return null;
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


    private String buildServiceDnsName(Deployment deployment) {
        String serviceDnsName = null;
        if (deployment != null) {
            Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
            String dnsSuffix = "." + deployment.getNamespace() + ".svc." + cluster.getDomain();
            String deployName = deployment.getName();
            if (deployment.isStateful()) {
                // TODO services DNS name in statefull deployment
            } else {
                serviceDnsName = GlobalConstant.RC_NAME_PREFIX + deployName + dnsSuffix;
            }
        }
        return serviceDnsName;
    }


    public List<EnvDraft> buildExtraEnv(Cluster cluster) {
        List<EnvDraft> extraEnvs = new LinkedList<>();
        if (domeosAddr == null) {
            GlobalInfo info = globalMapper.getGlobalInfoByType(GlobalType.SERVER);
            domeosAddr = info.getValue();
        }
        extraEnvs.add(new EnvDraft("DOMEOS_SERVER_ADDR", domeosAddr));
        extraEnvs.add(new EnvDraft("CLUSTER_NAME", cluster.getName()));
        return extraEnvs;
    }
}
