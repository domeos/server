package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.List;

import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;

/**
 * Created by jackfan on 17/3/7.
 */
public class LoadBalancerDetail {
    private int id;
    private String name;
    private String description;
    private LoadBalancerType type;
    private int clusterId;
    private String clusterName;
    private String namespace;
    private List<String> externalIPs;
    private String dnsName;
    private KubeServiceDraft serviceDraft;
    private NginxDetailDraft nginxDraft;
    private long lastUpdateTime;
    private String state;
    private Role role;
    
    public LoadBalancerDetail(LoadBalancer lb) {
        this.id = lb.getId();
        this.name = lb.getName();
        this.description = lb.getDescription();
        this.type = lb.getType();
        this.clusterId = lb.getClusterId();
        this.namespace = lb.getNamespace();
        this.externalIPs = lb.getExternalIPs();
        this.serviceDraft = lb.getServiceDraft();
        this.lastUpdateTime = lb.getLastUpdateTime();
        this.state = lb.getState();
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
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    public LoadBalancerType getType() {
        return type;
    }
    
    public void setType(LoadBalancerType type) {
        this.type = type;
    }
    
    public int getClusterId() {
        return clusterId;
    }
    
    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }
    public String getNamespace() {
        return namespace;
    }
    
    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }
    
    public List<String> getExternalIPs() {
        return externalIPs;
    }
    public void setExternalIPs(List<String> externalIPs) {
        this.externalIPs = externalIPs;
    }
    
    public KubeServiceDraft getServiceDraft() {
        return serviceDraft;
    }
    public void setServiceDraft(KubeServiceDraft serviceDraft) {
        this.serviceDraft = serviceDraft;
    }
    
    public NginxDetailDraft getNginxDraft() {
        return nginxDraft;
    }

    public void setNginxDraft(NginxDetailDraft nginxDraft) {
        this.nginxDraft = nginxDraft;
    }

    public String getState() {
        return state;
    }
    
    public void setState(String state) {
        this.state = state;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public String getClusterName() {
        return clusterName;
    }
    
    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }
    
    public long getLastUpdateTime() {
        return lastUpdateTime;
    }
    
    public void setLastUpdateTime(long lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }

    public String getDnsName() {
        return dnsName;
    }

    public void setDnsName(String dnsName) {
        this.dnsName = dnsName;
    }
}
