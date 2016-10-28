package org.domeos.framework.api.service.deployment.impl;

import io.fabric8.kubernetes.api.KubernetesHelper;
import io.fabric8.kubernetes.api.model.Event;
import io.fabric8.kubernetes.api.model.ReplicationController;
import io.fabric8.kubernetes.api.model.ReplicationControllerBuilder;
import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
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
import org.domeos.framework.api.model.deployment.Policy;
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
import org.domeos.framework.api.service.event.EventService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.RuntimeDriver;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.exception.DriverException;
import org.domeos.framework.engine.k8s.K8sDriver;
import org.domeos.framework.engine.k8s.RcBuilder;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.runtime.IResourceStatus;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

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
    EventService eventService;

    @Autowired
    OperationHistory operationHistory;

    @Autowired
    DeploymentStatusBiz deploymentStatusBiz;

    private String domeosAddr = null;

    private static Logger logger = LoggerFactory.getLogger(DeploymentServiceImpl.class);

    private void checkDeployPermit(int deployId, OperationType operationType) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, operationType);
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
        deploymentBiz.createDeployment(deployment);

        try {
            loadBalancerBiz.insertLoadBalancers(deployment.getId(), lbs);
        } catch (DaoException e) {
            deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployment.getId());
            throw ApiException.wrapUnknownException(e);
        } catch (ApiException e) {
            deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployment.getId());
            throw e;
        }
        Version version = deploymentDraft.toVersion();
        version.setDeployId(deployment.getId());
        version.setCreateTime(deployment.getCreateTime());
        try {
            versionBiz.insertVersionWithLogCollect(version, cluster);
        } catch (ApiException e) {
            // failed
            deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployment.getId());
            throw e;
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

    @Override
    public void removeDeployment(int deployId) throws IOException {
        checkDeployPermit(deployId, OperationType.DELETE);
        Deployment deployment = deploymentBiz.getById(GlobalConstant.DEPLOY_TABLE_NAME, deployId, Deployment.class);
        DeploymentStatus deploymentStatus = deploymentStatusBiz.getDeploymentStatus(deployId);
        if (deploymentStatus == null || !deploymentStatus.equals(DeploymentStatus.STOP)) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_DEPLOYMENT, "deployment status is " + deployment.getState() + " now");
        }

        loadBalancerBiz.deleteLBSByDeploy(deployId);
        versionBiz.disableAllVersion(deployId);
        deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployId);
        eventService.deleteDeploymentEvent(deployment.getClusterId(), deployment);

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
    public List<DeploymentInfo> listDeployment() throws IOException {
        List<DeploymentInfo> deploymentInfos = new ArrayList<>();
        List<Resource> resources = getResourceList();
        if (resources == null || resources.size() == 0) {
            return deploymentInfos;
        }
        List<Deployment> deployments = deploymentBiz.getListByReousrce(
                GlobalConstant.DEPLOY_TABLE_NAME, resources, Deployment.class);

        List<Future<DeploymentInfo>> futures = new LinkedList<>();
        for (Deployment deployment : deployments) {
            Future<DeploymentInfo> future = ClientConfigure.executorService.submit(new GetDeploymentInfoTask(deployment));
            futures.add(future);
        }
        for (Future<DeploymentInfo> future : futures) {
            try {
                DeploymentInfo info = future.get();
                if (info != null) {
                    deploymentInfos.add(info);
                }
            } catch (InterruptedException | ExecutionException e) {
                logger.warn("get deployment info error, message is " + e.getMessage());
            }
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


    private class GetDeploymentInfoTask implements Callable<DeploymentInfo> {
        Deployment deployment;

        public GetDeploymentInfoTask(Deployment deployment) {
            this.deployment = deployment;
        }

        @Override
        public DeploymentInfo call() throws Exception {
            DeploymentInfo deploymentInfo = new DeploymentInfo(deployment);
            deploymentInfo.setDeploymentStatus(deploymentStatusBiz.getDeploymentStatus(deployment.getId()));
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
            VersionType versionType = deployment.getVersionType() == null ? VersionType.CUSTOM : deployment.getVersionType();
            deploymentInfo.setVersionType(versionType);
            // end TODO
            deploymentInfo.setServiceDnsName(serviceDnsName);
            deploymentInfo.setCreateTime(deployment.getCreateTime());
            return deploymentInfo;
        }
    }

    @Override
    public DeploymentDetail getDeployment(int deployId) throws IOException, DeploymentEventException {
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
        VersionType versionType = deployment.getVersionType() == null ? VersionType.CUSTOM : deployment.getVersionType();
        deploymentDetail.setVersionType(versionType);

        // set deploymentStatus
        deploymentDetail.setDeploymentStatus(deploymentStatusBiz.getDeploymentStatus(deployId));

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
        deploymentDetail.setDeploymentStatus(deploymentStatusBiz.getDeploymentStatus(deployId));

        // set current replicas
        long currentReplicas;
        KubeUtils client = null;
        try {
            client = Fabric8KubeUtils.buildKubeUtils(cluster, deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, " There is no RuntimeDriver for cluster(" + cluster.toString() + ").");
        }
        List<DeploymentSnapshot> deploymentSnapshots = ((K8sDriver) driver).queryCurrentSnapshot(client, deployment);
        currentReplicas = getTotalReplicas(deploymentSnapshots);
        deploymentDetail.setCurrentReplicas(currentReplicas);

        // get current versions
        if (deploymentSnapshots != null) {
            List<VersionDetail> versionDetails = new ArrayList<>(deploymentSnapshots.size());
            for (DeploymentSnapshot deploymentSnapshot : deploymentSnapshots) {
                Version version = versionBiz.getVersion(deployId, (int) deploymentSnapshot.getVersion());
                VersionDetail versionDetail = new VersionDetail(version, deployment);
                ReplicationController replicationController =
                        new RcBuilder(deployment, loadBalancers, version,  null, new Long(currentReplicas).intValue()).build();
                VersionString versionString = VersionString.getRCStr(replicationController, version.getVersionType());
                if (versionString != null) {
                    versionString.setPodSpecStr(version.getPodSpecStr());
                }
                versionDetail.setVersionString(versionString);
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
    public void stopDeployment(int deployId)
            throws IOException, DeploymentEventException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }

        checkOpPermit(deployId, deployment.getClusterId());
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.STOPPING);

        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }

        try {
            deploymentBiz.updateState(GlobalConstant.DEPLOY_TABLE_NAME, DeploymentStatus.STOPPING.name(), deployId);
            driver.stopDeploy(deployment, CurrentThreadInfo.getUser());
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_STOP_FAILED, e.getMessage());
        }
    }

    @Override
    public void startDeployment(int deployId, int versionId, int replicas)
            throws IOException, DeploymentEventException, DaoException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }

        checkOpPermit(deployId, cluster.getId());
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.DEPLOYING);

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

        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }

        try {
            List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
            List<LoadBalancer> loadBalancers = loadBalancerBiz.getLBSByDeploy(deployId);
            driver.startDeploy(deployment, version, CurrentThreadInfo.getUser(), loadBalancers, allExtraEnvs);
        } catch (DriverException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_START_FAILED, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> startUpdate(int deployId, int versionId, int replicas, Policy policy)
            throws IOException, DeploymentEventException, DaoException {

        // ** get deployment and version
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }
        checkOpPermit(deployId, deployment.getClusterId());

        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.UPDATING);

        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        try {
            List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
            driver.startUpdate(deployment, versionId, replicas, allExtraEnvs, CurrentThreadInfo.getUser(), policy);
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            return ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(null, e.getMessage());
        }

        deployment.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(DeploymentStatus.UPDATING.name());
        deploymentBiz.update(deployment);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> startRollback(int deployId, int versionId, int replicas, Policy policy)
            throws IOException, DeploymentEventException, DaoException {

        // ** get deployment and version
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }
        checkOpPermit(deployId, deployment.getClusterId());

        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }

        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.BACKROLLING);

        // check status
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        try {
            List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
            driver.rollbackDeploy(deployment, versionId, replicas, allExtraEnvs, CurrentThreadInfo.getUser(), policy);
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(e.getMessage());
        }

        deployment.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(DeploymentStatus.BACKROLLING.name());
        deploymentBiz.update(deployment);

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
    public HttpResponseTemp<?> scaleUpDeployment(int deployId, int versionId, int replicas)
            throws IOException, DeploymentEventException, DaoException {

        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }

        checkOpPermit(deployId, cluster.getId());
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.UPSCALING);

        deployment.setDefaultReplicas(replicas);
        deployment.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(DeploymentStatus.UPSCALING.name());
        deploymentBiz.update(deployment);

        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
        driver.scaleUpDeployment(deployment, versionId, replicas, allExtraEnvs, CurrentThreadInfo.getUser());

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> scaleDownDeployment(int deployId, int versionId, int replicas)
            throws IOException, DeploymentEventException, DaoException {

        Deployment deployment = deploymentBiz.getDeployment(deployId);

        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }

        checkOpPermit(deployId, cluster.getId());
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.DOWNSCALING);

        deployment.setDefaultReplicas(replicas);
        deployment.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(DeploymentStatus.DOWNSCALING.name());
        deploymentBiz.update(deployment);


        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
        driver.scaleDownDeployment(deployment, versionId, replicas, allExtraEnvs, CurrentThreadInfo.getUser());

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

        List<Event> eventList = k8SEventBiz.getEventsByDeployId(deployment.getClusterId(), deployment.getId());
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

    @Override
    public HttpResponseTemp<?> abortDeployOperation(int deployId)
            throws IOException, DeploymentEventException, DaoException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        checkOpPermit(deployId, cluster.getId());
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, " There is no RuntimeDriver for cluster(" + cluster.toString() + ").");
        }
        driver.abortDeployOperation(deployment, CurrentThreadInfo.getUser());

        return ResultStat.OK.wrap(null);
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

    private List<EnvDraft> buildExtraEnv(Cluster cluster) {
        List<EnvDraft> extraEnvs = new LinkedList<>();
        if (domeosAddr == null) {
            GlobalInfo info = globalMapper.getGlobalInfoByType(GlobalType.SERVER);
            domeosAddr = info.getValue();
        }
        extraEnvs.add(new EnvDraft("DOMEOS_SERVER_ADDR", domeosAddr));
        extraEnvs.add(new EnvDraft("CLUSTER_NAME", cluster.getName()));
        return extraEnvs;
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

    public VersionString getRCStr(DeploymentDraft deploymentDraft) {
        String rcName = GlobalConstant.RC_NAME_PREFIX + deploymentDraft.getDeployName();
        Map<String, String> annotations = new HashMap<>();
        annotations.put("deployName", deploymentDraft.getDeployName());
        ReplicationController replicationController = new ReplicationControllerBuilder()
                .withNewMetadata()
                .withName(rcName.toLowerCase())
                .withNamespace(deploymentDraft.getNamespace())
                .endMetadata()
                .withNewSpec()
                .withNewTemplate()
                .withNewMetadata()
                .withAnnotations(annotations)
                .withDeletionGracePeriodSeconds(0L)
                .endMetadata()
                .withNewSpec()
                .endSpec()
                .endTemplate()
                .withReplicas(deploymentDraft.getReplicas())
                .endSpec()
                .build();
        return VersionString.getRCStr(replicationController, deploymentDraft.getVersionType());

    }


}
