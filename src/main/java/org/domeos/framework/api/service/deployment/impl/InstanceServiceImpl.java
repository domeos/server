package org.domeos.framework.api.service.deployment.impl;

import io.fabric8.kubernetes.api.model.ContainerStatus;
import io.fabric8.kubernetes.api.model.ObjectMeta;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.Container;
import org.domeos.framework.api.model.deployment.related.Instance;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.deployment.InstanceService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.RuntimeDriver;
import org.domeos.framework.engine.k8s.NodeWrapper;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.DateUtil;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Created by feiliu206363 on 2015/12/18.
 */
@Service
public class InstanceServiceImpl implements InstanceService {

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    DeploymentBiz deploymentBiz;
    
    @Autowired
    OperationHistory operationHistory;

    private static Logger logger = LoggerFactory.getLogger(InstanceServiceImpl.class);

    @Override
    public HttpResponseTemp<?> listPodsByDeployId(int deployId) throws Exception {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.GET);
        return ResultStat.OK.wrap(getInstances(deployId));
    }

    @Override
    public HttpResponseTemp<?> setPodAnnotation(String clusterName, String namespace, String podname, Map<String, String> annotations) {
        Cluster cluster = clusterBiz.getClusterByName(clusterName);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "The cluster with name " + clusterName + " does not exist.");
        }
        try {
            KubeUtils client = Fabric8KubeUtils.buildKubeUtils(cluster, namespace);
            Pod pod;
            pod = client.podInfo(podname);
            if (pod == null) {
                throw ApiException.wrapMessage(ResultStat.POD_NOT_EXIST, "The pod with name " + podname + " does not exist.");
            }
            Map<String, String> merged = pod.getMetadata().getAnnotations();
            for (String key : annotations.keySet()) {
                merged.put(key, annotations.get(key));
            }
            pod.getMetadata().setAnnotations(merged);
            client.replacePod(podname, pod);
        } catch (K8sDriverException e) {
            logger.warn("exception happened when set pod annotation, detail:" + e.getMessage());
            return ResultStat.SERVER_INTERNAL_ERROR.wrap(null);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public List<Instance> getInstances(int deployId) throws Exception {
        Deployment deployment = deploymentBiz.getById(GlobalConstant.DEPLOY_TABLE_NAME, deployId, Deployment.class);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "The deployment with id=" + deployId + " does not exist.");
        }
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "The cluster with clusterId " + deployment.getClusterId() + " does not exist.");
        }
        Map<String, String> labels = new HashMap<>();
        labels.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        NodeWrapper nodeWrapper = new NodeWrapper().init(cluster.getId(), deployment.getNamespace());
        PodList podList = nodeWrapper.getPods(labels);
        if (podList == null || podList.getItems() == null || podList.getItems().isEmpty()) {
            return new ArrayList<>(1);
        }
        List<Instance> instances = new ArrayList<>(podList.getItems().size());
        for (Pod pod : podList.getItems()) {
            Instance instance = new Instance();
            instance.setDeloyId(deployId);
            instance.setDeployName(deployment.getName());
            instance.setNamespace(pod.getMetadata().getName());
            if (pod.getMetadata() != null) {
                instance.setInstanceName(pod.getMetadata().getName());
                if (pod.getMetadata().getLabels() != null && pod.getMetadata().getLabels().containsKey(GlobalConstant.VERSION_STR)) {
                    instance.setVersionId(Integer.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR)));
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
                        if (StringUtils.isBlank(containerStatus.getContainerID())) {
                            continue;
                        }
                        String containerId = containerStatus.getContainerID().split("docker://")[1];
                        instance.addContainer(new Container(containerId, containerStatus.getName(), containerStatus.getImage()));
                    }
                }
            }
            instance.setStatus(PodUtils.getPodStatus(pod));
            instances.add(instance);
        }
        return instances;
    }
    
    @Override
    public HttpResponseTemp<?> deletePodByDeployIdAndInsName(int deployId, String insName) throws Exception {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.MODIFY);
        if (StringUtils.isBlank(insName)) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_INSTANCE, "instanceName is null");
        }
        
        Deployment oldDeploy = deploymentBiz.getDeployment(deployId);
        if (oldDeploy == null) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOYMENT_NOT_EXIST);
        }
        
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(oldDeploy.getClusterId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster id: " + oldDeploy.getClusterId());
        }
        boolean deletedPod = false;
        try {
            Map<String, String> labels = new HashMap<>();
            labels.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(oldDeploy.getId()));
            NodeWrapper nodeWrapper = new NodeWrapper().init(oldDeploy.getClusterId(), oldDeploy.getNamespace());
            PodList podList = nodeWrapper.getPods(labels);
            Set<String> statusSet = new HashSet<String>(Arrays.asList("Pending", "Terminating" , "ContainerCreating"));
            if (podList != null && podList.getItems() != null) {
                for (Pod pod : podList.getItems()) {
                    ObjectMeta meta = pod.getMetadata();
                    if (meta != null && meta.getName().equals(insName) && !statusSet.contains(PodUtils.getPodStatus(pod))) {
                        driver.deletePodByDeployIdAndInsName(oldDeploy, insName);
                        deletedPod = true;
                    }
                }
            }
        } catch (DeploymentEventException | K8sDriverException e) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_INSTANCE, e.getMessage());
        }
        if (!deletedPod) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_INSTANCE, "instance seem not in the deploy");
        }
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                deployId,
                ResourceType.DEPLOY,
                OperationType.DELETEINSTANCE,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        return ResultStat.OK.wrap(null);
    }
}
