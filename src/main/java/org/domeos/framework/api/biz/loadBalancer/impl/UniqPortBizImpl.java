package org.domeos.framework.api.biz.loadBalancer.impl;

import org.domeos.framework.api.biz.loadBalancer.UniqPortBiz;
import org.domeos.framework.api.mapper.domeos.loadBalancer.UniqPortMapper;
import org.domeos.framework.api.model.loadBalancer.UniqPort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
/**
 * Created by jackfan on 2017/3/2.
 */
@Service("uniqPortBiz")
public class UniqPortBizImpl implements UniqPortBiz {
    @Autowired
    UniqPortMapper mapper;
    
    @Override
    public void insertUniqPort(UniqPort item) {
        mapper.insertUniqPort(item);
    }

    @Override
    public UniqPort getUniqPort(String ip, int port, int clusterId) {
        return mapper.getUniqPort(ip, port, clusterId);
    }

    @Override
    public void removeUniqPortByLoadBalancerId(int lbId) {
        mapper.removeUniqPortByLoadBalancerId(lbId, System.currentTimeMillis());
    }

}
