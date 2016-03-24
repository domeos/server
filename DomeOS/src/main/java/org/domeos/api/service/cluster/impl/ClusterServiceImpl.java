package org.domeos.api.service.cluster.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.cluster.ClusterBasicMapper;
import org.domeos.api.mapper.cluster.ClusterLogMapper;
import org.domeos.api.mapper.deployment.DeploymentMapper;
import org.domeos.api.mapper.resource.ResourceHistoryMapper;
import org.domeos.api.model.cluster.ClusterBasic;
import org.domeos.api.model.cluster.ClusterLog;
import org.domeos.api.model.cluster.NodeInfo;
import org.domeos.api.model.console.Cluster.Cluster;
import org.domeos.api.model.console.Cluster.ClusterListInfo;
import org.domeos.api.model.console.Cluster.NamespaceInfo;
import org.domeos.api.model.console.Cluster.NodeLabel;
import org.domeos.api.model.console.deployment.Instance;
import org.domeos.api.model.deployment.Deployment;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceHistory;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.model.user.RoleType;
import org.domeos.api.service.cluster.ClusterService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.util.NodeUtils;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.global.ClientConfigure;
import org.domeos.global.DateManager;
import org.domeos.global.GlobalConstant;
import org.domeos.node.NodeWrapper;
import org.domeos.shiro.AuthUtil;
import org.domeos.util.CommonUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
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
    ClusterBasicMapper clusterBasicMapper;
    @Autowired
    ResourceHistoryMapper resourceHistoryMapper;
    @Autowired
    DeploymentMapper deploymentMapper;
    @Autowired
    ClusterLogMapper clusterLogMapper;

    @Override
    public HttpResponseTemp<?> setCluster(Cluster cluster, Long userId) {
        if (!StringUtils.isBlank(cluster.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, cluster.checkLegality());
        }

        ClusterBasic clusterBasic = new ClusterBasic(cluster);
        try {
            clusterBasicMapper.addClusterBasic(clusterBasic);
            cluster.setCreateTime(System.currentTimeMillis());
            if (cluster.getClusterLog() != null) {
                cluster.getClusterLog().setClusterId(clusterBasic.getId());
                clusterLogMapper.addClusterLog(cluster.getClusterLog());
            }
        } catch (DuplicateKeyException e) {
            return ResultStat.PARAM_ERROR.wrap(null, "cluster name or api already exist");
        }

        cluster.setId(clusterBasic.getId());

        Resource resource = new Resource(cluster.getId(), ResourceType.CLUSTER);
        AuthUtil.setResourceOwnerId(resource, cluster.getOwnerName(), cluster.getOwnerType(), userId);
        resource.setUpdate_time(new Date());
        resource.setRole(RoleType.MASTER.getRoleName());
        AuthUtil.addResource(resource);

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.CLUSTER.getResourceName(), cluster.getId(),
                OperationType.SET.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(cluster);
    }

    @Override
    public HttpResponseTemp<?> listCluster(Long userId) {
        return ResultStat.OK.wrap(getClusterListByUserId(userId));
    }

    @Override
    public HttpResponseTemp<?> getCluster(int id, Long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicById(id);
        if (clusterBasic == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such cluster");
        }
        ClusterLog clusterLog = clusterLogMapper.getClusterLogByClusterId(id);
        Cluster cluster = new Cluster(clusterBasic.getId(), clusterBasic.getName(), clusterBasic.getApi(), clusterBasic.getTag(),
                clusterBasic.getOwnerName(), clusterBasic.getOwnerType(), clusterBasic.getDomain(), clusterBasic.getDns(),
                clusterBasic.getEtcd(), clusterBasic.getLogConfig(), clusterBasic.getCreateTime(), clusterLog);
        return ResultStat.OK.wrap(cluster);
    }

    @Override
    public HttpResponseTemp<?> updateCluster(Cluster cluster, Long userId) {
        if (!AuthUtil.verify(userId, cluster.getId(), ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if (!StringUtils.isBlank(cluster.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, cluster.checkLegality());
        }

        ClusterBasic oldCluster = clusterBasicMapper.getClusterBasicById(cluster.getId());
        if (oldCluster == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such cluster info");
        }

        oldCluster.update(cluster);
        try {
            clusterBasicMapper.updateClusterBasicById(oldCluster);
            clusterLogMapper.deleteClusterLogByClusterId(oldCluster.getId());
            if (cluster.getClusterLog() != null) {
                clusterLogMapper.addClusterLog(cluster.getClusterLog());
            }
        } catch (DuplicateKeyException e) {
            return ResultStat.PARAM_ERROR.wrap(null, "cluster name or api already exist");
        }

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.CLUSTER.getResourceName(), cluster.getId(),
                OperationType.MODIFY.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return ResultStat.OK.wrap(cluster);
    }

    @Override
    public HttpResponseTemp<?> deleteCluster(int id, Long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.DELETE)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        clusterBasicMapper.deleteClusterBasicById(id);
        clusterLogMapper.deleteClusterLogByClusterId(id);

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.CLUSTER.getResourceName(), id,
                OperationType.DELETE.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getAllNamespacesByClusterId(int id, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            List<NamespaceInfo> namespaces = nodeWrapper.getAllNamespaces();
            return ResultStat.OK.wrap(namespaces);
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> putNamespacesByClusterId(int id, List<String> namespaces, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            if (nodeWrapper.setNamespaces(namespaces)) {
                ResourceHistory resourceHistory = new ResourceHistory(ResourceType.CLUSTER.getResourceName(), id,
                        OperationType.MODIFY.getOperation(), userId, System.currentTimeMillis(), "OK");
                resourceHistoryMapper.addResourceHistory(resourceHistory);
                return ResultStat.OK.wrap(null);
            } else {
                return ResultStat.PARAM_ERROR.wrap(null);
            }
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeListByClusterId(int id, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

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
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeListByClusterIdWithLabels(int id, String labels, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

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
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> getLabelsByClusterId(int id, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

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
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> getInstanceListByNodeName(int id, String name, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        Map<String, List<Instance>> nodeInstances = getInstances(id);
        return ResultStat.OK.wrap(nodeInstances.get(name));
    }

    @Override
    public HttpResponseTemp<?> setNodeLabelsByNodeName(int id, NodeLabel nodeLabel, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if (nodeLabel == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "node label info is null");
        }

        if (!StringUtils.isBlank(nodeLabel.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, nodeLabel.checkLegality());
        }

        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            if (nodeLabel.getLabels() != null && nodeLabel.getLabels().size() > 0) {
                nodeWrapper.setNodeLabels(nodeLabel.getNode(), nodeLabel.getLabels());
            }
            return ResultStat.OK.wrap(null);
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> getNodeByClusterIdAndName(int id, String name, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

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
                return ResultStat.RESOURCE_NOT_EXIST.wrap(null, "no such node");
            }
            return ResultStat.OK.wrap(nodeInfo);
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> deleteLabelsByClusterId(int id, String nodeName, String label, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        try {
            NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
            nodeWrapper.deleteNodeLabels(nodeName, label);
            return ResultStat.OK.wrap(null);
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    public void fillNodeInfo(Node node, NodeInfo nodeInfo, NodeWrapper nodeWrapper) throws ParseException {
        if (node.getMetadata() != null) {
            nodeInfo.setLabels(node.getMetadata().getLabels());
            nodeInfo.setName(node.getMetadata().getName());
            nodeInfo.setRunningPods(getRunningPods(nodeWrapper, nodeInfo.getName()));
            if (node.getMetadata().getAnnotations() != null) {
                nodeInfo.setDiskInfo(node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR));
            }
            nodeInfo.setCreateTime(DateManager.string2timestamp(node.getMetadata().getCreationTimestamp(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME)));
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

    public List<ClusterListInfo> getClusterListByUserId(Long userId) {
        List<Resource> resources = AuthUtil.getResourceList(userId, ResourceType.CLUSTER);
        List<ClusterListInfo> clusterListInfo = new LinkedList<>();
        if (resources != null && resources.size() > 0) {
            List<Future<ClusterListInfo>> futures = new LinkedList<>();
            for (Resource resource : resources) {
                Future<ClusterListInfo> future = ClientConfigure.executorService.submit(new ClusterListInfoTask(new Long(resource.getResource_id()).intValue()));
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
            ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicById(clusterId);
            if (clusterBasic == null) {
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
            return new ClusterListInfo(clusterBasic.getId(), clusterBasic.getName(), clusterBasic.getApi(), clusterBasic.getTag(),
                    clusterBasic.getOwnerName(), clusterBasic.getOwnerType(), clusterBasic.getDomain(), clusterBasic.getLogConfig(),
                    clusterBasic.getCreateTime(), nodeNum, podNum);
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
                            if (pod.getMetadata().getLabels().containsKey(GlobalConstant.DEPLOY_ID_STR) && pod.getMetadata().getLabels().containsKey(GlobalConstant.VERSION_STR)) {
                                int deployId = Integer.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.DEPLOY_ID_STR));
                                int versionId = Integer.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
                                Deployment deployment = deploymentMapper.getDeploy(deployId);
                                if (deployment != null) {
                                    instance.setDeloyId(deployId);
                                    instance.setDeployName(deployment.getDeployName());
                                    instance.setVersionId(versionId);
                                }
                            }
                        }
                    }
                    if (pod.getSpec() != null) {
                        instance.setHostName(pod.getSpec().getNodeName());
                    }
                    if (pod.getStatus() != null) {
                        instance.setStartTime(DateManager.string2timestamp(pod.getStatus().getStartTime(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME)));
                        instance.setPodIp(pod.getStatus().getPodIP());
                        instance.setHostIp(pod.getStatus().getHostIP());
                        if (pod.getStatus().getContainerStatuses() != null) {
                            for (ContainerStatus containerStatus : pod.getStatus().getContainerStatuses()) {
                                String containerId = containerStatus.getContainerID().split("docker://")[1];
                                instance.addContainer(new org.domeos.api.model.console.deployment.Container(containerId, containerStatus.getName(), containerStatus.getImage()));
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
    public HttpResponseTemp<?> addDiskForNode(int id, String nodeName, String path, long userId) throws Exception {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        // TODO should insert into a table in mysql
        NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
        nodeWrapper.addNodeDisk(nodeName, path);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteDiskForNode(int id, String nodeName, long userId) throws Exception {
        if (!AuthUtil.verify(userId, id, ResourceType.CLUSTER, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        // TODO should delete from a table in mysql
        NodeWrapper nodeWrapper = new NodeWrapper().init(id, null);
        nodeWrapper.deleteNodeDisk(nodeName);
        return ResultStat.OK.wrap(null);
    }

}
