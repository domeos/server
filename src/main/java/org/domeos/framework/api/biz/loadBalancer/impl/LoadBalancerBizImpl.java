package org.domeos.framework.api.biz.loadBalancer.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerBiz;
import org.domeos.framework.api.mapper.domeos.loadBalancer.LoadBalancerMapper;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.DeployLoadBalancerMap;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;
import org.domeos.framework.engine.exception.DaoConvertingException;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jackfan on 2017/2/28.
 */
@Service("loadBalancerBiz")
public class LoadBalancerBizImpl extends BaseBizImpl implements LoadBalancerBiz {

    @Autowired
    LoadBalancerMapper mapper;
    
    @Override
    public List<LoadBalancer> getLoadBalancersByDeploy(int deployId) {
        List<RowMapperDao> daoList = mapper.getLBListByDeploy(deployId);
        if (daoList == null || daoList.isEmpty()) {
            return new ArrayList<>(1);
        }
        List<LoadBalancer> result = new ArrayList<>(daoList.size());
        for (RowMapperDao dao : daoList) {
            LoadBalancer loadBalancer = checkResult(dao, LoadBalancer.class);
            result.add(loadBalancer);
        }
        return result;
    }
    
    @Override
    public LoadBalancer getInnerLoadBalancerByDeployId(int deployId) {
        List<RowMapperDao> daoList = mapper.getLBListByDeploy(deployId);
        if (daoList == null || daoList.isEmpty()) {
            return null;
        }
        for (RowMapperDao dao : daoList) {
            LoadBalancer loadBalancer = checkResult(dao, LoadBalancer.class);
            if (loadBalancer.getType() == LoadBalancerType.INNER_SERVICE) {
                return loadBalancer;
            }
        }
        return null;
    }
    
    @Override
    public List<LoadBalancer> getInnerAndExternalLoadBalancerByDeployId(int deployId) {
        List<RowMapperDao> daoList = mapper.getLBListByDeploy(deployId);
        if (daoList == null || daoList.isEmpty()) {
            return new ArrayList<>(1);
        }
        List<LoadBalancer> result = new ArrayList<>();
        for (RowMapperDao dao : daoList) {
            LoadBalancer loadBalancer = checkResult(dao, LoadBalancer.class);
            if (loadBalancer.getType() != LoadBalancerType.NGINX) {
                result.add(loadBalancer);
            }
        }
        return result;
    }
    
    @Override
    public void removeLoadBalancerByDeployId(int deployId) {
        List<LoadBalancer> lbs = getLoadBalancersByDeploy(deployId);
        for (LoadBalancer lb : lbs) {
            if (lb.getType() == LoadBalancerType.INNER_SERVICE) {
                this.removeById(GlobalConstant.LOADBALANCER_TABLE_NAME, lb.getId());
                removeLinkDeployByLoadBalancerId(lb.getId());
            }
        }
    }
    
    @Override
    public void createLinkDeploy(DeployLoadBalancerMap item) {
        mapper.insertLinkDeploy(item);
    }

    @Override
    public void removeLinkDeployByLoadBalancerId(int lbId) {
        mapper.removeLinkDeployByLoadBalancerId(lbId, System.currentTimeMillis());
    }
    
    @Override
    public void createLoadBalancer(LoadBalancer lb) {
        mapper.insertLoadBalancer(lb, lb.toString());
    }

    @Override
    public void removeLoadBalancer(int lbId) {
        super.removeById(LOADBALANCER_NAME, lbId);
    }

    @Override
    public void updateLoadBalancer(LoadBalancer lb) {
        mapper.updateLoadBalancer(lb, lb.toString());
    }

    @Override
    public LoadBalancer getLoadBalancer(int lbId) {
        return super.getById(LOADBALANCER_NAME, lbId, LoadBalancer.class);
    }

    @Override
    public List<LoadBalancer> listLoadBalancerByName(String name) {
        return super.getListByName(LOADBALANCER_NAME, name, LoadBalancer.class);
    }

    @Override
    public void updateLinkDeploy(DeployLoadBalancerMap item) {
        mapper.updateLinkDeploy(item);
    }
    
    @Override
    public List<LoadBalancer> listLoadBalancerIncludeRemovedByIdList(List<Integer> idList) {
        try {
            if (idList == null || idList.isEmpty()) {
                return new ArrayList<>(1);
            }
            StringBuilder builder = new StringBuilder();
            builder.append(" ( ");
            for (int i = 0; i < idList.size(); i++) {
                builder.append(idList.get(i));
                if (i != idList.size() - 1) {
                    builder.append(" , ");
                }
            }
            builder.append(") ");
            return mapper.listLoadBalancerIncludeRemovedByIdList(builder.toString());
        }catch (Exception e) {
            throw new DaoConvertingException("Get MySQL Data failed! tableName=" + GlobalConstant.LOADBALANCER_TABLE_NAME
                    + ", resourceList=" + idList, e );
        }
    }
}