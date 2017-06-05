package org.domeos.framework.api.biz.loadBalancer;

import java.util.List;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.loadBalancer.LoadBalancerEvent;

/**
 * Created by jackfan on 2017/2/28.
 */
public interface LoadBalancerEventBiz extends BaseBiz{
    
    String LOADBALANCER_EVENT_NAME = "loadbalancer_event";
    
    List<LoadBalancerEvent> listLoadBalancerEvent(int lbId);

    void createLoadBalancerEvent(LoadBalancerEvent lbEvent);
    
    void updateEvent(LoadBalancerEvent lbEvent);
    
    LoadBalancerEvent getEventById(int id);
    
    void removeEventByLoadBalancerId(int lbId);
    
    List<LoadBalancerEvent> getUnfinishedEvent();
    
}
