package org.domeos.api.service.deployment;

import org.domeos.api.model.deployment.LoadBalanceDraft;

import java.util.List;

/**
 */
public interface LoadBalanceBiz {
    /**
     *
     * @param loadBalanceDraft
     */
    void createLoadBalance(LoadBalanceDraft loadBalanceDraft);

    /**
     *
     * @param deployId
     * @return
     */
    List<LoadBalanceDraft> getLoadBalanceByDeployId(long deployId);

    /**
     *
     * @param port
     * @param clusterName
     * @return
     */
    LoadBalanceDraft getLoadBalanceByClusterPort(int port, String clusterName);

    /**
     *
     * @param loadBalanceDraft
     */
    void modifyLoadBalance(LoadBalanceDraft loadBalanceDraft);

    /**
     *
     * @param deployId
     */
    void deleteLoadBalance(long deployId);
}
