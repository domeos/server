package org.domeos.client.kubernetesclient;

import org.apache.http.Header;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicHeader;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;
import org.domeos.client.kubernetesclient.definitions.unversioned.Status;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobList;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.responsehandler.UnitInputStreamResponseHandler;
import org.domeos.client.kubernetesclient.restclient.KubeRESTClient;
import org.domeos.client.kubernetesclient.unitstream.factory.EventInputStreamFactory;
import org.domeos.client.kubernetesclient.unitstream.factory.LogInputStreamFactory;
import org.domeos.client.kubernetesclient.unitstream.factory.PodInputStreamFactory;

import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import static org.domeos.client.kubernetesclient.KubeAPIVersion.v1;
import static org.domeos.client.kubernetesclient.KubeAPIVersion.v1beta1;

/**
 * Created by anningluo on 15-11-26.
 */
public class KubeClient {
    // restClient
    private KubeRESTClient restClient;
    private KubeClientContext context;
    private static Logger logger = Logger.getLogger(KubeClient.class);

    public KubeClient(String apiServer) {
        // int sep = apiServer.indexOf(':');
        // apiServerHost = apiServer.substring(0, sep);
        // apiServerPort = Integer.parseInt(apiServer.substring(sep + 1));
        restClient = new KubeRESTClient(apiServer);
        context = new KubeClientContext();
    }

    public KubeClient(String apiServer, KubeClientContext context) {
        restClient = new KubeRESTClient(apiServer);
        this.context = context;
    }

    public KubeClient(String apiServer, String namespace) {
        restClient = new KubeRESTClient(apiServer);
        context = new KubeClientContext();
        context.setNamespace(namespace);
    }

    public String getPathPrefix() {
        return "/api/" + context.getVersion().name();
    }

    public String getPathPrefix(KubeAPIVersion minVersion) {
        switch (minVersion) {
            case v1:
                return "/api/" + minVersion.name();
            case v1beta1:
                return "/apis/extensions/" + minVersion.name();
            default:
                return "/api";
        }
    }

    public NodeList listNode(Map<String, String> labelSelector) throws IOException, KubeResponseException, KubeInternalErrorException {
        logger.debug("list node with selector=" + labelSelector);
         return restClient.get()
                .path(getPathPrefix(v1) + "/nodes")
                .addParameter("pretty", Boolean.toString(context.isPretty()).toLowerCase())
                 .addParameter("labelSelector", formatSelector(labelSelector))
                .query(NodeList.class);
    }

    public NodeList listNode() throws IOException, KubeResponseException, KubeInternalErrorException {
        return listNode(null);
    }

    public Node nodeInfo(String nodeName) throws IOException, KubeResponseException, KubeInternalErrorException {
        logger.debug("get node info with nodeName=" + nodeName);
        return restClient.get()
                .path(getPathPrefix(v1) + "/nodes/" + nodeName)
                .addParameter(getPrettyParameter())
                .query(Node.class);
    }

