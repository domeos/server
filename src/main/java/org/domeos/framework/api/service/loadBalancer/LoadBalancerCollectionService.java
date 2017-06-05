package org.domeos.framework.api.service.loadBalancer;

import java.util.List;

import org.domeos.framework.api.consolemodel.loadBalancer.LoadBalancerCollectionDraft;
import org.domeos.framework.api.consolemodel.loadBalancer.LoadBalancerCollectionInfo;

/**
 * Created by jackfan on 17/2/27.
 */
public interface LoadBalancerCollectionService {
    
    LoadBalancerCollectionDraft createLoadBalancerCollection(LoadBalancerCollectionDraft lbcDraft);
    
    void deleteLoadBalancerCollection(int lbcId);
    
    LoadBalancerCollectionDraft updateLoadBalancerCollection(LoadBalancerCollectionDraft lbcDraft);
    
    List<LoadBalancerCollectionInfo> listLoadBalancerCollection();

    LoadBalancerCollectionInfo getLoadBalancerCollection(int lbcId);
}
