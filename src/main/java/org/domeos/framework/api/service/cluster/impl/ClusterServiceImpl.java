package org.domeos.framework.api.service.cluster.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.consolemodel.cluster.*;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.ClusterWatcherConf;
import org.domeos.framework.api.model.cluster.related.ClusterWatcherDeployMap;
import org.domeos.framework.api.model.cluster.related.NamespaceInfo;
import org.domeos.framework.api.model.cluster.related.NodeInfo;
import org.domeos.framework.api.model.cluster.related.NodeLabel;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.cluster.ClusterService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.RuntimeDriver;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.k8s.NodeWrapper;
import org.domeos.framework.engine.k8s.updater.EventChecker;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;


/**
 * Created by feiliu206363 on 2015/12/15.
 */
@Service
public class ClusterServiceImpl implements ClusterService {

    private static Logger logger = LoggerFactory.getLogger(ClusterServiceImpl.class);

    @Autowired
    CollectionBiz collectionBiz;

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    VersionBiz versionBiz;

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    AuthBiz authBiz;

    @Autowired
    OperationHistory operationHistory;

    @Autowired
    CustomObjectMapper mapper;

    @Autowired
    DeployEventBiz deployEventBiz;

    private User getUser() {
        User user = AuthUtil.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        return user;
    }

