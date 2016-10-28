package org.domeos.framework.api.service.cluster.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.consolemodel.CreatorDraft;
import org.domeos.framework.api.consolemodel.cluster.ClusterCreate;
import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
import org.domeos.framework.api.consolemodel.cluster.ClusterListInfo;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.NamespaceInfo;
import org.domeos.framework.api.model.cluster.related.NodeLabel;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.cluster.ClusterService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.RuntimeDriverFactory;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.k8s.K8sDriver;
import org.domeos.framework.engine.k8s.NodeWrapper;
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

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
@Service("clusterService")
public class ClusterServiceImpl implements ClusterService {

    private static Logger logger = LoggerFactory.getLogger(ClusterServiceImpl.class);

    @Autowired
    ResourceBiz resourceBiz;

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    AuthBiz authBiz;

    @Autowired
    CustomObjectMapper mapper;

    @Override
    public HttpResponseTemp<?> setCluster(ClusterCreate clusterCreate) {

        if (clusterCreate == null || clusterCreate.getClusterInfo() == null || clusterCreate.getCreatorDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_LEGAL, "cluster info is null");
        }
        ClusterInfo clusterInfo = clusterCreate.getClusterInfo();
        if (!StringUtils.isBlank(clusterInfo.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_LEGAL, clusterInfo.checkLegality());
        }

        CreatorDraft creatorDraft = clusterCreate.getCreatorDraft();
        if (!StringUtils.isBlank(creatorDraft.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.CREATOR_ERROR, creatorDraft.checkLegality());
        }
        if (clusterBiz.hasCluster(clusterInfo.getName())) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_ALREADY_EXIST);
        }

        clusterInfo.setCreateTime(System.currentTimeMillis());
        Cluster cluster = new Cluster(clusterInfo);
        cluster.setOwnerId(creatorDraft.getCreatorId());
        cluster.setOwnerType(creatorDraft.getCreatorType());

        try {
            clusterBiz.insertCluster(cluster);
        } catch (DaoException e) {
            throw ApiException.wrapKnownException(ResultStat.CANNOT_SET_CLUSTER, e);
        }
        clusterInfo.setId(cluster.getId());

        resourceBiz.addResource(cluster.getId(), ResourceType.CLUSTER, creatorDraft.getCreatorId(), creatorDraft.getCreatorType(), Role.MASTER);

        ClusterRuntimeDriver.addClusterDriver(cluster.getId(), RuntimeDriverFactory.getRuntimeDriver(K8sDriver.class, cluster));

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
        } catch (DaoException | K8sDriverException e) {
            throw ApiException.wrapKnownException(ResultStat.CANNOT_UPDATE_CLUSTER, e);
        }

        ClusterRuntimeDriver.updateClusterDriver(clusterInfo.getId(), RuntimeDriverFactory.getRuntimeDriver(K8sDriver.class, oldCluster));

        return ResultStat.OK.wrap(clusterInfo);
    }

    @Override
    public HttpResponseTemp<?> deleteCluster(int id) {

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
        resourceBiz.deleteResourceByIdAndType(id, ResourceType.CLUSTER);

        ClusterRuntimeDriver.removeClusterDriver(id);
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
            return ResultStat.OK.wrap(nodeWrapper.getNodeListByClusterId());
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
            return ResultStat.OK.wrap(nodeWrapper.getNodeListByLabel(labelsMap));
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
            for (NodeLabel nodeLabel : nodeLabels) {
                if (nodeLabel == null || nodeLabel.getLabels() == null) {
                    continue;
                }
                for (Map.Entry<String, String> entry : nodeLabel.getLabels().entrySet()) {
                    nodeWrapper.deleteNodeLabels(nodeLabel.getNode(), entry.getKey());
                }
            }
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> setNodeLabels(int id, List<NodeLabel> nodeLabels) {

        checkOperationPermission(id, OperationType.MODIFY);

        if (nodeLabels == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "node label info is null");
        }
        for (NodeLabel nodeLabel : nodeLabels) {
            if (nodeLabel == null) {
                continue;
            }
            if (!StringUtils.isBlank(nodeLabel.checkLegality())) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "label for node " + nodeLabel.getNode() + " is illegal: " + nodeLabel.checkLegality());
            }
        }
        for (NodeLabel nodeLabel : nodeLabels) {
            if (nodeLabel == null) {
                continue;
            }
            try {
                NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
                if (nodeLabel.getLabels() != null && nodeLabel.getLabels().size() > 0) {
                    nodeWrapper.setNodeLabels(nodeLabel.getNode(), nodeLabel.getLabels());
                }
            } catch (Exception e) {
                throw ApiException.wrapUnknownException(e);
            }
        }
        return ResultStat.OK.wrap(null);
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

    private List<ClusterListInfo> getClusterListByUserId(int userId) {
        List<Resource> resources = AuthUtil.getResourceList(userId, ResourceType.CLUSTER);
        List<ClusterListInfo> clusterListInfo = new LinkedList<>();

        if (resources != null && resources.size() > 0) {
            List<Future<ClusterListInfo>> futures = new LinkedList<>();
            CiCluster ciCluster = globalBiz.getCiCluster();
            for (Resource resource : resources) {
                Future<ClusterListInfo> future = ClientConfigure.executorService.submit(new ClusterListInfoTask(resource.getResourceId(), ciCluster));
                futures.add(future);
            }
            for (Future<ClusterListInfo> future : futures) {
                try {
                    ClusterListInfo info = future.get();
                    if (info != null) {
                        clusterListInfo.add(info);
                    }
                } catch (InterruptedException | ExecutionException e) {
                    logger.warn("get cluster list error, message is " + e.getMessage());
                }
            }
        }
        return clusterListInfo;
    }

    private class ClusterListInfoTask implements Callable<ClusterListInfo> {
        private int clusterId;
        private CiCluster ciCluster;

        ClusterListInfoTask(int clusterId, CiCluster ciCluster) {
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

            return new ClusterListInfo(cluster.getId(), cluster.getName(), cluster.getApi(), cluster.getTag(),
                    cluster.getDomain(), cluster.getLogConfig(), cluster.getOwnerName(), cluster.getCreateTime(), nodeNum, podNum, buildConfig);
        }
    }

    private void checkOperationPermission(int id, org.domeos.framework.api.model.operation.OperationType operationType) {
        int userId = CurrentThreadInfo.getUserId();
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, operationType)) {
            throw new PermitException("userId:" + userId + ", resourceId:" + id);
        }
    }
}
