package org.domeos.framework.api.biz.loadBalancer;

import org.domeos.framework.api.model.loadBalancer.UniqPort;
/**
 * Created by jackfan on 2017/3/2.
 */
public interface UniqPortBiz {
    String UNIQPORT_NAME = "uniq_port_index";
    
    void insertUniqPort(UniqPort item);
    
    UniqPort getUniqPort(String ip, int port, int clusterId);
    
    void removeUniqPortByLoadBalancerId(int lbId);
}
