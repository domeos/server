package org.domeos.framework.api.service.LoadBalancer.impl;

import org.domeos.framework.api.consolemodel.LoadBalancer.LoadBalancerDetail;
import org.domeos.framework.api.consolemodel.LoadBalancer.LoadBalancerDraft;
import org.domeos.framework.api.service.LoadBalancer.LoadBalancerService;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by xxs on 16/5/9.
 */
public class LoadBalancerServiceImpl implements LoadBalancerService {
    @Override
    public int createLoadBalancer(LoadBalancerDraft loadBalancerDraft) throws Exception {
        // TODO(openxxs)
        return 0;
    }

    @Override
    public void removeLoadBalancer(int loadBalancerId) throws Exception {
        // TODO(openxxs)
    }

    @Override
    public void modifyLoadBalancer(int loadBalancerId, LoadBalancerDraft loadBalancerDraft) throws Exception {
        // TODO(openxxs)
    }

    @Override
    public LoadBalancerDetail getLoadBalancer(int loadBalancerId) throws Exception {
        LoadBalancerDetail loadBalancerDetail = new LoadBalancerDetail();
        // TODO(openxxs)
        return loadBalancerDetail;
    }

    @Override
    public List<LoadBalancerDetail> listLoadBalancer() throws Exception {
        List<LoadBalancerDetail> loadBalancerDetailList = new ArrayList<>();
        // TODO(openxxs)
        return loadBalancerDetailList;
    }
}
