package org.domeos.framework.engine.k8s.util;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.api.model.extensions.*;
import org.domeos.exception.K8sDriverException;
import org.domeos.exception.TimeoutException;

import java.io.Closeable;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by KaiRen on 16/8/24.
 */
public interface KubeUtils<T> {

    ConcurrentHashMap<String, KubeUtils> KUBEUTILSMAP = new ConcurrentHashMap<>();

    T getClient();

    void setClient(T t);

    String info();

    String serverAddress();

    String namespace();

    void deleteKubeUtils(org.domeos.framework.api.model.cluster.Cluster cluster) throws K8sDriverException;

    NodeList listNode(Map<String, String> labelSelector) throws K8sDriverException;

    NodeList listNode() throws K8sDriverException;

    Node nodeInfo(String nodeName) throws K8sDriverException;

    Node labelNode(String nodeName, Map<String, String> labels) throws K8sDriverException;

    List<Node> labelNode(List<String> nodeName, Map<String, String> labels)
            throws K8sDriverException;

    Node deleteNodeLabel(String nodeName, List<String> labels)
            throws K8sDriverException;

    Node annotateNode(String nodeName, Map<String, String> annotations)
            throws K8sDriverException;

    Node deleteNodeAnnotation(String nodeName, List<String> annotations)
            throws K8sDriverException;

    // for pod
    PodList listPod(Map<String, String> selectors)
            throws K8sDriverException;

    PodList listPod()
            throws K8sDriverException;

    PodList listAllPod(Map<String, String> selector)
            throws K8sDriverException;

    PodList listAllPod()
            throws K8sDriverException;

    Pod createPod(Pod pod)
            throws K8sDriverException;

    Pod podInfo(String name)
            throws K8sDriverException;

    Pod replacePod(String name, Pod pod)
            throws K8sDriverException;


    boolean deletePod(String name)
            throws K8sDriverException;

    Pod patchPod(String name, Pod pod)
            throws K8sDriverException;

    // for replication controller
    ReplicationControllerList listReplicationController(Map<String, String> selector)
            throws K8sDriverException;

    ReplicationControllerList listReplicationController()
            throws K8sDriverException;

    // these functions contain "All" will ignore namespace and list all rc
    ReplicationControllerList listAllReplicationController(Map<String, String> selector)
            throws K8sDriverException;

    ReplicationControllerList listAllReplicationController()
            throws K8sDriverException;

    ReplicationController createReplicationController(ReplicationController rc)
            throws K8sDriverException;

    ReplicationController replicationControllerInfo(String name)
            throws K8sDriverException;

    ReplicationController replaceReplicationController(String name, ReplicationController rc)
            throws K8sDriverException;

    ReplicationController scaleReplicationController(String name, int replicas)
            throws K8sDriverException;

    boolean deleteReplicationController(String rcName, boolean checkExist)
            throws K8sDriverException;

    boolean deleteReplicationControllerWithoutCascading(String rcName)
            throws K8sDriverException;

    ReplicationController patchReplicationController(String name, ReplicationController rc)
            throws K8sDriverException;

    //the deployment option
    DeploymentList listDeployment(Map<String, String> selector)
            throws K8sDriverException;

    DeploymentList listDeployment()
            throws K8sDriverException;

    DeploymentList listAllDeployment(Map<String, String> selector)
            throws K8sDriverException;

    DeploymentList listAllDeployment()
            throws K8sDriverException;

    Deployment createDeployment(Deployment deployment)
            throws K8sDriverException;

    Deployment deploymentInfo(String name)
            throws K8sDriverException;

    Deployment replaceDeployment(String name, Deployment deployment)
            throws K8sDriverException;

    boolean deleteDeployment(String deploymentName, boolean checkExist)
            throws K8sDriverException;

    Deployment patchDeployment(String deploymentName, Deployment deployment)
            throws K8sDriverException;

    Deployment scaleDeployment(String name, int replicas)
            throws K8sDriverException;

    void pauseDeployment(String name)
            throws K8sDriverException;

    void resumeDeployment(String name)
            throws K8sDriverException;

    //Daemon Set related

    DaemonSetList listDaemonSet(Map<String, String> selector)
            throws K8sDriverException;

    DaemonSetList listDaemonSet()
            throws K8sDriverException;

    DaemonSetList listAllDaemonSet(Map<String, String> selector)
            throws K8sDriverException;

    DaemonSetList listAllDaemonSet()
            throws K8sDriverException;

    DaemonSet createDaemonSet(DaemonSet daemonSet)
            throws K8sDriverException;

    DaemonSet daemonSetInfo(String name)
            throws K8sDriverException;

    DaemonSet replaceDaemonSet(String name, DaemonSet daemonSet)
            throws K8sDriverException;

    boolean deleteDaemonSet(String daemonSetName, boolean checkExist)
            throws K8sDriverException;

    DaemonSet patchDaemonSet(String daemonSetName, DaemonSet daemonSet)
            throws K8sDriverException;
    // PV

    PersistentVolumeList listAllPersistentVolume(Map<String, String> selector)
            throws K8sDriverException;

    PersistentVolumeList listAllPersistentVolume()
            throws K8sDriverException;

    PersistentVolume createPersistentVolume(PersistentVolume persistentVolume)
            throws K8sDriverException;

    PersistentVolume persistentVolumeInfo(String name)
            throws K8sDriverException;

    PersistentVolume replacePersistentVolume(String name, PersistentVolume persistentVolume)
            throws K8sDriverException;

