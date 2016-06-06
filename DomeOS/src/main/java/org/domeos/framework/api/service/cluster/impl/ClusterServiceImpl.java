package org.domeos.framework.api.service.cluster.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.util.NodeUtils;
import org.domeos.client.kubernetesclient.util.PodUtils;
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
import org.domeos.framework.api.model.cluster.related.NodeInfo;
import org.domeos.framework.api.model.cluster.related.NodeLabel;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.Instance;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.cluster.ClusterService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.k8s.K8sDriver;
import org.domeos.framework.engine.k8s.NodeWrapper;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.framework.engine.RuntimeDriverFactory;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.DateUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.*;
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

//        ClusterRuntimeDriver.addClusterDriver(cluster.getId(), new K8sDriver().init(cluster));
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

        ClusterInfo clusterInfo = new ClusterInfo(cluster.getId(), cluster.getName(), cluster.getApi(), cluster.getTag(),
                cluster.getDomain(), cluster.getDns(), cluster.getEtcd(), cluster.getOwnerName(), cluster.getLogConfig(),
                cluster.getCreateTime(), buildConfig, cluster.getClusterLog());
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

        oldCluster.update(clusterInfo);

        try {
            clusterBiz.updateCluster(oldCluster);
        } catch (DaoException e) {
            throw ApiException.wrapKnownException(ResultStat.CANNOT_UPDATE_CLUSTER, e);
        }

