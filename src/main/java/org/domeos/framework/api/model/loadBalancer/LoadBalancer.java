package org.domeos.framework.api.model.loadBalancer;

import java.util.List;

import org.domeos.framework.api.consolemodel.loadBalancer.KubeServiceDraft;
import org.domeos.framework.api.consolemodel.loadBalancer.NginxDraft;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;
import org.domeos.framework.engine.model.RowModelBase;

/**
 * Created by jackfan on 17/2/28.
 */
public class LoadBalancer extends RowModelBase {
    private LoadBalancerType type;
    private int clusterId;
    private String namespace;
    private KubeServiceDraft serviceDraft;
    private NginxDraft nginxDraft;
    private List<String> externalIPs;
    private long lastUpdateTime = 0;
    
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
    
    public KubeServiceDraft getServiceDraft() {
        return serviceDraft;
    }
    
    public void setServiceDraft(KubeServiceDraft serviceDraft) {
        this.serviceDraft = serviceDraft;
    }
    
    public NginxDraft getNginxDraft() {
        return nginxDraft;
    }
    
    public void setNginxDraft(NginxDraft nginxDraft) {
        this.nginxDraft = nginxDraft;
    }

    public List<String> getExternalIPs() {
        return externalIPs;
    }

    public void setExternalIPs(List<String> externalIPs) {
        this.externalIPs = externalIPs;
    }

    public long getLastUpdateTime() {
        return lastUpdateTime;
    }

    public void setLastUpdateTime(long lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }
    
}
