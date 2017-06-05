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
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.NodeUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.domeos.global.ClientConfigure;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.DateUtil;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.util.*;
import java.util.concurrent.Callable;

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

    public NodeWrapper init(int clusterId, String namespace) throws K8sDriverException {
        Cluster cluster = KubeServiceInfo.getClusterBasicById(clusterId);
        this.init(cluster, namespace);

        return this;
    }

    public NodeWrapper init(Cluster cluster, String namespace) throws K8sDriverException {
        if (cluster == null) {
            throw new K8sDriverException("no such cluster info");
        }

        // TODO: when we have different cluster type, should add more op here
        client = Fabric8KubeUtils.buildKubeUtils(cluster, namespace);
        return this;
    }

    public List<NodeInfo> getNodeListByClusterId() {
        NodeList nodeList = getNodeList();
        List<NodeInfo> nodeInfo = new LinkedList<>();
        if (nodeList != null && nodeList.getItems() != null) {
            List<NodeInfoTask> infoTasks = new LinkedList<>();

            for (Node node : nodeList.getItems()) {
                infoTasks.add(new NodeInfoTask(node));
            }
            nodeInfo = ClientConfigure.executeCompletionService(infoTasks);
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

    public List<NodeInfo> getNodeInfoListWithoutPods() throws ParseException {
        NodeList nodeList = getNodeList();
        List<NodeInfo> nodeInfoList = new LinkedList<>();
        if (nodeList != null && nodeList.getItems() != null) {
            for (Node node : nodeList.getItems()) {
                NodeInfo nodeInfo = new NodeInfo();

                if (node.getMetadata() != null) {
                    nodeInfo.setLabels(node.getMetadata().getLabels());
                    nodeInfo.setName(node.getMetadata().getName());
                    if (node.getMetadata().getAnnotations() != null) {
                        nodeInfo.setDiskInfo(node.getMetadata().getAnnotations().get(GlobalConstant.DISK_STR));
                    }
                    nodeInfo.setCreateTime(DateUtil.string2timestamp(node.getMetadata().getCreationTimestamp(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME)));
                }
                if (node.getStatus() != null) {
                    if (node.getStatus().getAddresses() != null) {
                        for (NodeAddress nodeAddress : node.getStatus().getAddresses()) {
                            if ("internalip".equalsIgnoreCase(nodeAddress.getType())) {
                                nodeInfo.setIp(nodeAddress.getAddress());
                            }
                        }
                    }
                    if (node.getStatus().getNodeInfo() != null) {
                        NodeSystemInfo nodeSystemInfo = node.getStatus().getNodeInfo();
                        if (StringUtils.isNotBlank(nodeSystemInfo.getContainerRuntimeVersion())
                                && nodeSystemInfo.getContainerRuntimeVersion().startsWith("docker://")) {
                            nodeInfo.setDockerVersion(nodeSystemInfo.getContainerRuntimeVersion().replace("docker://", ""));
                        }
                        if (StringUtils.isNotBlank(nodeSystemInfo.getKubeletVersion())) {
                            nodeInfo.setKubeletVersion(nodeSystemInfo.getKubeletVersion());
                        }
                        if (StringUtils.isNotBlank(nodeSystemInfo.getKernelVersion())) {
                            nodeInfo.setKernelVersion(nodeSystemInfo.getKernelVersion());
                        }
                        if (StringUtils.isNotBlank(nodeSystemInfo.getOsImage())) {
                            nodeInfo.setOsVersion(nodeSystemInfo.getOsImage());
                        } else if (StringUtils.isNotBlank(nodeSystemInfo.getOperatingSystem())) {
                            nodeInfo.setOsVersion(nodeSystemInfo.getOperatingSystem());
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
                nodeInfoList.add(nodeInfo);
            }
        }
        return nodeInfoList;
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

    public List<Instance> getInstanceWithNodeLabels(Map<String, String> labels) throws ParseException {
        NodeList nodeList = getNodeListByLabels(labels);
        if (nodeList != null && nodeList.getItems() != null) {
            List<String> nodeNameList = new ArrayList<>(nodeList.getItems().size());
            for (Node node : nodeList.getItems()) {
                nodeNameList.add(node.getMetadata().getName());
            }
            PodList podList = getAllPods();
            if (podList != null && !podList.getItems().isEmpty()) {
                List<Instance> instances = new ArrayList<>(podList.getItems().size());
                for (Pod pod : podList.getItems()) {
                    if (pod.getSpec() != null && nodeNameList.contains(pod.getSpec().getNodeName())) {
                        try {
                            Instance instance = transferPodToInstance(pod);
                            if (instance != null && !instance.getStatus().equalsIgnoreCase("Completed")) {
                                instances.add(instance);
                            }
                        } catch (Exception ignored) {
                        }
                    }
                }
                return instances;
            }
            return new ArrayList<>(1);
        } else {
            return null;
        }
    }

    public List<Instance> getInstance(String nodeName) throws ParseException {
        if (StringUtils.isBlank(nodeName)) {
            return null;
        }
        PodList podList = getAllPods();
        if (podList != null && !podList.getItems().isEmpty()) {
            List<Instance> instances = new ArrayList<>(podList.getItems().size());
            for (Pod pod : podList.getItems()) {
                if (pod.getSpec() != null && nodeName.equals(pod.getSpec().getNodeName())) {
                    try {
                        Instance instance = transferPodToInstance(pod);
                        if (instance != null && !instance.getStatus().equalsIgnoreCase("Completed")) {
                            instances.add(instance);
                        }
                    } catch (Exception ignored) {
                    }
                }
            }
            return instances;
        }
        return new ArrayList<>(1);
    }

    public List<Instance> getInstance() throws ParseException {
        PodList podList = getAllPods();
        if (podList != null && !podList.getItems().isEmpty()) {
            List<Instance> instances = new ArrayList<>(podList.getItems().size());
            for (Pod pod : podList.getItems()) {
                try {
                    Instance instance = transferPodToInstance(pod);
                    if (instance != null && !instance.getStatus().equalsIgnoreCase("Completed")) {
                        instances.add(instance);
                    }
                } catch (Exception ignored) {
                }
            }
            return instances;
        }
        return new ArrayList<>(1);
    }

    private Instance transferPodToInstance(Pod pod) throws ParseException {
        if (pod == null) {
            return null;
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
                    if (StringUtils.isBlank(containerStatus.getContainerID())) {
                        continue;
                    }
                    String containerId = containerStatus.getContainerID().split("docker://")[1];
                    instance.addContainer(new org.domeos.framework.api.model.deployment.related.Container(containerId,
                            containerStatus.getName(), containerStatus.getImage()));
                }
            }
        }
        instance.setStatus(PodUtils.getPodStatus(pod));

        return instance;
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
                    logger.error("parse node info error: " + e.getMessage());
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
        } catch (K8sDriverException | ParseException e) {
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
                } catch (K8sDriverException e) {
                    logger.warn("put namespace error, message is " + e.getMessage());
                    return false;
                }
            }
        }
        return true;
    }

    public boolean deleteSecret(String secretName) {
        if (StringUtils.isBlank(secretName)) {
            return false;
        }
        try {
            client.deleteSecret(GlobalConstant.SECRET_NAME_PREFIX + secretName);
        } catch (K8sDriverException e) {
            logger.warn("delete secret error, message is " + e.getMessage());
            return false;
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
        } catch (K8sDriverException e) {
            logger.warn("get container log error, message is " + e.getMessage());
            throw new JobLogException(e.getMessage());
        }
    }

    public boolean setNodeLabels(String nodeName, Map<String, String> labels) throws Exception {
        try {
            Node node = client.labelNode(nodeName, labels);
            return node != null;
        } catch (K8sDriverException e) {
            logger.warn("set node label error, message is " + e.getMessage());
            throw new Exception("set node labels error, message is " + e.getMessage());
        }
    }

    public boolean deleteNodeLabels(String nodeName, List<String> labels) throws Exception {
        try {
            Node node = client.deleteNodeLabel(nodeName, labels);
            return node != null;
        } catch (K8sDriverException e) {
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
        } catch (K8sDriverException e) {
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
        } catch (K8sDriverException e) {
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
        if (node.getStatus() != null) {
            if (node.getStatus().getAddresses() != null) {
                for (NodeAddress nodeAddress : node.getStatus().getAddresses()) {
                    if ("internalip".equalsIgnoreCase(nodeAddress.getType())) {
                        nodeInfo.setIp(nodeAddress.getAddress());
                    }
                }
            }
            if (node.getStatus().getNodeInfo() != null) {
                NodeSystemInfo nodeSystemInfo = node.getStatus().getNodeInfo();
                if (StringUtils.isNotBlank(nodeSystemInfo.getContainerRuntimeVersion())
                        && nodeSystemInfo.getContainerRuntimeVersion().startsWith("docker://")) {
                    nodeInfo.setDockerVersion(nodeSystemInfo.getContainerRuntimeVersion().replace("docker://", ""));
                }
                if (StringUtils.isNotBlank(nodeSystemInfo.getKubeletVersion())) {
                    nodeInfo.setKubeletVersion(nodeSystemInfo.getKubeletVersion());
                }
                if (StringUtils.isNotBlank(nodeSystemInfo.getKernelVersion())) {
                    nodeInfo.setKernelVersion(nodeSystemInfo.getKernelVersion());
                }
                if (StringUtils.isNotBlank(nodeSystemInfo.getOsImage())) {
                    nodeInfo.setOsVersion(nodeSystemInfo.getOsImage());
                } else if (StringUtils.isNotBlank(nodeSystemInfo.getOperatingSystem())) {
                    nodeInfo.setOsVersion(nodeSystemInfo.getOperatingSystem());
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