    @Override
    public HttpResponseTemp<?> setCluster(ClusterInfo clusterInfo) {

        if (clusterInfo == null) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_NOT_LEGAL);
        }
        if (!StringUtils.isBlank(clusterInfo.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_LEGAL, clusterInfo.checkLegality());
        }

        if (clusterBiz.hasCluster(clusterInfo.getName())) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_ALREADY_EXIST);
        }

        User user = getUser();
        clusterInfo.setCreateTime(System.currentTimeMillis());
        Cluster cluster = new Cluster(clusterInfo);
        cluster.setOwnerId(CurrentThreadInfo.getUserId());

        try {
            clusterBiz.insertCluster(cluster);
        } catch (DaoException e) {
            throw ApiException.wrapKnownException(ResultStat.CANNOT_SET_CLUSTER, e);
        }
        clusterInfo.setId(cluster.getId());
        long updateTime = System.currentTimeMillis();
        collectionBiz.addAuthority(new CollectionAuthorityMap(cluster.getId(), ResourceType.CLUSTER, CurrentThreadInfo.getUserId(), Role.MASTER, updateTime));
        collectionBiz.addResource(new CollectionResourceMap(cluster.getId(), CurrentThreadInfo.getUserId(), ResourceType.CLUSTER, cluster.getId(), updateTime));

        OperationRecord record = new OperationRecord(clusterInfo.getId(), ResourceType.CLUSTER, OperationType.SET,
                user.getId(), user.getUsername(), "OK", "", updateTime);
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(clusterInfo);
    }

    @Override
    public HttpResponseTemp<?> listCluster() {

        int userId = CurrentThreadInfo.getUserId();
        return ResultStat.OK.wrap(getClusterListByUserId(userId));
    }

    @Override
    public HttpResponseTemp<?> getCluster(int id) {

        checkOperationPermission(id, OperationType.GET);

        Cluster cluster = clusterBiz.getClusterById(id);
        if (cluster == null) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_NOT_EXIST);
        }

        int buildConfig = 0;
        CiCluster ciCluster = globalBiz.getCiCluster();
        if (ciCluster != null && ciCluster.getClusterId() == cluster.getId()) {
            buildConfig = 1;
        }

        ClusterInfo clusterInfo = ClusterInfo.fromCluster(cluster);
        clusterInfo.setBuildConfig(buildConfig);
        return ResultStat.OK.wrap(clusterInfo);
    }

    @Override
    public HttpResponseTemp<?> updateCluster(ClusterInfo clusterInfo) {
        User user = getUser();
        checkOperationPermission(clusterInfo.getId(), OperationType.MODIFY);

        if (!StringUtils.isBlank(clusterInfo.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, clusterInfo.checkLegality());
        }

        Cluster oldCluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, clusterInfo.getId(), Cluster.class);
        if (oldCluster == null) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_NOT_EXIST);
        }

        try {
            KubeUtils kubeUtils = Fabric8KubeUtils.buildKubeUtils(oldCluster, null);
            kubeUtils.deleteKubeUtils(oldCluster);
            oldCluster.update(clusterInfo);
            clusterBiz.updateCluster(oldCluster);

            OperationRecord record = new OperationRecord(clusterInfo.getId(), ResourceType.CLUSTER, OperationType.MODIFY,
                    user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
            operationHistory.insertRecord(record);
        } catch (DaoException | K8sDriverException e) {
            throw ApiException.wrapKnownException(ResultStat.CANNOT_UPDATE_CLUSTER, e);
        }

        return ResultStat.OK.wrap(clusterInfo);
    }

    @Override
    public HttpResponseTemp<?> deleteCluster(int id) {
        User user = getUser();
        checkOperationPermission(id, OperationType.DELETE);

        Cluster oldCluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, id, Cluster.class);
        if (oldCluster == null) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_NOT_EXIST);
        }

        List<Deployment> deployments = deploymentBiz.listDeploymentByClusterId(id);
        if (deployments != null && deployments.size() > 0) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_EXIST, "There are deployments in this cluster, you must delete them first");
        }
        clusterBiz.removeById(GlobalConstant.CLUSTER_TABLE_NAME, id);

        collectionBiz.deleteAuthoritiesByCollectionIdAndResourceType(id, ResourceType.CLUSTER);
        collectionBiz.deleteResourceByResourceIdAndResourceType(id, ResourceType.CLUSTER);

        OperationRecord record = new OperationRecord(id, ResourceType.CLUSTER, OperationType.DELETE,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        try {
            KubeUtils kubeUtils = Fabric8KubeUtils.buildKubeUtils(oldCluster, null);
            kubeUtils.deleteKubeUtils(oldCluster);
        } catch (K8sDriverException e) {
            throw ApiException.wrapKnownException(ResultStat.CREATOR_ERROR, e);
        }

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getAllNamespacesByClusterId(int id) {

        checkOperationPermission(id, OperationType.GET);

        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            List<NamespaceInfo> namespaces = nodeWrapper.getAllNamespaces();
            return ResultStat.OK.wrap(namespaces);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> putNamespacesByClusterId(int id, List<String> namespaces) {

        checkOperationPermission(id, OperationType.MODIFY);

        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, id, Cluster.class);

            if (nodeWrapper.setNamespaces(namespaces)) {
                // todo: add operation history
                return ResultStat.OK.wrap(null);
            } else {
                throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, "put namespace error");
            }
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeListByClusterId(int id) {
        checkOperationPermission(id, OperationType.GET);
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            List<NodeInfo> nodeInfoList = nodeWrapper.getNodeListByClusterId();
            Collections.sort(nodeInfoList, new NodeInfo.NodeInfoListComparator());
            return ResultStat.OK.wrap(nodeInfoList);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeListWithoutPodsByClusterId(int id) {
        checkOperationPermission(id, OperationType.GET);
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            return ResultStat.OK.wrap(nodeWrapper.getNodeInfoListWithoutPods());
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getInstanceListByClusterIdWithNamespace(int id, String namespace) {
        checkOperationPermission(id, OperationType.GET);

        Cluster cluster = clusterBiz.getClusterById(id);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, String.format("cluster %d not existed.", id));
        }

        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, namespace);
            return ResultStat.OK.wrap(nodeWrapper.getInstance());
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getInstanceListByClusterIdWithNamespaceAndLabels(int id, String namespace, String labels) {
        checkOperationPermission(id, OperationType.GET);

        Cluster cluster = clusterBiz.getClusterById(id);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, String.format("cluster %d not existed.", id));
        }

        try {
            Map<String, String> labelsMap = mapper.readValue(labels, new TypeReference<Map<String, String>>() {
            });
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, namespace);
            return ResultStat.OK.wrap(nodeWrapper.getInstanceWithNodeLabels(labelsMap));
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeByClusterIdAndName(int id, String name) {
        checkOperationPermission(id, OperationType.GET);
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            return ResultStat.OK.wrap(nodeWrapper.getNodeInfo(name));
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getInstanceListByNodeName(int id, String name) {
        checkOperationPermission(id, OperationType.GET);
        // todo: instance
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            return ResultStat.OK.wrap(nodeWrapper.getInstance(name));
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getLabelsByClusterId(int id) {
        checkOperationPermission(id, OperationType.GET);
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            return ResultStat.OK.wrap(nodeWrapper.getClusterLabels());
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeListByClusterIdWithLabels(int id, String labels) {
        checkOperationPermission(id, OperationType.GET);
        try {
            Map<String, String> labelsMap = mapper.readValue(labels, new TypeReference<Map<String, String>>() {
            });
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            List<NodeInfo> nodeInfoList = nodeWrapper.getNodeListByLabel(labelsMap);
            Collections.sort(nodeInfoList, new NodeInfo.NodeInfoListComparator());
            return ResultStat.OK.wrap(nodeInfoList);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> deleteNodeLabels(int id, List<NodeLabel> nodeLabels) {

        checkOperationPermission(id, OperationType.MODIFY);

        if (nodeLabels == null) {
            return ResultStat.OK.wrap(null);
        }
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            List<DeleteNodeLabelsTask> deleteNodeLabelsTaskList = new LinkedList<>();
            for (NodeLabel nodeLabel : nodeLabels) {
                if (nodeLabel == null || nodeLabel.getLabels() == null) {
                    continue;
                }
                deleteNodeLabelsTaskList.add(new DeleteNodeLabelsTask(nodeWrapper, nodeLabel));
            }
            ClientConfigure.executeCompletionService(deleteNodeLabelsTaskList);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
        return ResultStat.OK.wrap(null);
    }

    private class DeleteNodeLabelsTask implements Callable<Boolean> {
        private NodeWrapper nodeWrapper;
        private NodeLabel nodeLabel;

        DeleteNodeLabelsTask(NodeWrapper nodeWrapper, NodeLabel nodeLabel) {
            this.nodeWrapper = nodeWrapper;
            this.nodeLabel = nodeLabel;
        }

        @Override
        public Boolean call() throws Exception {
            if (nodeWrapper == null || nodeLabel == null) {
                return false;
            }
            if (nodeLabel.getLabels() != null) {
                List<String> labelKeys = new LinkedList<>();
                for (Map.Entry<String, String> entry : nodeLabel.getLabels().entrySet()) {
                    labelKeys.add(entry.getKey());
                }
                nodeWrapper.deleteNodeLabels(nodeLabel.getNode(), labelKeys);
            }
            return true;
        }
    }

    @Override
    public HttpResponseTemp<?> setNodeLabels(int id, List<NodeLabel> nodeLabels) {

        checkOperationPermission(id, OperationType.MODIFY);

        if (nodeLabels == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "node label info is null");
        }
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            List<SetNodeLabelsTask> setNodeLabelsTaskList = new LinkedList<>();
            for (NodeLabel nodeLabel : nodeLabels) {
                if (nodeLabel == null || nodeLabel.getLabels() == null) {
                    continue;
                }
                if (!StringUtils.isBlank(nodeLabel.checkLegality())) {
                    throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "label for node " + nodeLabel.getNode()
                            + " is illegal: " + nodeLabel.checkLegality());
                }
                setNodeLabelsTaskList.add(new SetNodeLabelsTask(nodeWrapper, nodeLabel));
            }
            ClientConfigure.executeCompletionService(setNodeLabelsTaskList);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
        return ResultStat.OK.wrap(null);
    }

    private class SetNodeLabelsTask implements Callable<Boolean> {
        private NodeWrapper nodeWrapper;
        private NodeLabel nodeLabel;

        SetNodeLabelsTask(NodeWrapper nodeWrapper, NodeLabel nodeLabel) {
            this.nodeWrapper = nodeWrapper;
            this.nodeLabel = nodeLabel;
        }

        @Override
        public Boolean call() throws Exception {
            if (nodeWrapper == null || nodeLabel == null) {
                return false;
            }
            if (nodeLabel.getLabels() != null && nodeLabel.getLabels().size() > 0) {
                return nodeWrapper.setNodeLabels(nodeLabel.getNode(), nodeLabel.getLabels());
            }
            return true;
        }
    }

    // TODO should add a table in mysql to record disk for node info
    @Override
    public HttpResponseTemp<?> addDiskForNode(int id, String nodeName, String path) throws Exception {

        checkOperationPermission(id, OperationType.MODIFY);

        // TODO should insert into a table in mysql
        NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
        nodeWrapper.addNodeDisk(nodeName, path);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteDiskForNode(int id, String nodeName) throws Exception {

        checkOperationPermission(id, OperationType.MODIFY);

        // TODO should delete from a table in mysql
        NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
        nodeWrapper.deleteNodeDisk(nodeName);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> createWatcherInCluster(int id, ClusterWatcherConf watcherConf) {
        checkOperationPermission(id, OperationType.MODIFY);
        watcherConf.setClusterId(id);
        watcherConf.setCreatorId(CurrentThreadInfo.getUserId());
        if (!StringUtils.isBlank(watcherConf.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, watcherConf.checkLegality());
        }
        int count = clusterBiz.getWatcherSizeDeployMapByClusterId(id);
        if (count > 0) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "watcher existed!");
        }
        String deployName = watcherConf.getName();
        List<Deployment> list = deploymentBiz.getListByName(GlobalConstant.DEPLOY_TABLE_NAME, deployName, Deployment.class);
        if (list != null && !list.isEmpty()) {
            for (Deployment one : list) {
                if (one.getClusterId() == watcherConf.getClusterId() &&
                        one.getNamespace().equals(watcherConf.getNamespace())) {
                    throw ApiException.wrapResultStat(ResultStat.DEPLOYMENT_EXIST);
                }
            }
        }
        watcherConf.setCreateTime(System.currentTimeMillis());
        addContainerEnv(watcherConf);

        Deployment deployment = watcherConf.toDeployment();
        deployment.setState(DeploymentStatus.STOP.name());
        deploymentBiz.createDeployment(deployment);

        Version version = watcherConf.toVersion();
        version.setDeployId(deployment.getId());
        version.setCreateTime(deployment.getCreateTime());
        try {
            versionBiz.insertRow(version);
        } catch (ApiException e) {
            // failed
            deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployment.getId());
            throw e;
        }

        ClusterWatcherDeployMap watcherDeployMap = new ClusterWatcherDeployMap();
        watcherDeployMap.setClusterId(id);
        watcherDeployMap.setDeployId(deployment.getId());
        watcherDeployMap.setUpdateTime(System.currentTimeMillis());
        clusterBiz.setClusterWacherDeployMap(watcherDeployMap);

        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                deployment.getId(),
                ResourceType.DEPLOY,
                OperationType.SET,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));

        return ResultStat.OK.wrap(deployment);
    }

    private void addContainerEnv(ClusterWatcherConf watcherConf) {
        if (watcherConf == null) {
            return;
        }
        if (watcherConf.getContainerDrafts() == null || watcherConf.getContainerDrafts().isEmpty()) {
            return;
        }
        List<String> args = new ArrayList<>();
        Cluster cluster = clusterBiz.getClusterById(watcherConf.getClusterId());
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such cluster!");
        }
        Server server = globalBiz.getServer();
        if (server == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "DomeOS server address in global configuration must be set");
        }
        args.add("--apiserver=" + cluster.getApi());
        args.add("--in-cluster=false");
        args.add("--port=8080");
        args.add("--clusterId=" + watcherConf.getClusterId());
        if (server.getUrl().endsWith("/")) {
            args.add("--domeosServer=" + server.getUrl() + "api/k8sevent/report");
        } else {
            args.add("--domeosServer=" + server.getUrl() + "/api/k8sevent/report");
        }
        for (ContainerDraft containerDraft : watcherConf.getContainerDrafts()) {
            containerDraft.setArgs(args);
        }
    }

    @Override
    public HttpResponseTemp<?> getWatcherStatus(int id) {
        checkOperationPermission(id, OperationType.GET);

        ClusterWatcherDeployMap watcherDeployMap = clusterBiz.getWacherDeployMapByClusterId(id);
        if (watcherDeployMap == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no watcher in this cluster");
        }

        Deployment deployment = deploymentBiz.getDeployment(watcherDeployMap.getDeployId());
        if (!deployment.deployTerminated()) {
            try {
                DeployEvent event = deployEventBiz.getNewestEventByDeployId(watcherDeployMap.getDeployId());
                EventChecker eventChecker = new EventChecker(deployment, event);
                eventChecker.checkEvent();
                deployment = deploymentBiz.getDeployment(watcherDeployMap.getDeployId());
            } catch (IOException e) {
                logger.warn("get newest event by deploy id error, deployId=" + watcherDeployMap.getDeployId() + ", message: " + e.getMessage());
            } catch (DataBaseContentException e) {
                logger.warn("event or deploy is null, deployId=" + watcherDeployMap.getDeployId());
            }
        }
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(id);
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, " There is no RuntimeDriver for cluster(" + id + ").");
        }
        ClusterWatcherInfo watcherInfo = new ClusterWatcherInfo();
        watcherInfo.setName(deployment.getName());
        watcherInfo.setDescription(deployment.getDescription());
        watcherInfo.setDeployId(deployment.getId());
        watcherInfo.setClusterId(id);
        watcherInfo.setNamespace(deployment.getNamespace());
        watcherInfo.setState(deployment.getState());
        watcherInfo.setCreateTime(deployment.getCreateTime());
        watcherInfo.setHostEnv(deployment.getHostEnv());
        try {
            List<Version> versions = driver.getCurrnetVersionsByDeployment(deployment);
            if (versions != null && !versions.isEmpty()) {
                List<VersionSelectorInfo> versionSelectorInfos = new ArrayList<>(versions.size());
                for (Version version : versions) {
                    versionSelectorInfos.add(new VersionSelectorInfo(version.getVersion(), version.getLabelSelectors(), version.getContainerDrafts()));
                }
                watcherInfo.setVersionSelectorInfos(versionSelectorInfos);
            }
        } catch (DeploymentEventException e) {
            logger.warn("exception when get watcher versions, message is " + e.getMessage() + ", cluster(" + id + ")"
                    + ", deploy(" + deployment.getId() + ")");
        }
        return ResultStat.OK.wrap(watcherInfo);
    }

    private List<ClusterListInfo> getClusterListByUserId(int userId) {
        List<CollectionAuthorityMap> collectionAuthoritys = AuthUtil.getCollectionList(userId, ResourceType.CLUSTER);

        List<ClusterListInfo> clusterListInfo = new LinkedList<>();

        if (collectionAuthoritys != null && collectionAuthoritys.size() > 0) {
            List<ClusterListInfoTask> clusterListInfoTasks = new LinkedList<>();
            CiCluster ciCluster = globalBiz.getCiCluster();
            for (CollectionAuthorityMap collectionAuthority : collectionAuthoritys) {
                clusterListInfoTasks.add(new ClusterListInfoTask(userId, collectionAuthority.getCollectionId(), ciCluster));
            }
            clusterListInfo = ClientConfigure.executeCompletionService(clusterListInfoTasks);
        }
        return clusterListInfo;
    }

    private class ClusterListInfoTask implements Callable<ClusterListInfo> {
        private int userId;
        private int clusterId;
        private CiCluster ciCluster;

        ClusterListInfoTask(int userId, int clusterId, CiCluster ciCluster) {
            this.userId = userId;
            this.clusterId = clusterId;
            this.ciCluster = ciCluster;
        }

        @Override
        public ClusterListInfo call() throws Exception {
            Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, clusterId, Cluster.class);
            if (cluster == null) {
                return null;
            }
            int nodeNum = 0, podNum = 0;
            try {
                NodeWrapper nodeWrapper = new NodeWrapper().init(clusterId, null);
                nodeNum = nodeWrapper.getNodeCount();
                podNum = nodeWrapper.getPodCount();
            } catch (Exception e) {
                logger.warn("get cluster info error, message is " + e.getMessage());
            }

            int buildConfig = 0;
            if (ciCluster != null && ciCluster.getClusterId() == cluster.getId()) {
                buildConfig = 1;
            }
            Role role = AuthUtil.getUserRoleInResource(ResourceType.CLUSTER, cluster.getId(), userId);
            WatcherStatus watcherStatus = WatcherStatus.NOTEXIST;
            ClusterWatcherDeployMap watcherDeployMap = clusterBiz.getWacherDeployMapByClusterId(cluster.getId());
            if (watcherDeployMap != null) {
                Deployment deployment = deploymentBiz.getDeployment(watcherDeployMap.getDeployId());
                if (deployment != null && "RUNNING".equals(deployment.getState())) {
                    watcherStatus = WatcherStatus.RUNNING;
                } else {
                    watcherStatus = WatcherStatus.ERROR;
                }
            }
            return new ClusterListInfo(cluster.getId(), cluster.getName(), cluster.getApi(), cluster.getTag(),
                    cluster.getDomain(), cluster.getLogConfig(), cluster.getOwnerName(), role,
                    cluster.getCreateTime(), nodeNum, podNum, buildConfig, watcherStatus);
        }
    }

    private void checkOperationPermission(int id, OperationType operationType) {
        int userId = CurrentThreadInfo.getUserId();
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, operationType)) {
            throw new PermitException("userId:" + userId + ", groupId:" + id);
        }
    }
}
