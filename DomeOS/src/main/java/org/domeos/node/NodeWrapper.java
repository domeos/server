package org.domeos.node;

import org.domeos.api.model.ci.ContainerLogHandler;
import org.domeos.api.model.cluster.ClusterBasic;
import org.domeos.api.model.console.Cluster.NamespaceInfo;
import org.domeos.api.service.ci.impl.KubeServiceInfo;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.KubeClientContext;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.exception.JobLogException;
import org.domeos.exception.JobNotFoundException;
import org.domeos.global.DateManager;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.text.ParseException;
import java.util.*;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class NodeWrapper {
    private static Logger logger = LoggerFactory.getLogger(NodeWrapper.class);
    private KubeClient kubeClient;

    public NodeWrapper init(int clusterId, String namespace) throws Exception {
        ClusterBasic clusterBasic = KubeServiceInfo.getClusterBasicById(clusterId);
        if (clusterBasic == null) {
            throw new Exception("no such cluster info, id=" + clusterId);
        }
        KubeClientContext context = new KubeClientContext();
        context.setNamespace(namespace);
        context.setPretty(false);
        kubeClient = new KubeClient(clusterBasic.getApi(), context);
        return this;
    }

    public List<NamespaceInfo> getAllNamespaces() {
        try {
            NamespaceList namespaceList = kubeClient.listAllNamespace();
            List<NamespaceInfo> namespaceInfos = new LinkedList<>();
            if (namespaceList != null && namespaceList.getItems() != null) {
                for (Namespace namespace : namespaceList.getItems()) {
                    if (namespace.getMetadata() != null) {
                        namespaceInfos.add(new NamespaceInfo(namespace.getMetadata().getName(),
                                DateManager.string2timestamp(namespace.getMetadata().getCreationTimestamp(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME))));
                    }
                }
            }
            return namespaceInfos;
        } catch (KubeResponseException | IOException | KubeInternalErrorException |ParseException e) {
            logger.warn("get all namespaces error, message is " + e.getMessage());
            return null;
        }
    }

    public boolean setNamespaces(List<String> namespaces) {
        if (namespaces != null) {
            for (String name : namespaces) {
                Namespace namespace = new Namespace();
                namespace.putMetadata(new ObjectMeta().putName(name));
                try {
                    kubeClient.createNamespace(namespace);
                } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
                    logger.warn("put namespace error, message is " + e.getMessage());
                    return false;
                }
            }
        }
        return true;
    }

    public NodeList getNodeList() {
        try {
            return kubeClient.listNode();
        } catch (IOException | KubeResponseException | KubeInternalErrorException e) {
            logger.warn("get node list error, message is " + e.getMessage());
            return null;
        }
    }

    public NodeList getNodeListByLabels(Map<String, String> labels) {
        try {
            if (labels == null) {
                return null;
            }
            return kubeClient.listNode(labels);
        } catch (IOException | KubeResponseException | KubeInternalErrorException e) {
            logger.warn("get node list by labels error, message is " + e.getMessage());
            return null;
        }
    }

    public List<Pod> getPodListByNode(String nodeName) {
        try {
            PodList podList = kubeClient.listAllPod();
            List<Pod> pods = new LinkedList<>();
            if (podList != null && podList.getItems() != null) {
                for (Pod pod : podList.getItems()) {
                    if (pod.getSpec() != null && nodeName.equals(pod.getSpec().getNodeName())) {
                        pods.add(pod);
                    }
                }
            }
            return pods;
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            logger.warn("get pod list error, message is " + e.getMessage());
            return null;
        }
    }

    public int getRunningPodNumbers(List<Pod> pods) {
        if (pods != null) {
            return PodUtils.getPodReadyNumber(pods.toArray(new Pod[pods.size()]));
        } else {
            return 0;
        }
    }

    public int getRunningPodNumbers(Pod[] pods) {
        if (pods != null) {
            return PodUtils.getPodReadyNumber(pods);
        } else {
            return 0;
        }
    }

    public PodList getPods(Map<String, String> labels) {
        try {
            if (labels == null) {
                return null;
            }
            return kubeClient.listPod(labels);
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            logger.warn("get deployment pod list by labels error, message is " + e.getMessage());
            return null;
        }
    }

    public PodList getAllPods() {
        try {
            return kubeClient.listAllPod();
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            logger.warn("get deployment pod list by labels error, message is " + e.getMessage());
            return null;
        }
    }

    public void fetchContainerLogs(String podName, String containerName, ContainerLogHandler handler) throws JobNotFoundException, JobLogException {
        try {
            kubeClient.tailfLog(podName, containerName, false, handler);
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            logger.warn("get container log error, message is " + e.getMessage());
            throw new JobLogException(e.getMessage());
        }
    }

    public boolean setNodeLabels(String nodeName, Map<String, String> labels) throws Exception {
        try {
            Node node = kubeClient.labelNode(nodeName, labels);
            return node != null;
        } catch (IOException | KubeResponseException | KubeInternalErrorException e) {
            logger.warn("set node label error, message is " + e.getMessage());
            throw new Exception("set node labels error, message is " + e.getMessage());
        }
    }

    public boolean deleteNodeLabels(String nodeName, String label) throws Exception {
        try {
            List<String> labels = new LinkedList<>();
            labels.add(label);
            Node node = kubeClient.deleteNodeLabel(nodeName, labels);
            return node != null;
        } catch (IOException | KubeResponseException | KubeInternalErrorException e) {
            logger.warn("delete node labels error, message is " + e.getMessage());
            throw new Exception("delete node labels error, message is " + e.getMessage());
        }
    }

    public boolean addNodeDisk(String nodeName, String diskPath)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        Map<String, String> annotation = new HashMap<>();
        annotation.put(GlobalConstant.DISK_STR, diskPath);
        Node node = kubeClient.annotateNode(nodeName, annotation);
        return node != null && node.getMetadata() != null
                && node.getMetadata().getAnnotations() != null
                && node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR);
    }
    public boolean deleteNodeDisk(String nodeName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        List<String> diskAnnotation = new LinkedList<>();
        diskAnnotation.add(GlobalConstant.DISK_STR);
        Node node = kubeClient.deleteNodeAnnotation(nodeName, diskAnnotation);
        return node != null && node.getMetadata() != null
                && node.getMetadata().getAnnotations() != null
                && !node.getMetadata().getAnnotations().containsKey(GlobalConstant.DISK_STR);
    }
}
