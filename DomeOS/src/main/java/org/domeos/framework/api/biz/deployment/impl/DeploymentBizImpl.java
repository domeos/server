package org.domeos.framework.api.biz.deployment.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.mapper.deployment.DeploymentMapper;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by xxs on 15/12/19.
 */
@Service("deploymentBiz")
public class DeploymentBizImpl extends BaseBizImpl implements DeploymentBiz {

    @Autowired
    DeploymentMapper mapper;

    @Override
    public void createDeployment(Deployment deployment) {
        mapper.insertDeploy(deployment, deployment.toString());
    }

    @Override
    public Deployment getDeployment(int id) {
        return super.getById(GlobalConstant.DEPLOY_TABLE_NAME, id, Deployment.class);
    }

    @Override
    public void update(Deployment deployment) throws DaoException {
        mapper.updateDeploy(new RowMapperDao(deployment));
    }

    @Override
    public List<Deployment> listDeploymentByClutesrId(int id) {
        return mapper.listDeploymentByClusterId(id);
    }

//    @Autowired
//    DeploymentMapper deploymentMapper;
//
//    @Autowired
//    HealthCheckerMapper healthCheckerMapper;
//
//    @Autowired
//    LoadBalanceBiz loadBalanceBiz;
//
//    @Autowired
//    DeploymentExtraBiz deploymentExtraBiz;
//
//    @Autowired
//    InnerServiceBiz innerServiceBiz;
//
//    @Override
//    public Deployment getDeployment(long deployId) throws IOException {
//        Deployment deployment = deploymentMapper.getDeploy(deployId);
//        if (deployment == null) {
//            return null;
//        }
//        List<LoadBalanceDraft> loadBalanceDrafts = loadBalanceBiz.getLoadBalanceByDeployId(deployId);
//        deployment.setLoadBalanceDrafts(loadBalanceDrafts);
//        HealthChecker healthChecker = healthCheckerMapper.getHealthCheckerByDeployId(deployId);
//        deployment.setHealthChecker(healthChecker);
//        DeploymentExtra extra = deploymentExtraBiz.getExtra(deployId);
//        deployment.setDeploymentExtra(extra);
//        List<InnerServiceDraft> innerServiceDrafts = innerServiceBiz.getInnerServiceByDeployId(deployId);
//        deployment.setInnerServiceDrafts(innerServiceDrafts);
//        return deployment;
//    }
//
//    @Override
//    public Long getIdByName(String deployName) {
//        return deploymentMapper.getIdByName(deployName);
//    }
//
//    @Override
//    public long createDeployment(DeploymentDraft deploymentDraft) throws Exception {
//        Deployment deployment = deploymentDraft.toDeployment();
//        deploymentMapper.createDeploy(deployment);
//
//        long deployId = deployment.getDeployId();
//
//        List<LoadBalanceDraft> loadBalanceDrafts = deploymentDraft.getLoadBalanceDrafts();
//
//        if (loadBalanceDrafts != null && loadBalanceDrafts.size() > 0) {
//            for (LoadBalanceDraft loadBalanceDraft : loadBalanceDrafts) {
//                loadBalanceDraft.setDeployId(deployId);
//                loadBalanceBiz.createLoadBalance(loadBalanceDraft);
//            }
//        }
//
//        HealthCheckerDraft healthCheckerDraft = deploymentDraft.getHealthCheckerDraft();
//        if (healthCheckerDraft != null) {
//            healthCheckerMapper.createHealthChecker(healthCheckerDraft.toHealthChecker(deployId));
//        }
//
//        DeploymentExtra extra = deploymentDraft.toDeploymentExtra(deployId);
//        deploymentExtraBiz.createExtra(extra);
//
//        List<InnerServiceDraft> innerServiceDrafts = deploymentDraft.getInnerServiceDrafts();
//        if (innerServiceDrafts != null && innerServiceDrafts.size() > 0) {
//            for (InnerServiceDraft innerServiceDraft : innerServiceDrafts) {
//                innerServiceDraft.setDeployId(deployId);
//                innerServiceBiz.createInnerService(innerServiceDraft);
//            }
//        }
//
//        return deployId;
//    }
//
//    @Override
//    public void deleteDeployment(long deployId) {
//        innerServiceBiz.deleteInnerServiceByDeployId(deployId);
//        deploymentExtraBiz.deleteExtra(deployId);
//        loadBalanceBiz.deleteLoadBalance(deployId);
//        healthCheckerMapper.deleteHealthChecker(deployId);
//        deploymentMapper.deleteDeploy(deployId);
//    }
//
//    @Override
//    public List<Deployment> listDeployment(List<Long> deployIds) {
//        List<Deployment> deployments = deploymentMapper.listDeploy(deployIds);
//        if (deployments == null) {
//            return null;
//        }
//        for (Deployment deployment : deployments) {
//            List<LoadBalanceDraft> loadBalanceDrafts = loadBalanceBiz.getLoadBalanceByDeployId(deployment.getDeployId());
//            deployment.setLoadBalanceDrafts(loadBalanceDrafts);
//            HealthChecker healthChecker = healthCheckerMapper.getHealthCheckerByDeployId(deployment.getDeployId());
//            deployment.setHealthChecker(healthChecker);
//            List<InnerServiceDraft> innerServiceDrafts = innerServiceBiz.getInnerServiceByDeployId(deployment.getDeployId());
//            deployment.setInnerServiceDrafts(innerServiceDrafts);
//        }
//        return deployments;
//    }
//
//    @Override
//    public void updateDefaultReplicas(long deployId, int replicas) {
//        deploymentMapper.updateDefaultReplicas(deployId, replicas);
//    }

}
