package org.domeos.framework.api.biz.loadBalancer.impl;

import java.util.LinkedList;
import java.util.List;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.deployment.impl.DeploymentBizImpl;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerEventBiz;
import org.domeos.framework.api.mapper.domeos.loadBalancer.LoadBalancerEventMapper;
import org.domeos.framework.api.model.loadBalancer.LoadBalancerEvent;
import org.domeos.framework.engine.model.RowMapperDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by jackfan on 2017/2/28.
 */
@Service("loadBalancerEventBiz")
public class LoadBalancerEventBizImpl extends BaseBizImpl implements LoadBalancerEventBiz{
    
    @Autowired
    LoadBalancerEventMapper mapper;
    
    private static Logger logger = LoggerFactory.getLogger(DeploymentBizImpl.class);
    
    @Override
    public List<LoadBalancerEvent> listLoadBalancerEvent(int lbId) {
        List<RowMapperDao> daos = mapper.listLoadBalancerEvent(lbId);
        List<LoadBalancerEvent> events = new LinkedList<LoadBalancerEvent>();
        if (daos != null) {
            for (RowMapperDao dao : daos) {
                try {
                    events.add(super.checkResult(dao, LoadBalancerEvent.class));
                } catch (Exception e) {
                    logger.error("loadBalancerEvent map error, " + dao.toString());
                }
            }
        }
        return events;
    }

    @Override
    public void createLoadBalancerEvent(LoadBalancerEvent lbEvent) {
        mapper.createLoadBalancerEvent(lbEvent, lbEvent.toString());
    }

    @Override
    public void updateEvent(LoadBalancerEvent lbEvent) {
        mapper.updateLoadBalancerEvent(lbEvent, lbEvent.toString());
    }

    @Override
    public LoadBalancerEvent getEventById(int id) {
        return super.getById(LOADBALANCER_EVENT_NAME, id, LoadBalancerEvent.class);
    }

    @Override
    public void removeEventByLoadBalancerId(int lbId) {
        mapper.removeEventByLoadBalancerId(lbId);
    }

    @Override
    public List<LoadBalancerEvent> getUnfinishedEvent() {
        List<RowMapperDao> daos = mapper.getUnfinishedEvent();
        List<LoadBalancerEvent> events = new LinkedList<LoadBalancerEvent>();
        if (daos != null) {
            for (RowMapperDao dao : daos) {
                try {
                    events.add(super.checkResult(dao, LoadBalancerEvent.class));
                } catch (Exception e) {
                    logger.error("loadBalancerEvent map error, " + dao.toString());
                }
            }
        }
        return events;
    }
}
