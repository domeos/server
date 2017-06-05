package org.domeos.framework.api.model.loadBalancer;
/**
 * Created by jackfan on 17/3/2.
 */
public class UniqPort {
    private int id;
    private int port;
    private int loadBalancerId;
    private int clusterId;
    private String ip;
    private long createTime = 0;
    private long removeTime = 0;
    private boolean removed = false;
    
    public UniqPort(){
    }
    
    public UniqPort(int port, int loadBalancerId, int clusterId, String ip, long createTime) {
        this.port = port;
        this.loadBalancerId = loadBalancerId;
        this.clusterId = clusterId;
        this.ip = ip;
        this.createTime = createTime;
    }

    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public int getLoadBalancerId() {
        return loadBalancerId;
    }
    
    public void setLoadBalancerId(int loadBalancerId) {
        this.loadBalancerId = loadBalancerId;
    }
    
    public int getClusterId() {
        return clusterId;
    }
    
    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }
    
    public String getIp() {
        return ip;
    }
    
    public void setIp(String ip) {
        this.ip = ip;
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