//        ClusterRuntimeDriver.updateClusterDriver(clusterInfo.getId(), new K8sDriver().init(oldCluster));
        ClusterRuntimeDriver.updateClusterDriver(clusterInfo.getId(), RuntimeDriverFactory.getRuntimeDriver(K8sDriver.class, oldCluster));

        return ResultStat.OK.wrap(clusterInfo);
    }

    @Override
    public HttpResponseTemp<?> deleteCluster(int id) {

        checkOperationPermission(id, OperationType.DELETE);

        List<Deployment> deployments = deploymentBiz.listDeploymentByClusterId(id);
        if (deployments != null && deployments.size() > 0) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_EXIST, "There are deployments in this cluster, you must delete them first");
        }
        clusterBiz.removeById(GlobalConstant.CLUSTER_TABLE_NAME, id);

        ClusterRuntimeDriver.removeClusterDriver(id);

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
            NodeList nodeList = getClusterNodeList(nodeWrapper);
            List<NodeInfo> nodeInfo = new LinkedList<>();
            if (nodeList != null && nodeList.getItems() != null) {
                List<Future<NodeInfo>> futures = new LinkedList<>();
                for (Node node : nodeList.getItems()) {
                    Future<NodeInfo> future = ClientConfigure.executorService.submit(new NodeInfoTask(node, id));
                    futures.add(future);
                }
                for (Future<NodeInfo> future : futures) {
                    try {
                        NodeInfo info = future.get();
                        if (info != null) {
                            nodeInfo.add(info);
                        }
                    } catch (InterruptedException | ExecutionException e) {
                        logger.warn("get cluster node list error, message is " + e.getMessage());
                    }
                }
            }
            return ResultStat.OK.wrap(nodeInfo);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeByClusterIdAndName(int id, String name) {

        checkOperationPermission(id, OperationType.GET);

        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            NodeList nodeList = getClusterNodeList(nodeWrapper);
            NodeInfo nodeInfo = null;
            if (nodeList != null && nodeList.getItems() != null) {
                for (Node node : nodeList.getItems()) {
                    if (node.getMetadata() != null && name.equals(node.getMetadata().getName())) {
                        nodeInfo = new NodeInfo();
                        fillNodeInfo(node, nodeInfo, nodeWrapper);
                        break;
                    }
                }
            }
            if (nodeInfo == null) {
                throw ApiException.wrapMessage(ResultStat.RESOURCE_NOT_EXIST, "no such node");
            }
            return ResultStat.OK.wrap(nodeInfo);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getInstanceListByNodeName(int id, String name) {

        checkOperationPermission(id, OperationType.GET);

        // todo: instance
        Map<String, List<Instance>> nodeInstances = getInstances(id);
        return ResultStat.OK.wrap(nodeInstances.get(name));
    }

    @Override
    public HttpResponseTemp<?> getLabelsByClusterId(int id) {

        checkOperationPermission(id, OperationType.GET);

        Map<String, String> labels = new HashMap<>();
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            NodeList nodeList = getClusterNodeList(nodeWrapper);
            if (nodeList != null && nodeList.getItems() != null) {
                for (Node node : nodeList.getItems()) {
                    if (node.getMetadata() != null && node.getMetadata().getLabels() != null) {
                        labels.putAll(node.getMetadata().getLabels());
                    }
                }
            }
            return ResultStat.OK.wrap(labels);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeListByClusterIdWithLabels(int id, String labels) {

        checkOperationPermission(id, OperationType.GET);

        ObjectMapper mapper = new ObjectMapper();
        try {
            Map<String, String> labelsMap = mapper.readValue(labels, new TypeReference<Map<String, String>>() {
            });
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            NodeList nodeList = getNodeListByClusterIdWithLabels(nodeWrapper, labelsMap);
            List<NodeInfo> nodeInfos = new LinkedList<>();
            if (nodeList != null && nodeList.getItems() != null) {
                for (Node node : nodeList.getItems()) {
                    NodeInfo nodeInfo = new NodeInfo();
                    fillNodeInfo(node, nodeInfo, nodeWrapper);
                    nodeInfos.add(nodeInfo);
                }
            }
            return ResultStat.OK.wrap(nodeInfos);
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

    public void fillNodeInfo(Node node, NodeInfo nodeInfo, NodeWrapper nodeWrapper) throws ParseException {
        if (node.getMetadata() != null) {
            nodeInfo.setLabels(node.getMetadata().getLabels());
            nodeInfo.setName(node.getMetadata().getName());
            nodeInfo.setRunningPods(getRunningPods(nodeWrapper, nodeInfo.getName()));
            if (node.getMetadata().getAnnotations() != null) {
                nodeInfo.setDiskInfo(node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR));
            }
            nodeInfo.setCreateTime(DateUtil.string2timestamp(node.getMetadata().getCreationTimestamp(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME)));
        }
        if (node.getStatus() != null && node.getStatus().getAddresses() != null) {
            for (NodeAddress nodeAddress : node.getStatus().getAddresses()) {
                if (nodeAddress.getType().equalsIgnoreCase("internalip")) {
                    nodeInfo.setIp(nodeAddress.getAddress());
                }
            }
            Map<String, String> capacity = node.getStatus().getCapacity();
            if (capacity != null) {
                capacity.put("memory", CommonUtil.getMemory(capacity.get("memory")));
            }
            nodeInfo.setCapacity(capacity);
        }
        if (NodeUtils.isReady(node)) {
            nodeInfo.setStatus("Ready");
        } else {
            nodeInfo.setStatus("NotReady");
        }
    }

    public List<ClusterListInfo> getClusterListByUserId(int userId) {
        List<Resource> resources = AuthUtil.getResourceList(userId, ResourceType.CLUSTER);
        List<ClusterListInfo> clusterListInfo = new LinkedList<>();

        if (resources != null && resources.size() > 0) {
            List<Future<ClusterListInfo>> futures = new LinkedList<>();
            for (Resource resource : resources) {
                Future<ClusterListInfo> future = ClientConfigure.executorService.submit(new ClusterListInfoTask(resource.getResourceId()));
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

    public class ClusterListInfoTask implements Callable<ClusterListInfo> {
        int clusterId;

        public ClusterListInfoTask(int clusterId) {
            this.clusterId = clusterId;
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
                NodeList nodeList = nodeWrapper.getNodeList();
                if (nodeList != null && nodeList.getItems() != null) {
                    nodeNum = nodeList.getItems().length;
                }
                PodList podList = nodeWrapper.getAllPods();
                if (podList != null && podList.getItems() != null) {
                    podNum = nodeWrapper.getRunningPodNumbers(podList.getItems());
                }
            } catch (Exception e) {
                logger.warn("get cluster info error, message is " + e.getMessage());
            }

            int buildConfig = 0;
            CiCluster ciCluster = globalBiz.getCiCluster();
            if (ciCluster != null && ciCluster.getClusterId() == cluster.getId()) {
                buildConfig = 1;
            }

            return new ClusterListInfo(cluster.getId(), cluster.getName(), cluster.getApi(), cluster.getTag(),
                    cluster.getDomain(), cluster.getLogConfig(), cluster.getOwnerName(), cluster.getCreateTime(), nodeNum, podNum, buildConfig);
        }
    }

    public NodeList getClusterNodeList(NodeWrapper nodeWrapper) {
        try {
            return nodeWrapper.getNodeList();
        } catch (Exception e) {
            return null;
        }
    }

    public NodeList getNodeListByClusterIdWithLabels(NodeWrapper nodeWrapper, Map<String, String> labels) {
        try {
            return nodeWrapper.getNodeListByLabels(labels);
        } catch (Exception e) {
            return null;
        }
    }

    public int getRunningPods(NodeWrapper nodeWrapper, String nodeName) {
        try {
            List<Pod> pods = nodeWrapper.getPodListByNode(nodeName);
            return nodeWrapper.getRunningPodNumbers(pods);
        } catch (Exception e) {
            return 0;
        }
    }

    public Map<String, List<Instance>> getInstances(int clusterId) {
        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(clusterId, null);
            PodList podList = nodeWrapper.getAllPods();
            Map<String, List<Instance>> nodeInstances = new HashMap<>();
            if (podList != null && podList.getItems() != null) {
                for (Pod pod : podList.getItems()) {
                    if (!PodUtils.isPodReady(pod)) {
                        continue;
                    }
                    Instance instance = new Instance();
                    if (pod.getMetadata() != null) {
                        instance.setInstanceName(pod.getMetadata().getName());
                        instance.setNamespace(pod.getMetadata().getNamespace());
                        if (pod.getMetadata().getLabels() != null) {
                            if (pod.getMetadata().getLabels().containsKey(GlobalConstant.DEPLOY_ID_STR) &&
                                    pod.getMetadata().getLabels().containsKey(GlobalConstant.VERSION_STR)) {
                                int deployId = Integer.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.DEPLOY_ID_STR));
                                int versionId = Integer.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
                                // todo: deployment update
                                Deployment deployment = deploymentBiz.getDeployment(deployId);
                                if (deployment != null) {
                                    instance.setDeloyId(deployId);
                                    instance.setDeployName(deployment.getName());
                                    instance.setVersionId(versionId);
                                }
                            }
                        }
                    }
                    if (pod.getSpec() != null) {
                        instance.setHostName(pod.getSpec().getNodeName());
                    }
                    if (pod.getStatus() != null) {
                        instance.setStartTime(DateUtil.string2timestamp(pod.getStatus().getStartTime(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME)));
                        instance.setPodIp(pod.getStatus().getPodIP());
                        instance.setHostIp(pod.getStatus().getHostIP());
                        if (pod.getStatus().getContainerStatuses() != null) {
                            for (ContainerStatus containerStatus : pod.getStatus().getContainerStatuses()) {
                                String containerId = containerStatus.getContainerID().split("docker://")[1];
                                instance.addContainer(new org.domeos.framework.api.model.deployment.related.Container(containerId,
                                        containerStatus.getName(), containerStatus.getImage()));
                            }
                        }
                    }
                    if (nodeInstances.containsKey(instance.getHostName())) {
                        List<Instance> instances = nodeInstances.get(instance.getHostName());
                        if (instances == null) {
                            instances = new LinkedList<>();
                        }
                        instances.add(instance);
                    } else {
                        List<Instance> instances = new LinkedList<>();
                        instances.add(instance);
                        nodeInstances.put(instance.getHostName(), instances);
                    }
                }
            }
            return nodeInstances;
        } catch (Exception e) {
            logger.error("get instance info error, " + e);
            return null;
        }
    }

    public class NodeInfoTask implements Callable<NodeInfo> {
        Node node;
        int clusterId;

        public NodeInfoTask(Node node, int clusterId) {
            this.node = node;
            this.clusterId = clusterId;
        }

        @Override
        public NodeInfo call() throws Exception {
            NodeInfo nodeInfo = new NodeInfo();
            NodeWrapper nodeWrapper = new NodeWrapper().init(clusterId, null);
            fillNodeInfo(node, nodeInfo, nodeWrapper);
            if (node != null && node.getMetadata() != null
                    && node.getMetadata().getAnnotations() != null
                    && node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR)) {
                nodeInfo.setDiskInfo(node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR));
            }
            return nodeInfo;
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

    public void checkOperationPermission(int id, org.domeos.framework.api.model.operation.OperationType operationType) {
        int userId = CurrentThreadInfo.getUserId();
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, operationType)) {
            throw new PermitException("userId:" + userId + ", resourceId:" + id);
        }
    }
}
