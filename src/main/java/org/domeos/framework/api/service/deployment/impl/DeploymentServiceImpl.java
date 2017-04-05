package org.domeos.framework.api.service.deployment.impl;

import io.fabric8.kubernetes.api.model.Event;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.DeploymentTerminatedException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.deployment.*;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerBiz;
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
import org.domeos.framework.api.model.cluster.related.NodeInfo;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.deployment.*;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.deployment.DeploymentService;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.api.service.event.EventService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.RuntimeDriver;
import org.domeos.framework.engine.coderepo.ReflectFactory;
import org.domeos.framework.engine.event.AutoDeploy.AutoUpdateInfo;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.exception.DriverException;
import org.domeos.framework.engine.k8s.NodeWrapper;
import org.domeos.framework.engine.k8s.handler.DeployResourceHandler;
import org.domeos.framework.engine.k8s.updater.EventChecker;
import org.domeos.framework.engine.runtime.IResourceStatus;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;

/**
 */
@Service
public class DeploymentServiceImpl implements DeploymentService {

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    CollectionBiz collectionBiz;

    @Autowired
    VersionBiz versionBiz;

    @Autowired
    LoadBalancerBiz loadBalancerBiz;

    @Autowired
    DeploymentStatusManager deploymentStatusManager;

    @Autowired
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

    @Autowired
    DeployCollectionBiz deployCollectionBiz;

    private static Logger logger = LoggerFactory.getLogger(DeploymentServiceImpl.class);

