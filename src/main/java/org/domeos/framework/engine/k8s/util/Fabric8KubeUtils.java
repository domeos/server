package org.domeos.framework.engine.k8s.util;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.api.model.extensions.*;
import io.fabric8.kubernetes.api.model.extensions.Deployment;
import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.*;
import okhttp3.TlsVersion;
import org.apache.log4j.Logger;
import org.domeos.exception.K8sDriverException;
import org.domeos.exception.TimeoutException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.StringUtils;

import java.io.Closeable;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by KaiRen on 16/8/24.
 */
public class Fabric8KubeUtils implements KubeUtils<KubernetesClient> {
    private KubernetesClient client;
    private static final int CONNECTION_TIMEOUT = 3 * 1000;
    private static final int REQUEST_TIMEOUT = 3 * 1000;
    
    private static Logger logger = Logger.getLogger(Fabric8KubeUtils.class);


    @Override
    public KubernetesClient getClient() {
        return client;
    }

    @Override
    public void setClient(KubernetesClient client) {
        this.client = client;
    }

    @Override
    public String info() {
        if (client != null) {
            return "api=" + client.getMasterUrl() + ", namespace=" + client.getNamespace();
        }
        return "client is null";
    }

    @Override
    public String serverAddress() {
        if (client != null) {
            return client.getMasterUrl().toString();
        }
        return null;
    }

    @Override
    public String namespace() {
        if (client != null) {
            return client.getNamespace();
        }
        return null;
    }

    private Fabric8KubeUtils(KubernetesClient client) {
        this.client = client;
    }

    public void deleteKubeUtils(Cluster cluster) throws K8sDriverException {
        if (cluster == null) {
            throw new K8sDriverException("cluster is null");
        }
        try {
            if (KUBEUTILSMAP.containsKey(Integer.toString(cluster.getId()))) {
                KUBEUTILSMAP.remove(Integer.toString(cluster.getId()));
            }
            NamespaceList namespaceList = listAllNamespace();
            for (Namespace namespace : namespaceList.getItems()) {
                String key = cluster.getId() + namespace.getMetadata().getName();
                KUBEUTILSMAP.remove(key);
            }
        } catch (K8sDriverException e) {
            logger.error("get namespace list error, message is" + e);
        }
    }

    public static KubeUtils buildKubeUtils(Cluster cluster, String namespace) throws K8sDriverException {
        if (cluster == null) {
            throw new K8sDriverException("cluster is null");
        }
        String key = cluster.md5Key(namespace);
        if (KUBEUTILSMAP.containsKey(key)) {
            return KUBEUTILSMAP.get(key);
        }
        String master = cluster.getApi();
        master = CommonUtil.fullUrl(master);
        if (StringUtils.isBlank(master)) {
            throw new K8sDriverException("master api is null, cluster id=" + cluster.getId() + ", cluster name=" + cluster.getName());
        }

        Config config;
        if (master.toLowerCase().startsWith("https://")) {
            config = new ConfigBuilder().withMasterUrl(master)
                    .withTrustCerts(true)
                    .withNamespace(namespace)
                    .withOauthToken(cluster.getOauthToken())
                    .withUsername(cluster.getUsername())
                    .withPassword(cluster.getPassword())
                    .removeFromTlsVersions(TlsVersion.TLS_1_0)
                    .removeFromTlsVersions(TlsVersion.TLS_1_1)
                    .removeFromTlsVersions(TlsVersion.TLS_1_2)
                    .withRequestTimeout(REQUEST_TIMEOUT)
                    .withConnectionTimeout(CONNECTION_TIMEOUT)
                    .build();
        } else {
            config = new ConfigBuilder().withMasterUrl(master)
                    .withNamespace(namespace)
                    .withOauthToken(cluster.getOauthToken())
                    .withUsername(cluster.getUsername())
                    .withPassword(cluster.getPassword())
                    .removeFromTlsVersions(TlsVersion.TLS_1_0)
                    .removeFromTlsVersions(TlsVersion.TLS_1_1)
                    .removeFromTlsVersions(TlsVersion.TLS_1_2)
                    .withTrustCerts(true)
                    .withRequestTimeout(REQUEST_TIMEOUT)
                    .withConnectionTimeout(CONNECTION_TIMEOUT)
                    .build();
        }
        KubeUtils kubeUtils = buildKubeUtils(config);
        KUBEUTILSMAP.putIfAbsent(key, kubeUtils);
        return kubeUtils;
    }

    public static KubeUtils buildKubeUtils(Config config) throws K8sDriverException {
        KubernetesClient client;
        try {
            client = new DefaultKubernetesClient(config);
        } catch (Exception e) {
            throw new K8sDriverException("instantialize kubernetes client error");
        }
        return new Fabric8KubeUtils(client);
    }

