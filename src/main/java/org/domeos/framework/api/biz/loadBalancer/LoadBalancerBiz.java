package org.domeos.framework.api.biz.loadBalancer;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.DeployLoadBalancerMap;

import java.util.List;

/**
 * Created by jackfan on 2017/2/27.
 */
public interface LoadBalancerBiz extends BaseBiz{
    
    String LOADBALANCER_NAME = "loadbalancer";
    
    List<LoadBalancer> getLoadBalancersByDeploy(int deployId);
    
    void removeLoadBalancerByDeployId(int deployId);
    
    void removeLinkDeployByLoadBalancerId(int lbId);
    
    void createLinkDeploy(DeployLoadBalancerMap item);
    
    void updateLinkDeploy(DeployLoadBalancerMap item);
    
    void createLoadBalancer(LoadBalancer lb);

    void removeLoadBalancer(int lbId);

    void updateLoadBalancer(LoadBalancer lb);

    LoadBalancer getLoadBalancer(int lbId);
    
    List<LoadBalancer> listLoadBalancerByName(String name);

    LoadBalancer getInnerLoadBalancerByDeployId(int deployId);

    List<LoadBalancer> listLoadBalancerIncludeRemovedByIdList(List<Integer> idList);

    List<LoadBalancer> getInnerAndExternalLoadBalancerByDeployId(int deployId);
}