    boolean deletePersistentVolume(String persistentVolume)
            throws K8sDriverException;

    PersistentVolume patchPersistentVolume(String persistentVolumeName, PersistentVolume persistentVolume)
            throws K8sDriverException;

    // job
    // these functions contain "All" means it will ignore namespace and request in all namespace
    JobList listAllJob(Map<String, String> selector)
            throws K8sDriverException;

    JobList listAllJob()
            throws K8sDriverException;

    JobList listJob(Map<String, String> selector)
            throws K8sDriverException;

    JobList listJob()
            throws K8sDriverException;

    Job createJob(Job job)
            throws K8sDriverException;

    Job getJob(String jobName)
            throws K8sDriverException;

    Job jobInfo(String jobName)
            throws K8sDriverException;

    Job replaceJob(String jobName, Job job)
            throws K8sDriverException;

    boolean deleteJob(String jobName)
            throws K8sDriverException;

    boolean deleteJob(Map<String, String> selector)
            throws K8sDriverException;

    Job patchJob(String jobName, Job job)
            throws K8sDriverException;

    Closeable tailfLog(String podName, String containerName, int tailingLines)
            throws K8sDriverException;

    // namespace
    NamespaceList listAllNamespace(Map<String, String> selector)
            throws K8sDriverException;

    NamespaceList listAllNamespace()
            throws K8sDriverException;

    Namespace createNamespace(Namespace namespace)
            throws K8sDriverException;

//    boolean deleteNamespace(String namespaceName, DeleteOptions options)
//            throws K8sDriverException;

    boolean deleteNamespace(String namespaceName)
            throws K8sDriverException;

    // service
    ServiceList listService(Map<String, String> selector)
            throws K8sDriverException;

    ServiceList listService()
            throws K8sDriverException;

    Service createService(Service service)
            throws K8sDriverException;

    Service serviceInfo(String serviceName)
            throws K8sDriverException;

    Service replaceService(String serviceName, Service service)
            throws K8sDriverException;

    boolean deleteService(String serviceName)
            throws K8sDriverException;

    Service patchService(String serviceName, Service service)
            throws K8sDriverException;

    // listAllService will list the service against the whole namespace
    ServiceList listAllService(Map<String, String> selector)
            throws K8sDriverException;

    ServiceList listAllService()
            throws K8sDriverException;

    // event
    // list event in all namespace
    EventList listAllEvent(Map<String, String> selector)
            throws K8sDriverException;

    EventList listAllEvent()
            throws K8sDriverException;

    EventList listEvent(Map<String, String> selector)
            throws K8sDriverException;

    EventList listEvent()
            throws K8sDriverException;

    // endpoints
    // listAllEndpoints will list endpoints in all namespace
    EndpointsList listAllEndpoints(Map<String, String> selector)
            throws K8sDriverException;

    EndpointsList listAllEndpoints()
            throws K8sDriverException;

    EndpointsList listEndpoints(Map<String, String> selector)
            throws K8sDriverException;

    EndpointsList listEndpoints()
            throws K8sDriverException;

    Endpoints endpointsInfo(String endpointName)
            throws K8sDriverException;

//    // secrets
//    Secret createSecret(Secret secret) throws K8sDriverException;

    // secrets
    Secret createSecret(Secret secret)
            throws K8sDriverException;

    Secret secretInfo(String name)
            throws K8sDriverException;

//    boolean deleteSecret(String name, DeleteOptions deleteOptions)
//            throws K8sDriverException;

    boolean deleteSecret(String name)
            throws K8sDriverException;


    //these are from KubernetesUtil
    void clearNotRunningPod(PodList podList)
            throws K8sDriverException;

    void clearNotRunningPodAndWait(Map<String, String> selector, long interBreak, long timeout)
            throws TimeoutException, K8sDriverException;

    void deleteService(Map<String, String> selector)
            throws TimeoutException, K8sDriverException;


    void createEndpoints(String name, List<String> addresses)
            throws K8sDriverException;

    void createSecret(String name, String type, Map<String, String> secretData)
            throws K8sDriverException;

    PersistentVolumeClaim createPersistentVolumeClaim(PersistentVolumeClaim persistentVolumeClaim)
            throws K8sDriverException;

    PersistentVolumeClaim persistentVolumeClaimInfo(String name) throws K8sDriverException;

    void deletePersistentVolumeClaim(String name) throws K8sDriverException;

    void deleteEndpoints(String name) throws K8sDriverException;
    
    ConfigMap createConfigmap(ConfigMap configMap) throws K8sDriverException;

    void deleteConfigmap(Map<String, String> stringStringMap) throws K8sDriverException;

    void patchConfigmap(ConfigMap configMap) throws K8sDriverException;
    
    // Ingress
    // these functions contain "All" means it will ignore namespace and request in all namespace
    IngressList listAllIngress(Map<String, String> selector) throws K8sDriverException;

    IngressList listAllIngress() throws K8sDriverException;

    IngressList listIngress(Map<String, String> selector) throws K8sDriverException;

    IngressList listIngress() throws K8sDriverException;

    Ingress createIngress(Ingress ingress) throws K8sDriverException;

    Ingress ingressInfo(String ingressName) throws K8sDriverException;

    Ingress replaceIngress(String ingressName, Ingress ingress) throws K8sDriverException;

    boolean deleteIngress(String ingressName) throws K8sDriverException;

    boolean deleteIngress(Map<String, String> selector) throws K8sDriverException;

    Ingress patchIngress(String ingressName, Ingress ingress) throws K8sDriverException;
}