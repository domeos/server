package org.domeos.framework.api.biz.loadBalancer.impl;

import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.mapper.loadBalancer.LoadBalancerMapper;
import org.domeos.framework.api.mapper.loadBalancer.UniqPortMapper;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.LoadBalancer.related.DeployLoadBalancerPair;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by xupeng on 16-4-7.
 */
@Service("loadBalancerBiz")
public class LoadBalancerBizImpl extends BaseBizImpl implements LoadBalancerBiz{

    @Autowired
    UniqPortMapper uniqPortMapper;

    @Autowired
    LoadBalancerMapper loadBalancerMapper;

    @Override
    public List<LoadBalancer> getLBSByDeploy(int deployId) {
        List<LoadBalancer> result = new ArrayList<>();
        List<RowMapperDao> daoList = loadBalancerMapper.getLBListByDeploy(deployId);
        for (RowMapperDao dao: daoList) {
            result.add(checkResult(dao, LoadBalancer.class));
        }
        return result;
    }

    @Override
    public void insertLoadBalancers(int deployId, List<LoadBalancer> loadBalancers) throws DaoException {
        List<LoadBalancer> externalLBs = new LinkedList<>();
        List<LoadBalancer> internalLBs = new LinkedList<>();
        List<LoadBalancer> nginxLBs = new LinkedList<>();
        for (LoadBalancer lb : loadBalancers) {
            switch (lb.getType()) {
                case EXTERNAL_SERVICE:
                    externalLBs.add(lb);
                    break;
                case INNER_SERVICE:
                    internalLBs.add(lb);
                    break;
                case NGINX:
                    nginxLBs.add(lb);
                    break;
            }
        }
        for (LoadBalancer lb : externalLBs) {
            Integer id = uniqPortMapper.getLoadBalancerId(lb.getPort(), lb.getClusterId());
            if (id != null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "port " + lb.getPort() + " already exist");
            }
        }
        for (LoadBalancer lb: loadBalancers) {
//            super.insertRowForProject(LOADBALANCER_TABLE_NAME, lb);
            if (lb.getCreateTime() == 0) {
                lb.setCreateTime(System.currentTimeMillis());
            }
            loadBalancerMapper.insertLoadBalancer(lb, lb.toString());
        }
        for (LoadBalancer lb : externalLBs) {
            uniqPortMapper.insertIndex(lb.getId(), lb.getPort(), lb.getClusterId());
        }
        for (LoadBalancer lb: loadBalancers) {
            DeployLoadBalancerPair pair = new DeployLoadBalancerPair();
            pair.setName(lb.getName());
            pair.setDescription(lb.getType().name() + ", LB:" + lb.getId() + ", LBname:" + lb.getName() + ", deployId:" + deployId);
            pair.setState("ACTIVE");
            pair.setCreateTime(System.currentTimeMillis());
            pair.setRemoved(false);
            pair.setDeployId(deployId);
            pair.setLoadBalancerId(lb.getId());
            loadBalancerMapper.insertIndexPair(pair, pair.toString());
        }
    }

    @Override
    public void deleteLBSByDeploy(int deployId) {
        List<LoadBalancer> lbs = getLBSByDeploy(deployId);
        for (LoadBalancer loadBalancer : lbs) {
            uniqPortMapper.deleteIndex(loadBalancer.getId());
            loadBalancerMapper.removeIndexPair(deployId, loadBalancer.getId(), System.currentTimeMillis());
            this.removeById(GlobalConstant.LOADBALANCER_TABLE_NAME, loadBalancer.getId());
        }
    }

}
