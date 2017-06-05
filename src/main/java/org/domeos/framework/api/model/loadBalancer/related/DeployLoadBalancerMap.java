package org.domeos.framework.api.model.loadBalancer.related;

/**
 * Created by jackfan on 2017/3/2.
 */
public class DeployLoadBalancerMap {
    private int id;
    private int deployId;
    private int loadBalancerId;
    private long createTime = 0;
    private long removeTime = 0;
    private boolean removed = false;
    
    public DeployLoadBalancerMap() {
        super();
    }
    
    public DeployLoadBalancerMap(int deployId, int loadBalancerId, long createTime) {
        this.deployId = deployId;
        this.loadBalancerId = loadBalancerId;
        this.createTime = createTime;
    }

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

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getRemoveTime() {
        return removeTime;
    }

    public void setRemoveTime(long removeTime) {
        this.removeTime = removeTime;
    }

    public boolean isRemoved() {
        return removed;
    }

    public void setRemoved(boolean removed) {
        this.removed = removed;
    }
}
