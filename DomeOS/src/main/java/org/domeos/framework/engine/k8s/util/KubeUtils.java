package org.domeos.framework.engine.k8s.util;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.api.model.extensions.Job;
import io.fabric8.kubernetes.api.model.extensions.JobList;
import org.domeos.exception.K8sDriverException;
import org.domeos.exception.TimeoutException;

import java.io.Closeable;
import java.io.IOException;
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

    void deleteKubeUtils(org.domeos.framework.api.model.cluster.Cluster cluster) throws K8sDriverException;

    NodeList listNode(Map<String, String> labelSelector) throws IOException, K8sDriverException;

    NodeList listNode() throws IOException, K8sDriverException;

    Node nodeInfo(String nodeName) throws IOException, K8sDriverException;

    Node labelNode(String nodeName, Map<String, String> labels) throws IOException, K8sDriverException;

    List<Node> labelNode(List<String> nodeName, Map<String, String> labels)
            throws IOException, K8sDriverException;

    Node deleteNodeLabel(String nodeName, List<String> labels)
            throws IOException, K8sDriverException;

    Node annotateNode(String nodeName, Map<String, String> annotations)
            throws IOException, K8sDriverException;

    Node deleteNodeAnnotation(String nodeName, List<String> annotations)
            throws IOException, K8sDriverException;

    // for pod
    PodList listPod(Map<String, String> selectors)
            throws IOException, K8sDriverException;

    PodList listPod()
            throws IOException, K8sDriverException;

    PodList listAllPod(Map<String, String> selector)
            throws IOException, K8sDriverException;

    PodList listAllPod()
            throws IOException, K8sDriverException;

    Pod createPod(Pod pod)
            throws IOException, K8sDriverException;

    Pod podInfo(String name)
            throws IOException, K8sDriverException;

    Pod replacePod(String name, Pod pod)
            throws IOException, K8sDriverException;


    boolean deletePod(String name)
            throws IOException, K8sDriverException;

    Pod patchPod(String name, Pod pod)
            throws IOException, K8sDriverException;

    // for replication controller
    ReplicationControllerList listReplicationController(Map<String, String> selector)
            throws IOException, K8sDriverException;

    ReplicationControllerList listReplicationController()
            throws IOException, K8sDriverException;

    // these functions contain "All" will ignore namespace and list all rc
    ReplicationControllerList listAllReplicationController(Map<String, String> selector)
            throws IOException, K8sDriverException;

    ReplicationControllerList listAllReplicationController()
            throws IOException, K8sDriverException;

    ReplicationController createReplicationController(ReplicationController rc)
            throws IOException, K8sDriverException;

    ReplicationController replicationControllerInfo(String name)
            throws IOException, K8sDriverException;

    ReplicationController replaceReplicationController(String name, ReplicationController rc)
            throws IOException, K8sDriverException;

    ReplicationController scaleReplicationController(String name, int replicas)
            throws IOException, K8sDriverException;

    boolean deleteReplicationController(String rcName)
            throws IOException, K8sDriverException;

    ReplicationController patchReplicationController(ReplicationController rc)
            throws IOException, K8sDriverException;

    // job
    // these functions contain "All" means it will ignore namespace and request in all namespace
    JobList listAllJob(Map<String, String> selector)
            throws IOException, K8sDriverException;

    JobList listAllJob()
            throws IOException, K8sDriverException;

    JobList listJob(Map<String, String> selector)
            throws IOException, K8sDriverException;

    JobList listJob()
            throws IOException, K8sDriverException;

    Job createJob(Job job)
            throws IOException, K8sDriverException;

    Job getJob(String jobName)
            throws IOException, K8sDriverException;

    Job jobInfo(String jobName)
            throws IOException, K8sDriverException;

    Job replaceJob(String jobName, Job job)
            throws IOException, K8sDriverException;

    boolean deleteJob(String jobName)
            throws IOException, K8sDriverException;

    Job patchJob(String jobName, Job job)
            throws IOException, K8sDriverException;

    Closeable tailfLog(String podName, String containerName, int tailingLines)
        throws IOException, K8sDriverException;
    // pod log
//    void tailfLog(String podName, String containerName, boolean printTimestamp,
//                  UnitInputStreamResponseHandler<String> handler)
//            throws  IOException, K8sDriverException {
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
    NamespaceList listAllNamespace(Map<String, String> selector)
            throws IOException, K8sDriverException;

    NamespaceList listAllNamespace()
            throws IOException, K8sDriverException;

    Namespace createNamespace(Namespace namespace)
            throws IOException, K8sDriverException;

//    boolean deleteNamespace(String namespaceName, DeleteOptions options)
//            throws IOException, K8sDriverException;

    boolean deleteNamespace(String namespaceName)
            throws IOException, K8sDriverException;

    // service
    ServiceList listService(Map<String, String> selector)
            throws IOException, K8sDriverException;

    ServiceList listService()
            throws IOException, K8sDriverException;

    Service createService(Service service)
            throws IOException, K8sDriverException;

    Service serviceInfo(String serviceName)
            throws IOException, K8sDriverException;

    Service replaceService(String serviceName, Service service)
            throws IOException, K8sDriverException;

    boolean deleteService(String serviceName)
            throws IOException, K8sDriverException;

    Service patchService(String serviceName, Service service)
            throws IOException, K8sDriverException;

    // listAllService will list the service against the whole namespace
    ServiceList listAllService(Map<String, String> selector)
            throws IOException, K8sDriverException;

    ServiceList listAllService()
            throws IOException, K8sDriverException;

    // event
    // list event in all namespace
    EventList listAllEvent(Map<String, String> selector)
            throws IOException, K8sDriverException;

    EventList listAllEvent()
            throws IOException, K8sDriverException;

    EventList listEvent(Map<String, String> selector)
            throws IOException, K8sDriverException;

    EventList listEvent()
            throws IOException, K8sDriverException;

    // endpoints
    // listAllEndpoints will list endpoints in all namespace
    EndpointsList listAllEndpoints(Map<String, String> selector)
            throws IOException, K8sDriverException;

    EndpointsList listAllEndpoints()
            throws IOException, K8sDriverException;

    EndpointsList listEndpoints(Map<String, String> selector)
            throws IOException, K8sDriverException;

    EndpointsList listEndpoints()
            throws IOException, K8sDriverException;

    Endpoints endpointsInfo(String endpointName)
            throws IOException, K8sDriverException;

    // secrets
    Secret createSecret(Secret secret)
            throws IOException, K8sDriverException;

    Secret secretInfo(String name)
            throws IOException, K8sDriverException;

//    boolean deleteSecret(String name, DeleteOptions deleteOptions)
//            throws IOException, K8sDriverException;

    boolean deleteSecret(String name)
            throws IOException, K8sDriverException;


//these are from KubernetesUtil
    void clearNotRunningPod(PodList podList)
        throws IOException, K8sDriverException;
    void clearNotRunningPodAndWait(Map<String, String> selector, long interBreak, long timeout)
            throws IOException, TimeoutException, K8sDriverException;
    void deleteService(Map<String, String> selector)
            throws TimeoutException, IOException, K8sDriverException;



}
