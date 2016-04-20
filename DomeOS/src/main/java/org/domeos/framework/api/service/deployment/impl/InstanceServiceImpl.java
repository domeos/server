package org.domeos.framework.api.service.deployment.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.ContainerStatus;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.client.kubernetesclient.util.filter.Filter;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.Container;
import org.domeos.framework.api.model.deployment.related.Instance;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.deployment.InstanceService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.k8s.NodeWrapper;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.DateUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

/**
 * Created by feiliu206363 on 2015/12/18.
 */
@Service("instanceService")
public class InstanceServiceImpl implements InstanceService {

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

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
        KubeClient client = new KubeClient(cluster.getApi(), namespace);
        Pod pod;
        try {
            pod = client.podInfo(podname);
            Map<String, String> merged = pod.getMetadata().getAnnotations();
            for (String key : annotations.keySet()) {
                merged.put(key, annotations.get(key));
            }
            pod.getMetadata().setAnnotations(merged);
            client.replacePod(podname, pod);
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            logger.warn("exception happened when set pod annotation, detail:" + e.getMessage());
            return ResultStat.SERVER_INTERNAL_ERROR.wrap(null);
        }
        return ResultStat.OK.wrap(null);
    }

    public List<Instance> getInstances(int deployId) throws Exception {
        Deployment deployment = deploymentBiz.getById(GlobalConstant.DEPLOY_TABLE_NAME, deployId, Deployment.class);
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "The cluster with clusterId " + deployment.getClusterId() + " does not exist.");
        }
        Map<String, String> labels = DeploymentServiceImpl.buildRCSelector(deployment);
        NodeWrapper nodeWrapper = new NodeWrapper().init(cluster.getId(), deployment.getNamespace());
        PodList podList = nodeWrapper.getPods(labels);
        Filter.getPodSuccessRunningFilter().filter(podList);
        List<Instance> instances = new ArrayList<>();
        if (podList != null && podList.getItems() != null) {
            for (Pod pod : podList.getItems()) {
                if (!PodUtils.isPodReady(pod)) {
                    continue;
                }
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
                            String containerId = containerStatus.getContainerID().split("docker://")[1];
                            instance.addContainer(new Container(containerId, containerStatus.getName(), containerStatus.getImage()));
                        }
                    }
                }
                instances.add(instance);
            }
        }
        return instances;
    }
}
