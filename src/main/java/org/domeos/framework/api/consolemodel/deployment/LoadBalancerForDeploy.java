package org.domeos.framework.api.consolemodel.deployment;

import java.util.Comparator;
import java.util.List;

import org.domeos.framework.api.consolemodel.loadBalancer.KubeServiceDraft;
import org.domeos.framework.api.consolemodel.loadBalancer.NginxDraft;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;

/**
* Created by jackfan on 17/3/13.
 */
public class LoadBalancerForDeploy {
    private int lbId;
    private int lbcId;
    private String lbName;
    private LoadBalancerType lbType;
    private String dnsName;
    private List<String> externalIPs;
    private KubeServiceDraft serviceDraft;
    private NginxDraft nginxDraft;
    private int comparator;
    public LoadBalancerForDeploy(LoadBalancer lb) {
        this.lbId = lb.getId();
        this.lbName = lb.getName();
        this.lbType = lb.getType();
        this.externalIPs = lb.getExternalIPs();
        this.serviceDraft = lb.getServiceDraft();
        this.nginxDraft = lb.getNginxDraft();
        if (lb.getType() == LoadBalancerType.INNER_SERVICE) {
            this.comparator = 3;
        } else if (lb.getType() == LoadBalancerType.EXTERNAL_SERVICE) {
            this.comparator = 2;
        } else {
            this.comparator = 1;
        }
    }
    
    public int getLbId() {
        return lbId;
    }
    
    public void setLbId(int lbId) {
        this.lbId = lbId;
    }
    
    public String getLbName() {
        return lbName;
    }

    public void setLbName(String lbName) {
        this.lbName = lbName;
    }

    public int getLbcId() {
        return lbcId;
    }
    
    public void setLbcId(int lbcId) {
        this.lbcId = lbcId;
    }
    
    public LoadBalancerType getLbType() {
        return lbType;
    }
    
    public void setLbType(LoadBalancerType lbType) { 
        this.lbType = lbType;
    }
    
    public String getDnsName() {
        return dnsName;
    }
    
    public void setDnsName(String dnsName) {
        this.dnsName = dnsName;
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
    
    public NginxDraft getNginxDraft() {
        return nginxDraft;
    }
    
    public void setNginxDraft(NginxDraft nginxDraft) {
        this.nginxDraft = nginxDraft;
    }
    
    public int getComparator() {
        return comparator;
    }

    public void setComparator(int comparator) {
        this.comparator = comparator;
    }

    public static class LoadBalancerForDeployComparator implements Comparator<LoadBalancerForDeploy> {
        @Override
        public int compare(LoadBalancerForDeploy o1, LoadBalancerForDeploy o2) {
            if (o2.getComparator() - o1.getComparator() > 0) {
                return 1;
            } else if (o2.getComparator() - o1.getComparator() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