    @Override
    public NodeList listNode(Map<String, String> labelSelector) throws K8sDriverException {
        logger.debug("list node with selector=" + labelSelector);
        try {
            return client.nodes().withLabels(labelSelector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public NodeList listNode() throws K8sDriverException {
        logger.debug("list all nodes");
        try {
            return client.nodes().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Node nodeInfo(String nodeName) throws K8sDriverException {
        logger.debug("get node info with nodeName=" + nodeName);
        try {
            return client.nodes().withName(nodeName).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Node labelNode(String nodeName, Map<String, String> labels) throws K8sDriverException {
        logger.debug("label node with nodeName=" + nodeName + ", labels=" + labels);
        try {
            Node node = nodeInfo(nodeName);
            node.getMetadata().getLabels().putAll(labels);
            return client.nodes().withName(nodeName).replace(node);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public List<Node> labelNode(List<String> nodeName, Map<String, String> labels)
            throws K8sDriverException {
        List<Node> nodeList = new LinkedList<>();
        for (String name : nodeName) {
            nodeList.add(labelNode(name, labels));
        }
        return nodeList;
    }

    @Override
    public Node deleteNodeLabel(String nodeName, List<String> labels)
            throws K8sDriverException {
        logger.debug("delete label of node=" + nodeName + ". delete list is " + labels);
        Node node = nodeInfo(nodeName);
        for (String label : labels) {
            node.getMetadata().getLabels().remove(label);
        }
        try {
            return client.nodes().withName(nodeName).replace(node);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Node annotateNode(String nodeName, Map<String, String> annotations)
            throws K8sDriverException {
        logger.debug("annotate node with nodeName=" + nodeName + ", annotation=" + annotations);
        try {
            Node node = nodeInfo(nodeName);
            node.getMetadata().getLabels().putAll(annotations);
            return client.nodes().withName(nodeName).replace(node);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Node deleteNodeAnnotation(String nodeName, List<String> annotations)
            throws K8sDriverException {
        logger.debug("delete annotation of node=" + nodeName + ". delete list is " + annotations);
        try {
            Node node = nodeInfo(nodeName);
            for (String annotation : annotations) {
                node.getMetadata().getAnnotations().remove(annotation);
            }
            return client.nodes().withName(nodeName).replace(node);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    // for pod
    @Override
    public PodList listPod(Map<String, String> selectors)
            throws K8sDriverException {
        logger.debug("list pod with selectors=" + selectors);
        return client.pods().withLabels(selectors).list();
    }

    @Override
    public PodList listPod()
            throws K8sDriverException {
        logger.debug("list pod");
        try {
            return client.pods().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public PodList listAllPod(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list pod in all namespace, with selectors=" + selector);
        try {
            return client.pods().inAnyNamespace().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public PodList listAllPod()
            throws K8sDriverException {
        logger.debug("list all pod in all namespace.");
        try {
            return client.pods().inAnyNamespace().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Pod createPod(Pod pod)
            throws K8sDriverException {
        logger.debug("create pod with specify=" + pod.toString());
        try {
            return client.pods().create(pod);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Pod podInfo(String name)
            throws K8sDriverException {
        if (name == null) {
            return null;
        }
        logger.debug("get pod info with name" + name);
        try {
            return client.pods().withName(name).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Pod replacePod(String name, Pod pod)
            throws K8sDriverException {
        if (pod == null || name == null) {
            return null;
        }
        logger.debug("replace pod with name=" + name + "pod =\n" + pod);
        try {
            return client.pods().withName(name).replace(pod);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deletePod(String name)
            throws K8sDriverException {
        if (name == null || name.isEmpty()) {
            return true;
        }
        logger.debug("delete pod=" + name);
        try {
            client.pods().withName(name).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
        return true;
        /*
        Pod pod =  restClient.delete()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getPodPath(name))
                .addParameter(getPrettyParameter())
                .query(Pod.class);
        return true;
        */
    }

    @Override
    public Pod patchPod(String name, Pod pod)
            throws K8sDriverException {
        if (name == null || pod == null) {
            return null;
        }
        logger.debug("update pod with name=" + name + "pod=\n" + pod);
        try {
            return client.pods().withName(name).patch(pod);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

//    public void watchPod(String resourceVersion, Map<String, String> selectors,
//                         UnitInputStreamResponseHandler<Pod> handler)
//            throws  K8sDriverException{
//        logger.debug("watch pod with selectors=" + selectors);
//        restClient.get()
//                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/pods")
//                .addParameter(getPrettyParameter())
//                .addParameter("labelSelector", formatSelector(selectors))
//                .addParameter("resourceVersion", resourceVersion)
//                .addParameter("watch", "true")
//                .queryWithResponseHandler(new PodInputStreamFactory(), handler);
//    }
//    public void watchPod(PodList podList, Map<String, String> selectors,
//                         UnitInputStreamResponseHandler<Pod> handler)
//            throws  K8sDriverException{
//        watchPod(podList.getMetadata().getResourceVersion(), selectors, handler);
//    }
//    public void watchPod(String resourceVersion,
//                         UnitInputStreamResponseHandler<Pod> handler)
//            throws  K8sDriverException{
//        watchPod(resourceVersion, null, handler);
//    }
//    public void watchPod(PodList podList, UnitInputStreamResponseHandler<Pod> handler)
//            throws  K8sDriverException{
//        watchPod(podList.getMetadata().getResourceVersion(), handler);
//    }
//
//    public void watchEvent(String resourceVersioin, UnitInputStreamResponseHandler<Event> handler)
//            throws  K8sDriverException{
//        restClient.get()
//                .path(getPathPrefix(v1) + "/events")
//                .addParameter(getPrettyParameter())
//                .addParameter("watch", "true")
//                .addParameter("resourceVersion", resourceVersioin)
//                .queryWithResponseHandler(new EventInputStreamFactory(), handler);
//    }

    // for replication controller
    @Override

    public ReplicationControllerList listReplicationController(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list replication controller with selector=" + selector);
        try {
            return client.replicationControllers().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public ReplicationControllerList listReplicationController()
            throws K8sDriverException {
        return listReplicationController(null);
    }

    // these functions contain "All" will ignore namespace and list all rc
    @Override
    public ReplicationControllerList listAllReplicationController(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list all replication controller");
        try {
            return client.replicationControllers().inAnyNamespace().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public ReplicationControllerList listAllReplicationController()
            throws K8sDriverException {
        return listAllReplicationController(null);
    }

    @Override
    public ReplicationController createReplicationController(ReplicationController rc)
            throws K8sDriverException {
        if (rc == null) {
            return null;
        }
        logger.debug("create replication controller with rc=\n" + rc);
        try {
            return client.replicationControllers().create(rc);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }

    }

    @Override
    public ReplicationController replicationControllerInfo(String name)
            throws K8sDriverException {
        if (name == null) {
            return null;
        }
        logger.debug("read replication controller with name=" + name);
        try {
            return client.replicationControllers().withName(name).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }


    @Override
    public ReplicationController replaceReplicationController(String name, ReplicationController rc)
            throws K8sDriverException {
        if (name == null || rc == null) {
            return null;
        }
        logger.debug("replace replication controller with name=" + name + ", replication controller=\n" + rc);
        try {
            return client.replicationControllers().withName(name).replace(rc);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public ReplicationController scaleReplicationController(String name, int replicas)
            throws K8sDriverException {
        if (StringUtils.isBlank(name)) {
            return null;
        }
        logger.debug("scale replication controller with name=" + name + ", replicas=\n" + replicas);
        try {
            return client.replicationControllers().withName(name).scale(replicas);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }


    @Override
    public boolean deleteReplicationController(String rcName, boolean checkExist)
            throws K8sDriverException {
        if (checkExist) {
            ReplicationController rc = null;
            try {
                rc = client.replicationControllers().withName(rcName).get();
            } catch (Exception ignore) {
            }
            if (rc != null) {
                return client.replicationControllers().withName(rcName).delete();
            }
        } else {
            return client.replicationControllers().withName(rcName).delete();
        }
        return false;
    }

    @Override
    public boolean deleteReplicationControllerWithoutCascading(String rcName)
            throws K8sDriverException {
        return client.replicationControllers().withName(rcName).cascading(false).delete();
    }

    @Override
    public ReplicationController patchReplicationController(String name, ReplicationController rc)
            throws K8sDriverException {
        if (name == null || rc == null) {
            return null;
        }
        logger.debug("update replicationController with name=" + name + "replicationController=\n" + rc);
        try {
            return client.replicationControllers().withName(name).cascading(false).patch(rc);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public DeploymentList listDeployment(Map<String, String> selector) throws K8sDriverException {
        logger.debug("list deployment with selector=" + selector);
        try {
            return client.extensions().deployments().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public DeploymentList listDeployment() throws K8sDriverException {
        return listDeployment(null);
    }

    @Override
    public DeploymentList listAllDeployment(Map<String, String> selector) throws K8sDriverException {
        logger.debug("list all deployment with selector=" + selector);
        try {
            return client.extensions().deployments().inAnyNamespace().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public DeploymentList listAllDeployment() throws K8sDriverException {
        return listAllDeployment(null);
    }

    @Override
    public Deployment createDeployment(Deployment deployment) throws K8sDriverException {
        if (deployment == null) {
            return null;
        }
        logger.debug("create deployment with deployment=\n" + deployment);
        try {
            return client.extensions().deployments().create(deployment);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Deployment deploymentInfo(String name) throws K8sDriverException {
        if (name == null) {
            return null;
        }
        logger.debug("read deployment with name=" + name);
        try {
            return client.extensions().deployments().withName(name).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Deployment replaceDeployment(String name, Deployment deployment) throws K8sDriverException {
        if (name == null || deployment == null) {
            return null;
        }
        logger.debug("replace deployment with name=" + name + ", deployment=\n" + deployment);
        try {
            return client.extensions().deployments().withName(name).replace(deployment);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteDeployment(String deploymentName, boolean checkExist) throws K8sDriverException {
        if (checkExist) {
            Deployment deploy = null;
            try {
                deploy = client.extensions().deployments().withName(deploymentName).get();
            } catch (Exception ignore) {
            }
            if (deploy != null) {
                return client.extensions().deployments().withName(deploymentName).delete();
            }
        } else {
            return client.extensions().deployments().withName(deploymentName).delete();
        }
        return false;
    }

    @Override
    public Deployment patchDeployment(String deploymentName, Deployment deployment) throws K8sDriverException {
        if (deploymentName == null || deploymentName.isEmpty() || deployment == null) {
            return null;
        }
        logger.debug("update deployment with name=" + deploymentName + ", Deployment=" + deployment);
        try {
            return client.extensions().deployments().withName(deploymentName).patch(deployment);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Deployment scaleDeployment(String name, int replicas) throws K8sDriverException {
        if (StringUtils.isBlank(name)) {
            return null;
        }
        logger.debug("scale deployment with name=" + name + ", replicas=\n" + replicas);
        try {
            return client.extensions().deployments().withName(name).scale(replicas);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    public void pauseDeployment(String name) throws K8sDriverException {
        if (StringUtils.isBlank(name)) {
            return;
        }
        logger.debug("pause deployment with name=" + name);
        Deployment deployment = deploymentInfo(name);
        if (deployment != null) {
            Boolean paused = deployment.getSpec().getPaused();
            if (paused == null || !paused) {
                DeploymentSpec deploymentSpec = deployment.getSpec();
                deploymentSpec.setPaused(true);
                client.extensions().deployments().withName(name).edit().withSpec(deploymentSpec).done();
            }
        }
    }

    @Override
    public void resumeDeployment(String name) throws K8sDriverException {
        if (StringUtils.isBlank(name)) {
            return;
        }
        logger.debug("resume deployment with name=" + name);
        Deployment deployment = deploymentInfo(name);
        if (deployment != null) {
            Boolean paused = deployment.getSpec().getPaused();
            if (paused != null && paused) {
                DeploymentSpec deploymentSpec = deployment.getSpec();
                deploymentSpec.setPaused(false);
                client.extensions().deployments().withName(name).edit().withSpec(deploymentSpec).done();
            }
        }
    }

    //DaemonSet


    @Override
    public DaemonSetList listDaemonSet(Map<String, String> selector) throws K8sDriverException {
        logger.debug("list DaemonSet with selector=" + selector);
        try {
            return client.extensions().daemonSets().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public DaemonSetList listDaemonSet() throws K8sDriverException {
        return listDaemonSet(null);
    }

    @Override
    public DaemonSetList listAllDaemonSet(Map<String, String> selector) throws K8sDriverException {
        logger.debug("list DaemonSet with selector=" + selector);
        try {
            return client.extensions().daemonSets().inAnyNamespace().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public DaemonSetList listAllDaemonSet() throws K8sDriverException {
        return listAllDaemonSet(null);
    }

    @Override
    public DaemonSet createDaemonSet(DaemonSet daemonSet) throws K8sDriverException {
        if (daemonSet == null) {
            return null;
        }
        logger.debug("create DaemonSet with DaemonSet=\n" + daemonSet);
        try {
            return client.extensions().daemonSets().create(daemonSet);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public DaemonSet daemonSetInfo(String name) throws K8sDriverException {
        if (name == null) {
            return null;
        }
        logger.debug("read DaemonSet with name=" + name);
        try {
            return client.extensions().daemonSets().withName(name).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public DaemonSet replaceDaemonSet(String name, DaemonSet daemonSet) throws K8sDriverException {
        if (name == null || daemonSet == null) {
            return null;
        }
        logger.debug("replace DaemonSet with name=" + name + ", DaemonSet=\n" + daemonSet);
        try {
            return client.extensions().daemonSets().withName(name).replace(daemonSet);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteDaemonSet(String daemonSetName, boolean checkExist) throws K8sDriverException {
        if (checkExist) {
            DaemonSet ds = null;
            try {
                ds = client.extensions().daemonSets().withName(daemonSetName).get();
            } catch (Exception ignore) {
            }
            if (ds != null) {
                return client.extensions().daemonSets().withName(daemonSetName).delete();
            }
        } else {
            return client.extensions().daemonSets().withName(daemonSetName).delete();
        }
        return false;
    }

    @Override
    public DaemonSet patchDaemonSet(String daemonSetName, DaemonSet daemonSet) throws K8sDriverException {
        if (daemonSetName == null || daemonSetName.isEmpty() || daemonSet == null) {
            return null;
        }
        logger.debug("update DaemonSet with name=" + daemonSetName + ", DaemonSet=" + daemonSet);
        try {
            return client.extensions().daemonSets().withName(daemonSetName).patch(daemonSet);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public PersistentVolumeList listAllPersistentVolume(Map<String, String> selector) throws K8sDriverException {
        logger.debug("list persistent volume with selector=" + selector);
        try {
            return client.persistentVolumes().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public PersistentVolumeList listAllPersistentVolume() throws K8sDriverException {
        return listAllPersistentVolume(null);
    }

    @Override
    public PersistentVolume createPersistentVolume(PersistentVolume persistentVolume) throws K8sDriverException {
        if (persistentVolume == null) {
            return null;
        }
        logger.debug("create persistent volume with persistentVolume=\n" + persistentVolume);
        try {
            return client.persistentVolumes().create(persistentVolume);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("create pv error, message is " + e.getMessage());
        }
    }

    @Override
    public PersistentVolumeClaim createPersistentVolumeClaim(PersistentVolumeClaim persistentVolumeClaim) throws K8sDriverException {
        if (persistentVolumeClaim == null) {
            return null;
        }
        logger.debug("create persistent volume claim with persistentVolumeClaim=\n" + persistentVolumeClaim);
        try {
            return client.persistentVolumeClaims().create(persistentVolumeClaim);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("create pvc error, message is " + e.getMessage());
        }
    }

    @Override
    public PersistentVolumeClaim persistentVolumeClaimInfo(String name) throws K8sDriverException {
        try {
            return client.persistentVolumeClaims().withName(name).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("get pvc info error, message is " + e.getMessage());
        }
    }

    @Override
    public void deletePersistentVolumeClaim(String name) throws K8sDriverException {
        try {
            client.persistentVolumeClaims().withName(name).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("delete pvc " + name + "error, message is " + e.getMessage());
        }
    }

    @Override
    public void deleteEndpoints(String name) throws K8sDriverException {
        try {
            client.endpoints().withName(name).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("delete endpoints " + name + "error, message is " + e.getMessage());
        }
    }
    
    @Override
    public ConfigMap createConfigmap(ConfigMap configMap) throws K8sDriverException {
        try {
            return client.configMaps().create(configMap);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("create configmap " + "error, message is " + e.getMessage());
        }
    }

    @Override
    public void deleteConfigmap(Map<String, String> labels) throws K8sDriverException {
        try {
            client.configMaps().withLabels(labels).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("delete configmap " + "error, message is " + e.getMessage());
        }
    }

    @Override
    public void patchConfigmap(ConfigMap configMap) throws K8sDriverException {
        try {
            client.configMaps().withName(configMap.getMetadata().getName()).patch(configMap);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("patch configmap " + "error, message is " + e.getMessage());
        }
    }
    
    @Override
    public PersistentVolume persistentVolumeInfo(String name) throws K8sDriverException {
        if (name == null) {
            return null;
        }
        logger.debug("read persistent volume with name=" + name);
        try {
            return client.persistentVolumes().withName(name).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException("get pv info error, message is " + e.getMessage());
        }
    }

    @Override
    public PersistentVolume replacePersistentVolume(String name, PersistentVolume persistentVolume) throws K8sDriverException {
        if (name == null || persistentVolume == null) {
            return null;
        }
        logger.debug("replace persistent Volume with name=" + name + ", persistentVolume=\n" + persistentVolume);
        try {
            return client.persistentVolumes().withName(name).replace(persistentVolume);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deletePersistentVolume(String persistentVolumeName) throws K8sDriverException {
        return client.persistentVolumes().withName(persistentVolumeName).delete();
    }

    @Override
    public PersistentVolume patchPersistentVolume(String persistentVolumeName, PersistentVolume persistentVolume) throws K8sDriverException {
        if (persistentVolumeName == null || persistentVolumeName.isEmpty() || persistentVolume == null) {
            return null;
        }
        logger.debug("update PersistentVolume with name=" + persistentVolumeName + ", PersistentVolume=" + persistentVolume);
        try {
            return client.persistentVolumes().withName(persistentVolumeName).patch(persistentVolume);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    // job
    // these functions contain "All" means it will ignore namespace and request in all namespace
    @Override
    public JobList listAllJob(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list job in all namespace with selector=" + selector);
        try {
            return client.extensions().jobs().inAnyNamespace().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public JobList listAllJob()
            throws K8sDriverException {
        logger.debug("list job in all namespace.");
        try {
            return client.extensions().jobs().inAnyNamespace().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public JobList listJob(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list job with selector=" + selector);
        try {
            return client.extensions().jobs().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public JobList listJob()
            throws K8sDriverException {
        logger.debug("list jobs");
        try {
            return client.extensions().jobs().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Job createJob(Job job)
            throws K8sDriverException {
        if (job == null) {
            return null;
        }
        // logger.debug("create job with job=\n" + job);
        try {
            job.setApiVersion(GlobalConstant.K8S_JOB_VERSION);
            return client.extensions().jobs().create(job);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Job getJob(String jobName)
            throws K8sDriverException {
        if (jobName == null) {
            return null;
        }
        logger.debug("get job with name=" + jobName);
        try {
            return client.extensions().jobs().withName(jobName).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Job jobInfo(String jobName)
            throws K8sDriverException {
        return getJob(jobName);
    }

    @Override
    public Job replaceJob(String jobName, Job job)
            throws K8sDriverException {
        if (jobName == null) {
            return null;
        }
        logger.debug("replace job with name=" + jobName + ", job=" + job);
        try {
            job.setApiVersion(GlobalConstant.K8S_JOB_VERSION);
            return client.extensions().jobs().withName(jobName).replace(job);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteJob(String jobName)
            throws K8sDriverException {
        if (jobName == null) {
            return true;
        }
        logger.debug("delete job with name=" + jobName);
        try {
            return client.extensions().jobs().withName(jobName).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteJob(Map<String, String> selector) throws K8sDriverException {
        try {
            return client.extensions().jobs().withLabels(selector).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Job patchJob(String jobName, Job job)
            throws K8sDriverException {
        if (jobName == null || job == null) {
            return null;
        }
        logger.debug("update job with name=" + jobName + ", job\n" + job);
        try {
            job.setApiVersion(GlobalConstant.K8S_JOB_VERSION);
            return client.extensions().jobs().withName(jobName).patch(job);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Closeable tailfLog(String podName, String containerName, int tailingLines)
            throws K8sDriverException {
        try {
            return client.pods().withName(podName)
                    .inContainer(containerName).watchLog();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    // pod log
//       public void tailfLog(String podName, String containerName, boolean printTimestamp,
//                         UnitInputStreamResponseHandler<String> handler)
//            throws  K8sDriverException {
//        logger.debug("tailf log with podName=" + podName
//                + ", containerName=" + containerName
//                + ", printTimeStamp=" + printTimestamp
//        );
//        if (podName == null) {
//            return;
//        }
//        restClient.get()
//                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getPodPath(podName) + "/log")
//                .addParameter(getPrettyParameter())
//                .addParameter("container", containerName)
//                .addParameter("timestamps", String.valueOf(printTimestamp))
//                .addParameter("follow", "true")
//                .queryWithResponseHandler(new LogInputStreamFactory(), handler);
//        // .queryWithInputStreamResponse(LogLineInputStream.class);
//    }

    // namespace
    @Override

    public NamespaceList listAllNamespace(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list all namespace with selector=" + selector);
        try {
            return client.namespaces().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public NamespaceList listAllNamespace()
            throws K8sDriverException {
        logger.debug("list all namespace .");
        try {
            return client.namespaces().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Namespace createNamespace(Namespace namespace)
            throws K8sDriverException {
        logger.debug("create namespace=" + namespace);
        if (namespace == null) {
            return null;
        }
        try {
            return client.namespaces().create(namespace);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteNamespace(String namespaceName)
            throws K8sDriverException {
        logger.debug("delete namespace " + namespaceName);
        if (namespaceName == null) {
            return true;
        }
        try {
            return client.namespaces().withName(namespaceName).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    // service
    @Override
    public ServiceList listService(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list service with selector=" + selector);
        try {
            return client.services().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public ServiceList listService()
            throws K8sDriverException {
        logger.debug("list service.");
        try {
            return client.services().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Service createService(Service service)
            throws K8sDriverException {
        logger.debug("create service=" + service);
        if (service == null) {
            return null;
        }
        try {

            return client.services().create(service);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Service serviceInfo(String serviceName)
            throws K8sDriverException {
        logger.debug("get service info of " + serviceName);
        if (serviceName == null || serviceName.isEmpty()) {
            return null;
        }
        try {
            return client.services().withName(serviceName).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Service replaceService(String serviceName, Service service)
            throws K8sDriverException {
        logger.debug("get service info of " + serviceName);
        if (serviceName == null || serviceName.isEmpty() || service == null) {
            return null;
        }
        try {
            return client.services().withName(serviceName).replace(service);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteService(String serviceName)
            throws K8sDriverException {
        logger.debug("delete service=" + serviceName);
        if (serviceName == null) {
            return false;
        }
        try {
            return client.services().withName(serviceName).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Service patchService(String serviceName, Service service)
            throws K8sDriverException {
        logger.debug("patch service=" + serviceName);
        if (serviceName == null) {
            return null;
        }
        try {
            return client.services().withName(serviceName).patch(service);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    // listAllService will list the service against the whole namespace
    @Override
    public ServiceList listAllService(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list service in all namespace with selector=" + selector);
        try {
            return client.services().inAnyNamespace().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public ServiceList listAllService()
            throws K8sDriverException {
        logger.debug("list service in all namespace.");
        try {
            return client.services().inAnyNamespace().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    // event
    // list event in all namespace
    @Override
    public EventList listAllEvent(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list event in all namespace with selector=" + selector);
        try {
            return client.events().inAnyNamespace().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public EventList listAllEvent()
            throws K8sDriverException {
        logger.debug("list event in all namespace .");
        try {
            return client.events().inAnyNamespace().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public EventList listEvent(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list event with selector=" + selector);
        try {
            return client.events().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public EventList listEvent()
            throws K8sDriverException {
        logger.debug("list event.");
        try {
            return client.events().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    // endpoints
    // listAllEndpoints will list endpoints in all namespace
    @Override
    public EndpointsList listAllEndpoints(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list endpoints in all namespace with selector=" + selector);
        try {
            return client.endpoints().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public EndpointsList listAllEndpoints()
            throws K8sDriverException {
        logger.debug("list endpoints.");
        try {
            return client.endpoints().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public EndpointsList listEndpoints(Map<String, String> selector)
            throws K8sDriverException {
        logger.debug("list endpoints with selector=" + selector);
        try {
            return client.endpoints().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public EndpointsList listEndpoints()
            throws K8sDriverException {
        logger.debug("list endpoints");
        try {
            return client.endpoints().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Endpoints endpointsInfo(String endpointName)
            throws K8sDriverException {
        logger.debug("list endpoints=" + endpointName);
        try {
            return client.endpoints().withName(endpointName).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    // secrets
//    @Override
//    public Secret createSecret(Secret secret)
//            throws  K8sDriverException {
//        logger.debug("create secret=" + secret);
//        if (secret == null) {
//            return null;
//        }
//        try {
//            return client.secrets().create(secret);
//        } catch (KubernetesClientException e) {
//            throw new K8sDriverException(e.getMessage());
//        }
//    }

    @Override
    public Secret createSecret(Secret secret)
            throws K8sDriverException {
        logger.debug("create secret=" + secret);
        if (secret == null) {
            return null;
        }
        try {
            return client.secrets().create(secret);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Secret secretInfo(String name)
            throws K8sDriverException {
        if (name == null) {
            return null;
        }
        logger.debug("secret info=" + name);
        try {
            return client.secrets().withName(name).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteSecret(String name)
            throws K8sDriverException {
        if (name == null || name.isEmpty()) {
            return true;
        }
        logger.debug("delete secret=" + name);
        try {
            return client.secrets().withName(name).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public void deleteService(Map<String, String> selector)
            throws TimeoutException, K8sDriverException {
        deleteService(selector, 400, 2000);
    }

    @Override
    public void createEndpoints(String name, List<String> addresses) throws K8sDriverException {
        if (addresses != null && !addresses.isEmpty()) {
            List<EndpointPort> endpointPorts = new ArrayList<>();
            List<EndpointAddress> endpointAddresses = new ArrayList<>(addresses.size());
            for (String address : addresses) {
                endpointAddresses.add(new EndpointAddressBuilder().withIp(address).build());
            }
            endpointPorts.add(new EndpointPortBuilder().withPort(1).build());
            Endpoints endpoints = new EndpointsBuilder().withNewMetadata().withName(name).endMetadata()
                    .withSubsets(new EndpointSubsetBuilder().withAddresses(endpointAddresses).withPorts(endpointPorts).build()).build();

            try {
                if (client.endpoints().create(endpoints) == null) {
                    throw new K8sDriverException("create endpoints failed, nothing return from k8s");
                }
            } catch (KubernetesClientException e) {
                throw new K8sDriverException(e.getMessage());
            }

        }
    }

    @Override
    public void createSecret(String name, String type, Map<String, String> secretData) throws K8sDriverException {
        Secret secret = new SecretBuilder().withType(type).withNewMetadata().withName(name).endMetadata().withData(secretData).build();
        try {
            if (client.secrets().create(secret) == null) {
                throw new K8sDriverException("create secret failed, nothing return from k8s");
            }
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    private void deleteService(Map<String, String> selector, long interBreak /* in millisecond */,
                               long timeout /* in millisecond */)
            throws TimeoutException, K8sDriverException {
        long startTimePoint = System.currentTimeMillis();
        ServiceList serviceList = listService(selector);
        while (serviceList != null && serviceList.getItems() != null
                && serviceList.getItems().size() != 0) {
            if (System.currentTimeMillis() - startTimePoint > timeout) {
                throw new TimeoutException("time out when try to delete service with selector="
                        + selector);
            }
            for (Service service : serviceList.getItems()) {
                deleteService(service.getMetadata().getName());
            }
            try {
                Thread.sleep(interBreak);
            } catch (InterruptedException e) {
                // ignore and continue
            }
            serviceList = listService(selector);
        }
    }

    @Override
    public void clearNotRunningPodAndWait(Map<String, String> selector, long interBreak, long timeout)
            throws TimeoutException, K8sDriverException {
        PodList podList = listPod(selector);
        long startTimePoint = System.currentTimeMillis();
        while (podList != null) {
            if (System.currentTimeMillis() - startTimePoint > timeout) {
                throw new TimeoutException("try to delete not running pod failed");
            }
            clearNotRunningPod(podList);
            // ** wait
            try {
                Thread.sleep(interBreak);
            } catch (InterruptedException e) {
                // ignore and continue
            }
            podList = listPod(selector);
        }
    }

    @Override
    public void clearNotRunningPod(PodList podList)
            throws K8sDriverException {
        if (podList == null || podList.getItems() == null || podList.getItems().size() == 0) {
            return;
        }
        for (Pod pod : podList.getItems()) {
            String status = PodUtils.getPodStatus(pod);
            if (!StringUtils.isBlank(status) && ("Terminating".equals(status) || "Succeeded".equals(status) || "Failed".equals(status))) {
                // do clear
                deletePod(pod.getMetadata().getName());
            }
        }
    }

//    public boolean deleteSecret(String name)
//            throws  K8sDriverException {
//        if (name == null || name.isEmpty()) {
//            return true;
//        }
//        logger.debug("delete secret=" + name);
//        DeleteOptions deleteOptions = new DeleteOptions();
//        deleteOptions.setGracePeriodSeconds(0);
//        return deleteSecret(name, deleteOptions);
//    }
    @Override
    public IngressList listAllIngress(Map<String, String> selector) throws K8sDriverException {
        logger.debug("list ingress in all namespace with selector=" + selector);
        try {
            return client.extensions().ingresses().inAnyNamespace().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public IngressList listAllIngress() throws K8sDriverException {
        logger.debug("list ingress in all namespace.");
        try {
            return client.extensions().ingresses().inAnyNamespace().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public IngressList listIngress(Map<String, String> selector) throws K8sDriverException {
        logger.debug("list ingress with selector=" + selector);
        try {
            return client.extensions().ingresses().withLabels(selector).list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public IngressList listIngress() throws K8sDriverException {
        logger.debug("list ingress");
        try {
            return client.extensions().ingresses().list();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Ingress createIngress(Ingress ingress) throws K8sDriverException {
        if (ingress == null) {
            return null;
        }
        logger.debug("create ingress with specify=" + ingress);
        try {
            return client.extensions().ingresses().create(ingress);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Ingress ingressInfo(String ingressName) throws K8sDriverException {
        if (ingressName == null) {
            return null;
        }
        logger.debug("get ingress with name=" + ingressName);
        try {
            return client.extensions().ingresses().withName(ingressName).get();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Ingress replaceIngress(String ingressName, Ingress ingress) throws K8sDriverException {
        if (ingressName == null || ingress == null) {
            return null;
        }
        logger.debug("replace Ingress with name=" + ingressName + ", Ingress=\n" + ingress);
        try {
            return client.extensions().ingresses().withName(ingressName).replace(ingress);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteIngress(String ingressName) throws K8sDriverException {
        if (ingressName == null) {
            return true;
        }
        logger.debug("delete ingress with name=" + ingressName);
        try {
            return client.extensions().ingresses().withName(ingressName).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public boolean deleteIngress(Map<String, String> selector) throws K8sDriverException {
        try {
            return client.extensions().ingresses().withLabels(selector).delete();
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

    @Override
    public Ingress patchIngress(String ingressName, Ingress ingress) throws K8sDriverException {
        if (ingressName == null || ingress == null) {
            return null;
        }
        logger.debug("update ingress with name=" + ingressName + ", Ingress\n" + ingress);
        try {
            return client.extensions().ingresses().withName(ingressName).patch(ingress);
        } catch (KubernetesClientException e) {
            throw new K8sDriverException(e.getMessage());
        }
    }

}