package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.client.dsl.LogWatch;
import org.domeos.exception.JobLogException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.NamespaceInfo;
import org.domeos.framework.api.model.cluster.related.NodeInfo;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.Instance;
import org.domeos.framework.api.service.project.impl.KubeServiceInfo;
import org.domeos.framework.engine.k8s.util.*;
import org.domeos.global.ClientConfigure;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.DateUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.text.ParseException;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
@Component("nodeWrapper")
public class NodeWrapper {
    private Logger logger = LoggerFactory.getLogger(NodeWrapper.class);
    private KubeUtils client;

    private static DeploymentBiz deploymentBiz;

    @Autowired
    public void setProjectBiz(DeploymentBiz deploymentBiz) {
        NodeWrapper.deploymentBiz = deploymentBiz;
    }

    public NodeWrapper init(int clusterId, String namespace) throws Exception {
        Cluster cluster = KubeServiceInfo.getClusterBasicById(clusterId);
        if (cluster == null) {
            throw new Exception("no such cluster info, id=" + clusterId);
        }

        // TODO: when we have different cluster type, should add more op here
        client = Fabric8KubeUtils.buildKubeUtils(cluster, namespace);
        return this;
    }

    public List<NodeInfo> getNodeListByClusterId() {
        NodeList nodeList = getNodeList();
        List<NodeInfo> nodeInfo = new LinkedList<>();
        if (nodeList != null && nodeList.getItems() != null) {
            List<Future<NodeInfo>> futures = new LinkedList<>();
            for (Node node : nodeList.getItems()) {
                Future<NodeInfo> future = ClientConfigure.executorService.submit(new NodeInfoTask(node));
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
        return nodeInfo;
    }

    private class NodeInfoTask implements Callable<NodeInfo> {
        Node node;

        NodeInfoTask(Node node) {
            this.node = node;
        }

        @Override
        public NodeInfo call() throws Exception {
            NodeInfo nodeInfo = generateNodeInfo(node);
            if (node != null && node.getMetadata() != null
                    && node.getMetadata().getAnnotations() != null
                    && node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR)) {
                nodeInfo.setDiskInfo(node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR));
            }
            return nodeInfo;
        }
    }

    public NodeInfo getNodeInfo(String name) {
        NodeList nodeList = getNodeList();
        NodeInfo nodeInfo = null;
        if (nodeList != null && nodeList.getItems() != null) {
            for (Node node : nodeList.getItems()) {
                if (node.getMetadata() != null && name.equals(node.getMetadata().getName())) {
                    try {
                        nodeInfo = generateNodeInfo(node);
                    } catch (ParseException e) {
                        throw ApiException.wrapUnknownException(e);
                    }
                    break;
                }
            }
        }
        return nodeInfo;
    }

    public List<Instance> getInstance(String nodeName) throws ParseException {
        if (StringUtils.isBlank(nodeName)) {
            return null;
        }
        PodList podList = getAllPods();
        List<Instance> instances = new ArrayList<>();
        if (podList != null && podList.getItems() != null) {
            for (Pod pod : podList.getItems()) {
                if (!PodUtils.isPodReady(pod) || pod.getSpec() == null || !nodeName.equals(pod.getSpec().getNodeName())) {
                    continue;
                }
                Instance instance = new Instance();
                instance.setHostName(pod.getSpec().getNodeName());
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
                instances.add(instance);
            }
        }
        return instances;
    }

    public Map<String, String> getClusterLabels() {
        Map<String, String> labels = new HashMap<>();
        NodeList nodeList = getNodeList();
        if (nodeList != null && nodeList.getItems() != null) {
            for (Node node : nodeList.getItems()) {
                if (node.getMetadata() != null && node.getMetadata().getLabels() != null) {
                    labels.putAll(node.getMetadata().getLabels());
                }
            }
        }
        return labels;
    }

    public List<NodeInfo> getNodeListByLabel(Map<String, String> labels) {
        NodeList nodeList = getNodeListByLabels(labels);
        if (nodeList != null && nodeList.getItems() != null) {
            List<NodeInfo> nodeInfos = new ArrayList<>(nodeList.getItems().size());
            for (Node node : nodeList.getItems()) {
                NodeInfo nodeInfo = null;
                try {
                    nodeInfo = generateNodeInfo(node);
                } catch (ParseException e) {
                    e.printStackTrace();
                }
                nodeInfos.add(nodeInfo);
            }
            return nodeInfos;
        }
        return null;
    }

    public List<NamespaceInfo> getAllNamespaces() {
        try {
            NamespaceList namespaceList = client.listAllNamespace();
            List<NamespaceInfo> namespaceInfos = new LinkedList<>();
            if (namespaceList != null && namespaceList.getItems() != null) {
                for (Namespace namespace : namespaceList.getItems()) {
                    if (namespace.getMetadata() != null) {
                        namespaceInfos.add(new NamespaceInfo(namespace.getMetadata().getName(),
                                DateUtil.string2timestamp(namespace.getMetadata().getCreationTimestamp(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME))));
                    }
                }
            }
            return namespaceInfos;
        } catch (K8sDriverException | ParseException | IOException e) {
            logger.warn("get all namespaces error in {} , message is " + e.getMessage(), client.info());
            return null;
        }
    }

    public boolean setNamespaces(List<String> namespaces) {
        if (namespaces != null) {
            for (String name : namespaces) {
                Namespace namespace = new Namespace();
                ObjectMeta objectMeta = new ObjectMeta();
                objectMeta.setName(name);
                namespace.setMetadata(objectMeta);
                try {
                    client.createNamespace(namespace);
                } catch (K8sDriverException | IOException e) {
                    logger.warn("put namespace error, message is " + e.getMessage());
                    return false;
                }
            }
        }
        return true;
    }

