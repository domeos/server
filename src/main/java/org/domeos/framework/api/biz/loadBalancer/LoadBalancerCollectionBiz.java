package org.domeos.framework.api.biz.loadBalancer;

import java.util.List;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.loadBalancer.LoadBalancerCollection;

/**
 * Created by jackfan on 2017/2/27.
 */
public interface LoadBalancerCollectionBiz extends BaseBiz{
    
    String LOADBALANCER_COLLECTION_NAME = "loadbalancer_collection";
    
    void createLoadBalancerCollection(LoadBalancerCollection lbc);
    
    void deleteLoadBalancerCollection(int lbcId);
    
    void updateLoadBalancerCollection(LoadBalancerCollection lbc);
    
    LoadBalancerCollection getLoadBalancerCollection(int lbcId);
    
    List<LoadBalancerCollection> getLoadBalancerCollection(String name);
    
    List<LoadBalancerCollection> listLoadBalancerCollectionIncludeRemovedByIdList(List<Integer> idList);

    List<LoadBalancerCollection> listAllLoadBalancerCollections();
    
}
