package org.domeos.api.service.deployment.impl;

import org.domeos.api.mapper.cluster.ClusterBasicMapper;
import org.domeos.api.mapper.deployment.DeploymentMapper;
import org.domeos.api.model.cluster.ClusterBasic;
import org.domeos.api.model.console.deployment.Instance;
import org.domeos.api.model.deployment.Deployment;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.service.deployment.InstanceService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.definitions.v1.ContainerStatus;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.client.kubernetesclient.util.filter.Filter;
import org.domeos.global.DateManager;
import org.domeos.global.GlobalConstant;
import org.domeos.node.NodeWrapper;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

/**
 * Created by feiliu206363 on 2015/12/18.
 */
@Service("instanceService")
public class InstanceServiceImpl implements InstanceService {

    @Autowired
    DeploymentMapper deploymentMapper;
    @Autowired
    ClusterBasicMapper clusterBasicMapper;

    @Override
    public HttpResponseTemp<?> listPodsByDeployId(int deployId, Long userId) {
        if (!AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        return ResultStat.OK.wrap(getInstances(deployId));
    }

    public List<Instance> getInstances(int deployId) {
        try {
            Deployment deployment = deploymentMapper.getDeploy(deployId);
            ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(deployment.getClusterName());
            if (clusterBasic == null) {
                return null;
            }
            Map<String, String> labels = DeploymentServiceImpl.buildRCSelector(deployment);
            NodeWrapper nodeWrapper = new NodeWrapper().init(clusterBasic.getId(), deployment.getNamespace());
            PodList podList = nodeWrapper.getPods(labels);
            Filter.getPodSuccessRunningFilter().filter(podList);
            List<Instance> instances = new LinkedList<>();
            if (podList != null && podList.getItems() != null) {
                for (Pod pod : podList.getItems()) {
                    if (!PodUtils.isPodReady(pod)) {
                        continue;
                    }
                    Instance instance = new Instance();
                    instance.setDeloyId(deployId);
                    instance.setDeployName(deployment.getDeployName());
                    instance.setNamespace(pod.getMetadata().getNamespace());
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
                    instances.add(instance);
                }
            }
            return instances;
        } catch (Exception e) {
            return null;
        }
    }
}
