package org.domeos.framework.api.model.LoadBalancer.related;

import org.domeos.framework.engine.model.RowModelBase;

/**
 * Created by xupeng on 16-4-7.
 */
public class DeployLoadBalancerPair extends RowModelBase {

    private int deployId;
    private int loadBalancerId;

    public int getDeployId() {
        return deployId;
    }

    public void setDeployId(int deployId) {
        this.deployId = deployId;
    }

    public int getLoadBalancerId() {
        return loadBalancerId;
    }

    public void setLoadBalancerId(int loadBalancerId) {
        this.loadBalancerId = loadBalancerId;
    }
}