    public Node labelNode(String nodeName, Map<String, String> labels) throws IOException, KubeResponseException, KubeInternalErrorException {
        logger.debug("label node with nodeName=" + nodeName + ", labels=" + labels);
        Node node = new Node();
        ObjectMeta objectMeta = new ObjectMeta();
        objectMeta.setLabels(labels);
        node.setMetadata(objectMeta);
        return restClient.patch()
                .path(getPathPrefix(v1) + "/nodes/" + nodeName)
                .addParameter(getPrettyParameter())
                .addHeader(getPatchJsonHeader())
                .body(node)
                .query(Node.class);
    }
    public List<Node> labelNode(List<String> nodeName, Map<String, String> labels)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        List<Node> nodeList = new LinkedList<Node>();
        for (String name : nodeName) {
            nodeList.add(labelNode(name, labels));
        }
        return nodeList;
    }
    public Node deleteNodeLabel(String nodeName, List<String> labels)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("delete label of node=" + nodeName + ". delete list is " + labels);
        Node node = nodeInfo(nodeName);
        for (String label : labels) {
            node.getMetadata().getLabels().remove(label);
        }
        return restClient.put()
                .path(getPathPrefix(v1) + "/nodes/" + nodeName)
                .addParameter(getPrettyParameter())
                .body(node)
                .query(Node.class);
    }
    public Node annotateNode(String nodeName, Map<String, String> annotations)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        logger.debug("annotate node with nodeName=" + nodeName + ", annotation=" + annotations);
        Node node = new Node();
        ObjectMeta objectMeta = new ObjectMeta();
        objectMeta.setAnnotations(annotations);
        node.setMetadata(objectMeta);
        return restClient.patch()
                .path(getPathPrefix(v1) + "/nodes/" + nodeName)
                .addParameter(getPrettyParameter())
                .addHeader(getPatchJsonHeader())
                .body(node)
                .query(Node.class);
    }
    public Node deleteNodeAnnotation(String nodeName, List<String> annotations)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("delete annotation of node=" + nodeName + ". delete list is " + annotations);
        Node node = nodeInfo(nodeName);
        for (String annotation : annotations) {
            node.getMetadata().getAnnotations().remove(annotation);
        }
        return restClient.put()
                .path(getPathPrefix(v1) + "/nodes/" + nodeName)
                .addParameter(getPrettyParameter())
                .body(node)
                .query(Node.class);
    }

    // for pod
    public PodList listPod(Map<String, String> selectors)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list pod with selectors=" + selectors);
        return restClient.get()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/pods")
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selectors))
                .query(PodList.class);
    }
    public PodList listPod()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listPod(null);
    }
    public PodList listAllPod(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list pod in all namespace, with selectors=" + selector);
        return restClient.get()
                .path(getPathPrefix(v1) + "/pods")
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selector))
                .query(PodList.class);
    }
    public PodList listAllPod()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listAllPod(null);
    }
    public Pod createPod(Pod pod)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        logger.debug("create pod with specify=" + pod.toString());
        return restClient.post()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/pods")
                .addParameter(getPrettyParameter())
                .body(pod)
                .query(Pod.class);
    }
    public Pod podInfo(String name)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        if (name == null) {
            return null;
        }
        logger.debug("create pod=" + name);
        return restClient.get()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/pods/" + name)
                .addParameter(getPrettyParameter())
                .query(Pod.class);
    }
    public Pod replacePod(String name, Pod pod)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (pod == null || name == null) {
            return null;
        }
        logger.debug("replace pod with name=" + name + "pod =\n" + pod);
        return restClient.put()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/pods/" + name)
                .addParameter(getPrettyParameter())
                .body(pod)
                .query(Pod.class);
    }
    public boolean deletePod(String name, DeleteOptions deleteOptions)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (name == null || name.isEmpty()) {
            return true;
        }
        logger.debug("delete pod=" + name);
        Pod pod =  restClient.delete()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getPodPath(name))
                .addParameter(getPrettyParameter())
                .body(deleteOptions)
                .query(Pod.class);
        return true;
    }
    public boolean deletePod(String name)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        if (name == null || name.isEmpty()) {
            return true;
        }
        logger.debug("delete pod=" + name);
        DeleteOptions deleteOptions = new DeleteOptions();
        deleteOptions.setGracePeriodSeconds(0);
        return deletePod(name, deleteOptions);
        /*
        Pod pod =  restClient.delete()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getPodPath(name))
                .addParameter(getPrettyParameter())
                .query(Pod.class);
        return true;
        */
    }
    public Pod patchPod(String name, Pod pod)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (name == null || pod == null) {
            return null;
        }
        logger.debug("update pod with name=" + name + "pod=\n" + pod);
        return restClient.patch()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getPodPath(name))
                .addParameter(getPrettyParameter())
                .addHeader(getPatchJsonHeader())
                .body(pod)
                .query(Pod.class);
    }
    public void watchPod(String resourceVersion, Map<String, String> selectors,
                         UnitInputStreamResponseHandler<Pod> handler)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("watch pod with selectors=" + selectors);
        restClient.get()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/pods")
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selectors))
                .addParameter("resourceVersion", resourceVersion)
                .addParameter("watch", "true")
                .queryWithResponseHandler(new PodInputStreamFactory(), handler);
    }
    public void watchPod(PodList podList, Map<String, String> selectors,
                         UnitInputStreamResponseHandler<Pod> handler)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        watchPod(podList.getMetadata().getResourceVersion(), selectors, handler);
    }
    public void watchPod(String resourceVersion,
                         UnitInputStreamResponseHandler<Pod> handler)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        watchPod(resourceVersion, null, handler);
    }
    public void watchPod(PodList podList, UnitInputStreamResponseHandler<Pod> handler)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        watchPod(podList.getMetadata().getResourceVersion(), handler);
    }

    public void watchEvent(String resourceVersioin, UnitInputStreamResponseHandler<Event> handler)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        restClient.get()
                .path(getPathPrefix(v1) + "/events")
                .addParameter(getPrettyParameter())
                .addParameter("watch", "true")
                .addParameter("resourceVersion", resourceVersioin)
                .queryWithResponseHandler(new EventInputStreamFactory(), handler);
    }

    // for replication controller
    public ReplicationControllerList listReplicationController(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list replication controller with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getRCPath())
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selector))
                .query(ReplicationControllerList.class);
    }
    public ReplicationControllerList listReplicationController()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listReplicationController(null);
    }
    // these functions contain "All" will ignore namespace and list all rc
    public ReplicationControllerList listAllReplicationController(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list all replication controller");
        return restClient.get()
                .path(getPathPrefix(v1) + "/replicationcontrollers")
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selector))
                .query(ReplicationControllerList.class);
    }
    public ReplicationControllerList listAllReplicationController()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listAllReplicationController(null);
    }
    public ReplicationController createReplicationController(ReplicationController rc)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (rc == null) {
            return null;
        }
        logger.debug("create replication controller with rc=\n" + rc);
        return restClient.post()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getRCPath())
                .addParameter(getPrettyParameter())
                .body(rc)
                .query(ReplicationController.class);

    }
    public ReplicationController replicationControllerInfo(String name)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        if (name == null) {
            return null;
        }
        logger.debug("read replication controller with name=" + name);
        return restClient.get()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getRCPath(name))
                .addParameter(getPrettyParameter())
                .query(ReplicationController.class);
    }
    public ReplicationController replaceReplicationController(String name, ReplicationController rc)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (name == null || rc == null) {
            return null;
        }
        logger.debug("replace replication controller with name=" + name + ", replication controller=\n" + rc);
        return restClient.put()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getRCPath(name))
                .addParameter(getPrettyParameter())
                .body(rc)
                .query(ReplicationController.class);
    }
    public boolean deleteReplicationController(String name, DeleteOptions deleteOptions)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (name == null || name.isEmpty()) {
            return true;
        }
        if (deleteOptions == null) {
            deleteOptions = new DeleteOptions();
            deleteOptions.setGracePeriodSeconds(0);
        }
        logger.debug("delete replication controller with name=" + name + ", deleteOption=\n" + deleteOptions);
        Status status = restClient.delete()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getRCPath(name))
                .addParameter(getPrettyParameter())
                .body(deleteOptions)
                .query(Status.class);
        if (status == null || status.getCode() == 200 || status.getCode() == 404) {
            return true;
        }
        return false;
    }
    public boolean deleteReplicationController(String rcName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return deleteReplicationController(rcName, null);
    }
    public ReplicationController patchReplicationController(String rcName, ReplicationController rc)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (rcName == null || rcName.isEmpty() || rc == null) {
            return null;
        }
        logger.debug("update replication controller with name=" + rcName + ", rc=" + rc);
        return restClient.patch()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getRCPath(rcName))
                .addParameter(getPrettyParameter())
                .addHeader(getPatchJsonHeader())
                .body(rc)
                .query(ReplicationController.class);
    }

    // job
    // these functions contain "All" means it will ignore namespace and request in all namespace
    public JobList listAllJob(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list job in all namespace with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(v1beta1) + "/" + getJobPath())
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selector))
                .query(JobList.class);
    }
    public JobList listAllJob()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listAllJob(null);
    }
    public JobList listJob(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list job with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(v1beta1) + "/" + getNameSpacePath() + "/" + getJobPath())
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selector))
                .query(JobList.class);
    }
    public JobList listJob()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listJob(null);
    }
    public Job createJob(Job job)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (job == null) {
            return null;
        }
        // logger.debug("create job with job=\n" + job);
        return restClient.post()
                .path(getPathPrefix(v1beta1) + "/" + getNameSpacePath() + "/" + getJobPath())
                .addParameter(getPrettyParameter())
                .body(job)
                .query(Job.class);
    }
    public Job getJob(String jobName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        if (jobName == null) {
            return null;
        }
        logger.debug("get job with name=" + jobName);
        return restClient.get()
                .path(getPathPrefix(v1beta1) + "/" + getNameSpacePath() + "/" + getJobPath(jobName))
                .addParameter(getPrettyParameter())
                .query(Job.class);
    }
    public Job jobInfo(String jobName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return getJob(jobName);
    }
    public Job replaceJob(String jobName, Job job)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (jobName == null) {
            return null;
        }
        logger.debug("replace job with name=" + jobName + ", job=" + job);
        return restClient.put()
                .path(getPathPrefix(v1beta1) + "/" + getNameSpacePath() + "/" + getJobPath(jobName))
                .addParameter(getPrettyParameter())
                .body(job)
                .query(Job.class);
    }
    public boolean deleteJob(String jobName, DeleteOptions options)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (jobName == null) {
            return true;
        }
        logger.debug("delete job with name=" + jobName + ", options=" + options);
        Status status =  restClient.delete()
                .path(getPathPrefix(v1beta1) + "/" + getNameSpacePath() + "/" + getJobPath(jobName))
                .addParameter(getPrettyParameter())
                .body(options)
                .query(Status.class);
        if (status == null || status.getCode() == 200 || status.getCode() == 404) {
            return true;
        }
        return false;
    }
    public boolean deleteJob(String jobName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        DeleteOptions options = new DeleteOptions();
        options.setGracePeriodSeconds(0);
        return deleteJob(jobName, options);
    }
    public Job patchJob(String jobName, Job job)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        if (jobName == null || job == null) {
            return null;
        }
        logger.debug("update job with name=" + jobName + ", job\n" + job);
        return restClient.patch()
                .path(getPathPrefix(v1beta1) + "/" + getNameSpacePath() + "/" + getJobPath(jobName))
                .addParameter(getPrettyParameter())
                .addHeader(getPatchJsonHeader())
                .body(job)
                .query(Job.class);
    }

    // pod log
    public void tailfLog(String podName, String containerName, boolean printTimestamp,
                         UnitInputStreamResponseHandler<String> handler)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("tailf log with podName=" + podName
                + ", containerName=" + containerName
                + ", printTimeStamp=" + printTimestamp
        );
        if (podName == null) {
            return;
        }
        restClient.get()
                .path(getPathPrefix(v1) + "/" + getNameSpacePath() + "/" + getPodPath(podName) + "/log")
                .addParameter(getPrettyParameter())
                .addParameter("container", containerName)
                .addParameter("timestamps", String.valueOf(printTimestamp))
                .addParameter("follow", "true")
                .queryWithResponseHandler(new LogInputStreamFactory(), handler);
                // .queryWithInputStreamResponse(LogLineInputStream.class);
    }

    // namespace
    public NamespaceList listAllNamespace(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list all namespace with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(v1) + "/" + getBasicNamespacePath())
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selector))
                .query(NamespaceList.class);
    }
    public NamespaceList listAllNamespace()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listAllNamespace(null);
    }
    public Namespace createNamespace(Namespace namespace)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("create namespace=" + namespace);
        if (namespace == null) {
            return null;
        }
        return restClient.post()
                .path(getPathPrefix(v1) + "/" + getBasicNamespacePath())
                .addParameter(getPrettyParameter())
                .body(namespace)
                .query(Namespace.class);
    }
    public boolean deleteNamespace(String namespaceName, DeleteOptions options)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("delete namespace " + namespaceName);
        if (namespaceName == null) {
            return true;
        }
        Status status = restClient.delete()
                .path(getPathPrefix(v1) + "/" + getBasicNamespacePath(namespaceName))
                .addParameter(getPrettyParameter())
                .query(Status.class);
        if (status == null || status.getCode() / 100 == 2 || status.getCode() == 404) {
            return true;
        }
        return false;
    }
    public boolean deleteNamespace(String namespaceName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        DeleteOptions options = new DeleteOptions();
        options.setGracePeriodSeconds(0);
        return deleteNamespace(namespaceName, options);
    }

    // service
    public ServiceList listService(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list service with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getNameSpacePath() + "/services")
                .addParameter(getPrettyParameter())
                .addParameter("labelSelector", formatSelector(selector))
                .query(ServiceList.class);
    }
    public ServiceList listService()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listService(null);
    }
    public Service createService(Service service)
            throws KubeInternalErrorException, IOException, KubeResponseException {
        logger.debug("create service=" + service);
        if (service == null) {
            return null;
        }
        return restClient.post()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getNameSpacePath() + "/services")
                .addParameter(getPrettyParameter())
                .body(service)
                .query(Service.class);
    }
    public Service serviceInfo(String serviceName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("get service info of " + serviceName);
        if (serviceName == null || serviceName.isEmpty()) {
            return null;
        }
        return restClient.get()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" +getNameSpacePath() + "/services/" + serviceName)
                .addParameter(getPrettyParameter())
                .query(Service.class);
    }
    public Service replaceService(String serviceName, Service service)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("get service info of " + serviceName);
        if (serviceName == null || serviceName.isEmpty() || service == null) {
            return null;
        }
        return restClient.put()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getNameSpacePath() + "/services/" + serviceName)
                .addParameter(getPrettyParameter())
                .body(service)
                .query(Service.class);
    }
    public boolean deleteService(String serviceName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("delete service=" + serviceName);
        if (serviceName == null) {
            return false;
        }
        Status status = restClient.delete()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getNameSpacePath() + "/services/" + serviceName)
                .addParameter(getPrettyParameter())
                .query(Status.class);
        return status == null || status.getCode() / 100 == 2 || status.getCode() == 404;
    }
    public Service patchService(String serviceName, Service service)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("patch service=" + serviceName);
        if (serviceName == null) {
            return null;
        }
        return restClient.patch()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getNameSpacePath() + "/services/" + serviceName)
                .addParameter(getPrettyParameter())
                .body(service)
                .query(Service.class);
    }
    // listAllService will list the service against the whole namespace
    public ServiceList listAllService(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list service in all namespace with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/services")
                .addParameter(getPrettyParameter())
                .addParameter("selector", formatSelector(selector))
                .query(ServiceList.class);
    }
    public ServiceList listAllService()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listAllService(null);
    }

    // event
    // list event in all namespace
    public EventList listAllEvent(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list event in all namespace with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/events")
                .addParameter(getPrettyParameter())
                .addParameter("selector", formatSelector(selector))
                .query(EventList.class);
    }
    public EventList listAllEvent()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listAllEvent(null);
    }
    public EventList listEvent(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list event with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getNameSpacePath() + "/events")
                .addParameter(getPrettyParameter())
                .addParameter("selector", formatSelector(selector))
                .query(EventList.class);
    }
    public EventList listEvent()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listEvent(null);
    }

    // endpoints
    // listAllEndpoints will list endpoints in all namespace
    public EndpointsList listAllEndpoints(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list endpoints in all namespace with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getEndpointsPath())
                .addParameter("labelSelector", formatSelector(selector))
                .addParameter(getPrettyParameter())
                .query(EndpointsList.class);
    }
    public EndpointsList listAllEndpoints()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listAllEndpoints(null);
    }

    public EndpointsList listEndpoints(Map<String, String> selector)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list endpoints with selector=" + selector);
        return restClient.get()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getNameSpacePath() + "/" + getEndpointsPath())
                .addParameter("labelSelector", formatSelector(selector))
                .addParameter(getPrettyParameter())
                .query(EndpointsList.class);
    }
    public EndpointsList listEndpoints()
            throws KubeResponseException, IOException, KubeInternalErrorException {
        return listEndpoints(null);
    }

    public Endpoints endpointsInfo(String endpointName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        logger.debug("list endpoints=" + endpointName);
        return restClient.get()
                .path(getPathPrefix(KubeAPIVersion.v1) + "/" + getNameSpacePath() + "/" + getEndpointsPath(endpointName))
                .addParameter(getPrettyParameter())
                .query(Endpoints.class);
    }

    // utils
    public NameValuePair getPrettyParameter() {
        return new BasicNameValuePair("pretty", Boolean.toString(context.isPretty()).toLowerCase());
    }
    public NameValuePair getPrettyParameter(boolean isPretty) {
        return new BasicNameValuePair("pretty", Boolean.toString(isPretty).toLowerCase());
    }

    public Header getPatchJsonHeader() {
        return new BasicHeader("Content-Type", "application/strategic-merge-patch+json");
    }

    public String formatSelector(Map<String, String> labelSelector) {
        if (labelSelector == null || labelSelector.isEmpty()) {
            return "";
        }
        String result = "";
        Iterator<Map.Entry<String, String>> iter = labelSelector.entrySet().iterator();
        Map.Entry<String, String> entry = iter.next();
        result += entry.getKey() + "=" + entry.getValue();
        while (iter.hasNext()) {
            result += ",";
            entry = iter.next();
            result += entry.getKey() + "=" + entry.getValue();
        }
        return result;
    }

    public String getNameSpacePath() {
        return "namespaces/" + context.getNamespace();
    }
    public String getBasicNamespacePath() {
        return "namespaces";
    }
    public String getBasicNamespacePath(String namespace) {
        return "namespaces/" + namespace;
    }
    public String getPodPath(String podName) {
        if (podName == null || podName.isEmpty()) {
            return "pods";
        } else {
            return "pods/" + podName;
        }
    }
    public String getPodPath() {
        return getPodPath(null);
    }
    public String getRCPath(String rc) {
        if (rc == null || rc.isEmpty()) {
            return "replicationcontrollers";
        } else {
            return "replicationcontrollers/" + rc;
        }
    }
    public String getRCPath() {
        return getRCPath(null);
    }
    public String getJobPath(String job) {
        return "jobs/" + job;
    }
    public String getJobPath() {
        return "jobs";
    }
    public String getEndpointsPath(String endpointsName) {
        return "endpoints/" + endpointsName;
    }
    public String getEndpointsPath() {
        return "endpoints";
    }
}
