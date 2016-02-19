package org.domeos.api.service.deployment.impl;

import org.domeos.api.mapper.deployment.DeploymentMapper;
import org.domeos.api.mapper.deployment.HealthCheckerMapper;
import org.domeos.api.model.deployment.*;
import org.domeos.api.service.deployment.DeploymentBiz;
import org.domeos.api.service.deployment.LoadBalanceBiz;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

/**
 * Created by xxs on 15/12/19.
 */
@Service("deploymentBiz")
public class DeploymentBizImpl implements DeploymentBiz {
    @Autowired
    DeploymentMapper deploymentMapper;

    @Autowired
    HealthCheckerMapper healthCheckerMapper;

    @Autowired
    LoadBalanceBiz loadBalanceBiz;

    @Override
    public Deployment getDeployment(long deployId) throws IOException {
        Deployment deployment = deploymentMapper.getDeploy(deployId);
        if (deployment == null) {
            return null;
        }
        List<LoadBalanceDraft> loadBalanceDrafts = loadBalanceBiz.getLoadBalanceByDeployId(deployId);
        deployment.setLoadBalanceDrafts(loadBalanceDrafts);
        HealthChecker healthChecker = healthCheckerMapper.getHealthCheckerByDeployId(deployId);
        deployment.setHealthChecker(healthChecker);
        return deployment;
    }

    @Override
    public Long getIdByName(String deployName) {
        return deploymentMapper.getIdByName(deployName);
    }

    @Override
    public long createDeployment(DeploymentDraft deploymentDraft) {
        Deployment deployment = draftToDeployment(deploymentDraft);
        deploymentMapper.createDeploy(deployment);

        long deployId = deployment.getDeployId();

        List<LoadBalanceDraft> loadBalanceDrafts = deploymentDraft.getLoadBalanceDrafts();

        if (loadBalanceDrafts != null && loadBalanceDrafts.size() > 0) {
            for (LoadBalanceDraft loadBalanceDraft : loadBalanceDrafts) {
                loadBalanceDraft.setDeployId(deployId);
                loadBalanceBiz.createLoadBalance(loadBalanceDraft);
            }
        }

        HealthCheckerDraft healthCheckerDraft = deploymentDraft.getHealthCheckerDraft();
        if (healthCheckerDraft != null) {
            healthCheckerMapper.createHealthChecker(healthCheckerDraft.toHealthChecker(deployId));
        }
        return deployId;
    }

    @Override
    public void deleteDeployment(long deployId) {
        deploymentMapper.deleteDeploy(deployId);
        loadBalanceBiz.deleteLoadBalance(deployId);
        healthCheckerMapper.deleteHealthChecker(deployId);
    }

    @Override
    public List<Deployment> listDeployment(List<Long> deployIds) {

        return deploymentMapper.listDeploy(deployIds);
    }

    @Override
    public void updateDefaultReplicas(long deployId, int replicas) {
        deploymentMapper.updateDefaultReplicas(deployId, replicas);
    }

    private Deployment draftToDeployment(DeploymentDraft draft) {
        Deployment deployment = new Deployment();
        deployment.setClusterName(draft.getClusterName());
        deployment.setCreateTime(draft.getCreateTime());
        deployment.setDefaultReplicas(draft.getReplicas());
        deployment.setDeployName(draft.getDeployName());
        deployment.setHostEnv(draft.getHostEnv());
        deployment.setNamespace(draft.getNamespace());
        deployment.setLoadBalanceDrafts(draft.getLoadBalanceDrafts());
        deployment.setScalable(draft.isScalable());
        deployment.setStateful(draft.isStateful());
        return deployment;
    }
}
