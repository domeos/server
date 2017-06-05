package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.Comparator;
import java.util.List;

import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;
import org.domeos.util.CommonUtil;
/**
 * Created by jackfan on 17/3/6.
 */
public class LoadBalancerInfo {
    private int id;
    private String name;
    private LoadBalancerType type;
    private String clusterName;
    private String namespace;
    private long lastUpdateTime;
    private long createTime;
    private String dnsName;
    private String state;
    private double cpuTotal;
    private double cpuUsed;
    private double memoryTotal;
    private double memoryUsed;
    private boolean deletable;
    private List<LabelSelector> selectors;
    
    public LoadBalancerInfo(LoadBalancer lb, Cluster cluster){
        this.id = lb.getId();
        this.name = lb.getName();
        this.type = lb.getType();
        this.clusterName = cluster.getName();
        this.namespace = lb.getNamespace();
        this.lastUpdateTime = lb.getLastUpdateTime();
        this.createTime = lb.getCreateTime();
        if (this.type != LoadBalancerType.NGINX) {
            this.dnsName = CommonUtil.generateServiceDnsName(this.namespace, cluster.getDomain(), this.name);
        } else {
            this.state = lb.getState();
            this.selectors = lb.getNginxDraft().getSelectors();
        }
    }
    
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LoadBalancerType getType() {
        return type;
    }

    public void setType(LoadBalancerType type) {
        this.type = type;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public long getLastUpdateTime() {
        return lastUpdateTime;
    }

    public void setLastUpdateTime(long lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }
    
    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String getDnsName() {
        return dnsName;
    }

    public void setDnsName(String dnsName) {
        this.dnsName = dnsName;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
    
    public boolean isDeletable() {
        return deletable;
    }

    public void setDeletable(boolean deletable) {
        this.deletable = deletable;
    }
    
    public double getCpuTotal() {
        return cpuTotal;
    }

    public void setCpuTotal(double cpuTotal) {
        this.cpuTotal = cpuTotal;
    }

    public double getCpuUsed() {
        return cpuUsed;
    }

    public void setCpuUsed(double cpuUsed) {
        this.cpuUsed = cpuUsed;
    }

    public double getMemoryTotal() {
        return memoryTotal;
    }

    public void setMemoryTotal(double memoryTotal) {
        this.memoryTotal = memoryTotal;
    }

    public double getMemoryUsed() {
        return memoryUsed;
    }

    public void setMemoryUsed(double memoryUsed) {
        this.memoryUsed = memoryUsed;
    }
    
    public List<LabelSelector> getSelectors() {
        return selectors;
    }

    public void setSelectors(List<LabelSelector> selectors) {
        this.selectors = selectors;
    }

    public static class LoadBalancerInfoComparator  implements Comparator<LoadBalancerInfo> {
        @Override
        public int compare(LoadBalancerInfo o1, LoadBalancerInfo o2) {
            if (o2.getCreateTime() - o1.getCreateTime() > 0) {
                return 1;
            } else if (o2.createTime - o1.createTime < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