    public PodList getPods(Map<String, String> labels) {
        try {
            if (labels == null) {
                return null;
            }
            return client.listAllPod(labels);
        } catch (Exception e) {
            logger.warn("get deployment pod list by labels error, message is " + e.getMessage());
            return null;
        }
    }

    private PodList getAllPods() {
        try {
            return client.listAllPod();
        } catch (Exception e) {
            logger.warn("get deployment pod list by labels error, message is " + e.getMessage());
            return null;
        }
    }

    public LogWatch fetchContainerLogs(String podName, String containerName) throws JobLogException {
        try {
            return (LogWatch) client.tailfLog(podName, containerName, 10);
        } catch (K8sDriverException | IOException e) {
            logger.warn("get container log error, message is " + e.getMessage());
            throw new JobLogException(e.getMessage());
        }
    }

    public boolean setNodeLabels(String nodeName, Map<String, String> labels) throws Exception {
        try {
            Node node = client.labelNode(nodeName, labels);
            return node != null;
        } catch (K8sDriverException | IOException e) {
            logger.warn("set node label error, message is " + e.getMessage());
            throw new Exception("set node labels error, message is " + e.getMessage());
        }
    }

    public boolean deleteNodeLabels(String nodeName, String label) throws Exception {
        try {
            List<String> labels = new LinkedList<>();
            labels.add(label);
            Node node = client.deleteNodeLabel(nodeName, labels);
            return node != null;
        } catch (K8sDriverException | IOException e) {
            logger.warn("delete node labels error, message is " + e.getMessage());
            throw new Exception("delete node labels error, message is " + e.getMessage());
        }
    }

    public boolean addNodeDisk(String nodeName, String diskPath) throws Exception {
        Node node = null;
        try {
            Map<String, String> annotation = new HashMap<>();
            annotation.put(GlobalConstant.DISK_STR, diskPath);
            node = client.annotateNode(nodeName, annotation);
        } catch (K8sDriverException e) {
            logger.warn("add node labels error, message is " + e.getMessage());
            throw new Exception("add node disk error, message is " + e.getMessage());
        }
        return node != null && node.getMetadata() != null
                && node.getMetadata().getAnnotations() != null
                && node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR);
    }

    public boolean deleteNodeDisk(String nodeName) throws Exception {
        Node node = null;
        try {
            List<String> diskAnnotation = new LinkedList<>();
            diskAnnotation.add(GlobalConstant.DISK_STR);
            node = client.deleteNodeAnnotation(nodeName, diskAnnotation);
        } catch (K8sDriverException e) {
            logger.warn("delete node disk error, message is " + e.getMessage());
            throw new Exception("delete node disk error, message is " + e.getMessage());
        }
        return node != null && node.getMetadata() != null
                && node.getMetadata().getAnnotations() != null
                && !node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR);
    }

    public int getNodeCount() {
        NodeList nodeList = getNodeList();
        if (nodeList != null && nodeList.getItems() != null) {
            return nodeList.getItems().size();
        }
        return 0;
    }

    public int getPodCount() {
        PodList podList = getAllPods();
        if (podList != null && podList.getItems() != null) {
            return getRunningPodNumbers(podList.getItems());
        }
        return 0;
    }

    private NodeList getNodeList() {
        try {
            return client.listNode();
        } catch (K8sDriverException | IOException e) {
            logger.warn("get node list error, message is " + e.getMessage());
            return null;
        }
    }

    private NodeList getNodeListByLabels(Map<String, String> labels) {
        try {
            if (labels == null) {
                return null;
            }
            return client.listNode(labels);
        } catch (K8sDriverException | IOException e) {
            logger.warn("get node list by labels error, message is " + e.getMessage());
            return null;
        }
    }

    private List<Pod> getPodListByNode(String nodeName) {
        try {
            PodList podList = client.listAllPod();
            List<Pod> pods = new LinkedList<>();
            if (podList != null && podList.getItems() != null) {
                for (Pod pod : podList.getItems()) {
                    if (pod.getSpec() != null && nodeName.equals(pod.getSpec().getNodeName())) {
                        pods.add(pod);
                    }
                }
            }
            return pods;
        } catch (Exception e) {
            logger.warn("get pod list error, message is " + e.getMessage());
            return null;
        }
    }

    private int getRunningPodNumbers(List<Pod> pods) {
        if (pods != null) {
            return PodUtils.getPodReadyNumber(pods);
        } else {
            return 0;
        }
    }

    private NodeInfo generateNodeInfo(Node node) throws ParseException {
        NodeInfo nodeInfo = new NodeInfo();
        if (node.getMetadata() != null) {
            nodeInfo.setLabels(node.getMetadata().getLabels());
            nodeInfo.setName(node.getMetadata().getName());
            nodeInfo.setRunningPods(getRunningPodNumbers(getPodListByNode(nodeInfo.getName())));
            if (node.getMetadata().getAnnotations() != null) {
                nodeInfo.setDiskInfo(node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR));
            }
            nodeInfo.setCreateTime(DateUtil.string2timestamp(node.getMetadata().getCreationTimestamp(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME)));
        }
        if (node.getStatus() != null && node.getStatus().getAddresses() != null) {
            for (NodeAddress nodeAddress : node.getStatus().getAddresses()) {
                if ("internalip".equalsIgnoreCase(nodeAddress.getType())) {
                    nodeInfo.setIp(nodeAddress.getAddress());
                }
            }
            Map<String, Quantity> capacity = node.getStatus().getCapacity();
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
        return nodeInfo;
    }
}
