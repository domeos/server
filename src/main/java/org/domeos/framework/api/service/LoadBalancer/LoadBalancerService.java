package org.domeos.framework.api.service.LoadBalancer;

import org.domeos.framework.api.consolemodel.LoadBalancer.LoadBalancerDetail;
import org.domeos.framework.api.consolemodel.LoadBalancer.LoadBalancerDraft;

import java.util.List;

/**
 * Created by xxs on 16/5/9.
 */
public interface LoadBalancerService {
    /**
     * create loadBalancer
     * @param loadBalancerDraft
     * @return
     * @throws Exception
     */
    int createLoadBalancer(LoadBalancerDraft loadBalancerDraft) throws Exception;

    /**
     * remove loadBalancer by id
     * @param loadBalancerId
     * @return
     * @throws Exception
     */
    void removeLoadBalancer(int loadBalancerId) throws Exception;

    /**
     * modify loadBalancer
     * @param loadBalancerId
     * @param loadBalancerDraft
     * @throws Exception
     */
    void modifyLoadBalancer(int loadBalancerId, LoadBalancerDraft loadBalancerDraft) throws Exception;

    /**
     * get loadBalancer by id
     * @param loadBalancerId
     * @return
     * @throws Exception
     */
    LoadBalancerDetail getLoadBalancer(int loadBalancerId) throws Exception;

    /**
     * list all loadBalancer
     * @return
     * @throws Exception
     */
    List<LoadBalancerDetail> listLoadBalancer() throws Exception;
}
