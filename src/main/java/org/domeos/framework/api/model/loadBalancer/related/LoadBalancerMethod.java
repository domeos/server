package org.domeos.framework.api.model.loadBalancer.related;

import org.domeos.util.StringUtils;

/**
 * Created by jackfan on 2017/2/27.
 */
public enum LoadBalancerMethod {
    ROUNDROBIN(""),
    IPHASH("ip_hash"),
    LEASTCONN("least_conn");
    
    private String method;
    
    LoadBalancerMethod(String method) {
        this.method = method;
    }

    public String getMethod() {
        return method;
    }

    public LoadBalancerMethod setMethod(String method) {
        this.method = method;
        return this;
    }
    
    public static LoadBalancerMethod getEnumdByMethod(String method){
        for(LoadBalancerMethod lbMethod : LoadBalancerMethod.values()){
          if(StringUtils.equals(method, lbMethod.getMethod())){
            return lbMethod;
          }
        }
        return null;
      }
}
