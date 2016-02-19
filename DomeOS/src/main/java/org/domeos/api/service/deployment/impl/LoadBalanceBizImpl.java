package org.domeos.api.service.deployment.impl;

import org.domeos.api.mapper.deployment.LoadBalanceMapper;
import org.domeos.api.model.deployment.LoadBalanceDBProto;
import org.domeos.api.model.deployment.LoadBalanceDraft;
import org.domeos.api.service.deployment.LoadBalanceBiz;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 */
@Service("loadBalanceBiz")
public class LoadBalanceBizImpl implements LoadBalanceBiz{

    @Autowired
    LoadBalanceMapper loadBalanceMapper;

    @Override
    public void createLoadBalance(LoadBalanceDraft loadBalanceDraft) {
        if (loadBalanceDraft == null) {
            return;
        }
        LoadBalanceDBProto proto = LoadBalanceDBProto.fromLoadBalanceDraft(loadBalanceDraft);
        loadBalanceMapper.createLoadBalance(proto);
    }

    @Override
    public List<LoadBalanceDraft> getLoadBalanceByDeployId(long deployId) {
        List<LoadBalanceDBProto> protos = loadBalanceMapper.getLoadBalanceByDeployId(deployId);
        List<LoadBalanceDraft> drafts = new ArrayList<>(protos.size());
        for (LoadBalanceDBProto proto : protos) {
            drafts.add(proto.toLoadBalanceDraft());
        }
        return drafts;
    }

    @Override
    public LoadBalanceDraft getLoadBalanceByClusterPort(int port, String clusterName) {
        LoadBalanceDBProto proto = loadBalanceMapper.getLoadBalanceByClusterPort(port, clusterName);
        if (proto == null) {
            return null;
        } else {
            return proto.toLoadBalanceDraft();
        }
    }

    @Override
    public void modifyLoadBalance(LoadBalanceDraft loadBalanceDraft) {
        if (loadBalanceDraft == null) {
            return;
        }
        LoadBalanceDBProto proto = LoadBalanceDBProto.fromLoadBalanceDraft(loadBalanceDraft);
        loadBalanceMapper.modifyLoadBalance(proto);
    }

    @Override
    public void deleteLoadBalance(long deployId) {
        loadBalanceMapper.deleteLoadBalance(deployId);
    }
}