    private void checkDeployPermit(int deployId, OperationType operationType) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, operationType);
    }

    private void checkCreateDeployPermit(int collectionId, int clusterId) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, clusterId, ResourceType.CLUSTER, OperationType.MODIFY);
        AuthUtil.collectionVerify(userId, collectionId, ResourceType.DEPLOY_COLLECTION, OperationType.MODIFY, -1);

    }

    private void checkMigrateDeployPermit(int deployId, int collectionId) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.SET);
        AuthUtil.collectionVerify(userId, collectionId, ResourceType.DEPLOY_COLLECTION, OperationType.SET, -1);
    }

    @Override
    public int createDeployment(DeploymentDraft deploymentDraft) throws Exception {
        if (deploymentDraft == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_LEGAL, "deployment is null");
        }

        if (CurrentThreadInfo.getUser() == null) {
            throw new PermitException("no user logged in");
        }
        deploymentDraft.setCreatorId(CurrentThreadInfo.getUserId());
        checkCreateDeployPermit(deploymentDraft.getCollectionId(), deploymentDraft.getClusterId());
        DeployCollection deployCollection = deployCollectionBiz.getDeployCollection(deploymentDraft.getCollectionId());
        if (deployCollection == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOY_COLLECTION_NOT_EXIST,
                    "deploy collection " + deploymentDraft.getCollectionId() + " not exist");
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
            versionBiz.removeById(GlobalConstant.VERSION_TABLE_NAME, version.getId());
            throw e;
        }

        CollectionResourceMap resourceMap = new CollectionResourceMap(deployment.getId(),
                deploymentDraft.getCreatorId(),
                ResourceType.DEPLOY,
                deploymentDraft.getCollectionId(),
                System.currentTimeMillis());
        collectionBiz.addResource(resourceMap);
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                resourceMap.getResourceId(),
                resourceMap.getResourceType(),
                OperationType.SET,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));

        // TODO(sparkchen)
        logger.info("create deploy succeed, deployId={}, creatorId={}, collectionId={}",
                deployment.getId(), deploymentDraft.getCreatorId(), deploymentDraft.getCollectionId());

        return deployment.getId();
    }

    private List<CollectionAuthorityMap> getCollectionList() {
        int userId = CurrentThreadInfo.getUserId();
        return AuthUtil.getCollectionList(userId, ResourceType.DEPLOY_COLLECTION);
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

        collectionBiz.deleteResourceByResourceIdAndResourceType(deployId, ResourceType.DEPLOY);
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
        //for now, we just allow to update the description of the deployment
        oldDeploy.setDescription(newDeploy.getDescription());
        deploymentBiz.update(oldDeploy);
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
        List<CollectionAuthorityMap> authorityMaps = getCollectionList();
        Map<Integer, Boolean> deletableMap = new HashMap<>();
        int userId = CurrentThreadInfo.getUserId();
        boolean isAdmin = AuthUtil.isAdmin(userId);
        for (CollectionAuthorityMap authorityMap : authorityMaps) {
            if (isAdmin || authorityMap.getRole() == Role.MASTER) {
                deletableMap.put(authorityMap.getCollectionId(), true);
            } else {
                deletableMap.put(authorityMap.getCollectionId(), false);
            }
        }

        List<CollectionResourceMap> resources = collectionBiz.getResourcesByAuthorityMaps(ResourceType.DEPLOY, authorityMaps);
        return listDeployment(resources, deletableMap);
    }

    @Override
    public List<DeploymentInfo> listDeployment(int collectionId) throws IOException {

        int userId = CurrentThreadInfo.getUserId();
        boolean deletable;
        try {
            AuthUtil.collectionVerify(userId, collectionId, ResourceType.DEPLOY_COLLECTION, OperationType.DELETE, -1);
            deletable = true;
        } catch (Exception ignore) {
            deletable = false;
        }
        Map<Integer, Boolean> deletableMap = new HashMap<>();
        deletableMap.put(collectionId, deletable);

        List<CollectionResourceMap> resources = collectionBiz.getResourcesByCollectionIdAndResourceType(collectionId, ResourceType.DEPLOY);
        return listDeployment(resources, deletableMap);

    }

    private List<DeploymentInfo> listDeployment(List<CollectionResourceMap> resources, Map<Integer, Boolean> deletableMap) throws IOException {
        List<DeploymentInfo> deploymentInfos = new ArrayList<>();
        if (resources == null || resources.size() == 0) {
            return deploymentInfos;
        }
        int userId = AuthUtil.getUserId();
        List<GetDeploymentInfoTask> deploymentInfoTasks = new LinkedList<>();
        for (CollectionResourceMap resourceMap : resources) {
            deploymentInfoTasks.add(new GetDeploymentInfoTask(resourceMap, deletableMap, userId));
        }
        deploymentInfos = ClientConfigure.executeCompletionService(deploymentInfoTasks);
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
        CollectionResourceMap collectionResourceMap;
        Map<Integer, Boolean> deletableMap;
        int userId;

        private GetDeploymentInfoTask(CollectionResourceMap collectionResourceMap, Map<Integer, Boolean> deletableMap, int userId) {
            this.collectionResourceMap = collectionResourceMap;
            this.deletableMap = deletableMap;
            this.userId = userId;
        }

        @Override
        public DeploymentInfo call() throws Exception {
            Deployment deployment = deploymentBiz.getDeployment(collectionResourceMap.getResourceId());
            DeploymentInfo deploymentInfo = new DeploymentInfo(deployment);
            deploymentInfo.setDeploymentStatus(deploymentStatusBiz.getDeploymentStatus(deployment.getId()));
            DeployResourceStatus deployResourceStatus = resourceStatus.getDeployResourceStatusById(deployment.getId());
            boolean deletable = deletableMap.get(collectionResourceMap.getCollectionId()) || userId == collectionResourceMap.getCreatorId();
            deploymentInfo.setDeletable(deletable);
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
            deploymentInfo.setDeployTypeShow(deployment.getDeploymentType().getShowName());
            return deploymentInfo;
        }
    }

    @Override
    public DeploymentDetail getDeployment(int deployId) throws DeploymentEventException, DeploymentTerminatedException {
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
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, " There is no RuntimeDriver for cluster(" + cluster.toString() + ").");
        }
        currentReplicas = driver.getTotalReplicasByDeployment(deployment);
        deploymentDetail.setCurrentReplicas(currentReplicas);

        // get current versions
        List<Version> versions = driver.getCurrnetVersionsByDeployment(deployment);
        if (versions == null || versions.isEmpty()) {
            deploymentDetail.setCurrentVersions(null);
        } else {
            List<VersionDetail> versionDetails = new ArrayList<>(versions.size());
            for (Version version : versions) {
                VersionDetail versionDetail = new VersionDetail(version, deployment);
                DeployResourceHandler deployResourceHandler = ReflectFactory.createDeployResourceHandler(
                        deployment.getDeploymentType().getDeployClassName(), null, deployment);
                VersionString versionString = null;
                if (deployResourceHandler != null) {
                    versionString = deployResourceHandler.getVersionString(version, loadBalancers, buildExtraEnv(cluster));
                }
                if (versionString != null) {
                    versionString.setPodSpecStr(version.getPodSpecStr());
                }
                versionDetail.setVersionString(versionString);
                versionDetails.add(versionDetail);
            }
            deploymentDetail.setCurrentVersions(versionDetails);
        }
        deploymentDetail.setHealthChecker(deployment.getHealthChecker());
        if (deployment.getDeploymentType() == null) {
            deploymentDetail.setDeploymentType(DeploymentType.REPLICATIONCONTROLLER);
        } else {
            deploymentDetail.setDeploymentType(deployment.getDeploymentType());
        }

        boolean deletable;
        try {
            AuthUtil.verify(CurrentThreadInfo.getUserId(), deployId, ResourceType.DEPLOY, OperationType.DELETE);
            deletable = true;
        } catch (Exception ignore) {
            deletable = false;
        }
        deploymentDetail.setDeployTypeShow(deployment.getDeploymentType().getShowName());
        deploymentDetail.setDeletable(deletable);
        deploymentDetail.setDescription(deployment.getDescription());

        return deploymentDetail;
    }

    @Override
    public void migrateDeployment(int deployId, int collectionId) throws IOException, DeploymentEventException {
        checkMigrateDeployPermit(deployId, collectionId);
        CollectionResourceMap oldDeployResource = collectionBiz.getResourceByResourceIdAndResourceType(deployId, ResourceType.DEPLOY);
        if (oldDeployResource == null) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOY_COLLECTION_NOT_EXIST);
        }
        if (oldDeployResource.getCollectionId() == collectionId) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOY_IN_DEPLOY_COLLECTION);
        }
        oldDeployResource.setCollectionId(collectionId);
        oldDeployResource.setUpdateTime(System.currentTimeMillis());
        collectionBiz.modifyCollectionResourceMap(oldDeployResource);
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
    public void stopDeployment(int deployId)
            throws IOException, DeploymentEventException, DeploymentTerminatedException {
        checkDeployPermit(deployId, OperationType.MODIFY);
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }

        if (deployment.getDeploymentType() != DeploymentType.DAEMONSET) {
            deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.STOPPING);
        } else {
            DeployEvent deployEvent = deployEventBiz.getNewestEventByDeployId(deployId);
            if (!deployEvent.eventTerminated() && deployEvent.getOperation() != DeployOperation.STOP) {
                deploymentStatusManager.failedEventForDeployment(deployId, null, "Fail the current event");
            } else if (deployEvent.getOperation() == DeployOperation.STOP) {
                throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_STOP_FAILED, "You are already in stop status");
            }
        }

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
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException {
        checkDeployPermit(deployId, OperationType.MODIFY);
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
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.DEPLOYING);
        if (deployment.getDeploymentType() == DeploymentType.DAEMONSET) {
            try {
                deployment.setDefaultReplicas(getNodeCounts(deployment, version.getLabelSelectors()));
            } catch (Exception e) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "error with node label selectors: " + version.getLabelSelectors());
            }
        }
        if (deployment.isStateful()) {
            replicas = version.getHostList().size();
        }
        if (deployment.getDeploymentType() == DeploymentType.DAEMONSET) {
            replicas = getNodeCounts(deployment, version.getLabelSelectors());
        }
        deployment.setState(DeploymentStatus.DEPLOYING.name());
        deployment.setLastUpdateTime(System.currentTimeMillis());
        if (replicas > 0) {
            deployment.setDefaultReplicas(replicas);
        }

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
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException {
        AutoUpdateInfo autoUpdateInfo = new AutoUpdateInfo();
        autoUpdateInfo.setDeployId(deployId);
        autoUpdateInfo.setVersionId(versionId);
        autoUpdateInfo.setReplicas(replicas);
        autoUpdateInfo.setPolicy(policy);

        startUpdate(autoUpdateInfo, true);

        return ResultStat.OK.wrap(null);
    }

    public void startUpdate(AutoUpdateInfo autoUpdateInfo, boolean check)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException {
        // ** get deployment and version
        int deployId = autoUpdateInfo.getDeployId();
        int versionId = autoUpdateInfo.getVersionId();
        int replicas = autoUpdateInfo.getReplicas();
        Policy policy = autoUpdateInfo.getPolicy();
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }
        User user;
        if (check) {
            checkDeployPermit(deployId, OperationType.MODIFY);
            user = CurrentThreadInfo.getUser();
        } else {
            user = new User();
            user.setId(-1);
            user.setUsername("DomeOS");
        }

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
        if (deployment.getDeploymentType() == DeploymentType.DAEMONSET) {
            try {
                deployment.setDefaultReplicas(getNodeCounts(deployment, version.getLabelSelectors()));
            } catch (Exception e) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "error with node label selectors: " + version.getLabelSelectors());
            }
        }
        try {
            List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
            if (replicas > 0) {
                deployment.setDefaultReplicas(replicas);
            }
            driver.startUpdate(deployment, versionId, allExtraEnvs, user, policy);
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_UPDATE_FAILED, e.getMessage());
        }

        deployment.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(DeploymentStatus.UPDATING.name());
        deploymentBiz.update(deployment);
    }

    @Override
    public void updateJobResult(UpdateJobResult updateJobResult) {
        if (updateJobResult == null) {
            return;
        }
        try {
            DeployEvent deployEvent = deployEventBiz.getEvent(Long.valueOf(updateJobResult.getEventId()));
            Deployment deployment = deploymentBiz.getDeployment(Integer.valueOf(updateJobResult.getDeployId()));
            if (deployEvent == null || deployment == null) {
                return;
            }
            if (updateJobResult.getResultCode() > 200) {
                deploymentStatusManager.failedEvent(Long.valueOf(updateJobResult.getEventId()), deployEvent.getCurrentSnapshot(),
                        updateJobResult.getResultMsg());
            }
            EventChecker eventChecker = new EventChecker(deployment, deployEvent);
            eventChecker.checkEvent();
        } catch (IOException | DeploymentEventException | DeploymentTerminatedException | DataBaseContentException e) {
            logger.warn("meet error in update job " + updateJobResult.getJobName() + ", deployId=" + updateJobResult.getDeployId()
                    + ", eventId=" + updateJobResult.getEventId());
        }
    }

    @Override
    public HttpResponseTemp<?> startRollback(int deployId, int versionId, int replicas, Policy policy)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException {
        checkDeployPermit(deployId, OperationType.MODIFY);
        // ** get deployment and version
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

        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.BACKROLLING);

        // check status
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        if (deployment.getDeploymentType() == DeploymentType.DAEMONSET) {
            try {
                deployment.setDefaultReplicas(getNodeCounts(deployment, version.getLabelSelectors()));
            } catch (Exception e) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "error with node label selectors: " + version.getLabelSelectors());
            }
        }
        try {
            List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
            if (replicas > 0) {
                deployment.setDefaultReplicas(replicas);
            }
            driver.rollbackDeploy(deployment, versionId, allExtraEnvs, CurrentThreadInfo.getUser(), policy);
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            ResultStat.DEPLOYMENT_UPDATE_FAILED.wrap(e.getMessage());
        }

        deployment.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(DeploymentStatus.BACKROLLING.name());
        deploymentBiz.update(deployment);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> scaleUpDeployment(int deployId, int versionId, int replicas)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException {
        checkDeployPermit(deployId, OperationType.MODIFY);
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.UPSCALING);
        if (deployment.getDeploymentType() == DeploymentType.DAEMONSET) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "Daemon Set can not scale up");
        }
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
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException {

        checkDeployPermit(deployId, OperationType.MODIFY);
        Deployment deployment = deploymentBiz.getDeployment(deployId);

        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.DOWNSCALING);

        if (deployment.getDeploymentType() == DeploymentType.DAEMONSET) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "Daemon Set can not scale up");
        }
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
    public HttpResponseTemp<?> scaleDaemonSet(int deployId, int versionId, List<LabelSelector> labelSelectors)
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException {
        checkDeployPermit(deployId, OperationType.MODIFY);
        Deployment deployment = deploymentBiz.getDeployment(deployId);

        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }

        Version version = versionBiz.getVersion(deployId, versionId);

        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version: " + versionId + "in deployment:" + deployId);
        }
        DeploymentStatus deploymentStatus;
        int checkresult = compareLabelSelectors(deployment, version.getLabelSelectors(), labelSelectors);
        if (checkresult < 0) {
            deploymentStatus = DeploymentStatus.UPSCALING;
        } else if (checkresult > 0) {
            deploymentStatus = DeploymentStatus.DOWNSCALING;
        } else {
            return ResultStat.OK.wrap(null);
        }
        int replicas = getNodeCounts(deployment, labelSelectors);

        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), deploymentStatus);

        if (deployment.getDeploymentType() != DeploymentType.DAEMONSET) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "deployment can not scale use labelselectors");
        }
        deployment.setDefaultReplicas(replicas);
        deployment.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(deploymentStatus.name());
        deploymentBiz.update(deployment);


        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        List<EnvDraft> allExtraEnvs = buildExtraEnv(cluster);
        version.setLabelSelectors(labelSelectors);
        versionBiz.updateLabelSelector(version);
        if (deploymentStatus == DeploymentStatus.DOWNSCALING) {
            driver.scaleDownDeployment(deployment, versionId, replicas, allExtraEnvs, CurrentThreadInfo.getUser());
        } else {
            driver.scaleUpDeployment(deployment, versionId, replicas, allExtraEnvs, CurrentThreadInfo.getUser());
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
            throws IOException, DeploymentEventException, DaoException, DeploymentTerminatedException {
        checkDeployPermit(deployId, OperationType.MODIFY);
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such deployment:" + deployId);
        }
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such clusterId: " + deployment.getClusterId());
        }
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
        GlobalInfo info = globalMapper.getGlobalInfoByType(GlobalType.SERVER);
        if (info == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "domeos server is null!");
        }
        extraEnvs.add(new EnvDraft("DOMEOS_SERVER_ADDR", CommonUtil.fullUrl(info.getValue())));
        extraEnvs.add(new EnvDraft("CLUSTER_NAME", cluster.getName()));
        return extraEnvs;
    }

    public VersionString getRCStr(DeploymentDraft deploymentDraft) {
        DeployResourceHandler deployResourceHandler = ReflectFactory.createDeployResourceHandler(
                deploymentDraft.getDeploymentType().getDeployClassName(), null, null);
        if (deployResourceHandler != null) {
            return deployResourceHandler.getVersionString(deploymentDraft);
        } else {
            return null;
        }
    }

    private int getNodeCounts(Deployment deployment, List<LabelSelector> labelSelectors) throws DeploymentEventException {
        if (labelSelectors != null) {
            Map<String, String> labels = new HashMap<>();
            for (LabelSelector labelSelector : labelSelectors) {
                labels.put(labelSelector.getName(), labelSelector.getContent());
            }
            NodeWrapper nodeWrapper;
            try {
                nodeWrapper = new NodeWrapper().init(deployment.getClusterId(), deployment.getNamespace());
            } catch (K8sDriverException e) {
                throw new DeploymentEventException(e);
            }
            List<NodeInfo> nodeInfos = nodeWrapper.getNodeListByLabel(labels);
            if (nodeInfos != null && nodeInfos.size() != 0) {
                return nodeInfos.size();
            } else {
                throw new DeploymentEventException("node selectors select no node");
            }
        }
        return 0;
    }

    private int compareLabelSelectors(Deployment deployment, List<LabelSelector> labelSelectors1, List<LabelSelector> labelSelectors2)
            throws DeploymentEventException {
        Map<String, String> labels1 = new HashMap<>();
        if (labelSelectors1 != null) {
            for (LabelSelector labelSelector : labelSelectors1) {
                labels1.put(labelSelector.getName(), labelSelector.getContent());
            }
        }
        Map<String, String> labels2 = new HashMap<>();
        if (labelSelectors2 != null) {
            for (LabelSelector labelSelector : labelSelectors2) {
                labels2.put(labelSelector.getName(), labelSelector.getContent());
            }
        }
        NodeWrapper nodeWrapper;
        try {
            nodeWrapper = new NodeWrapper().init(deployment.getClusterId(), deployment.getNamespace());
        } catch (K8sDriverException e) {
            throw new DeploymentEventException(e);
        }
        List<NodeInfo> nodeInfos1 = nodeWrapper.getNodeListByLabel(labels1);
        List<NodeInfo> nodeInfos2 = nodeWrapper.getNodeListByLabel(labels2);
        if (nodeInfos1.size() > nodeInfos2.size()) {
            return 1;
        } else if (nodeInfos1.size() < nodeInfos2.size()) {
            return -1;
        } else if (nodeInfos1.equals(nodeInfos2)) {
            return 0;
        } else {
            return 1;
        }
    }

}
