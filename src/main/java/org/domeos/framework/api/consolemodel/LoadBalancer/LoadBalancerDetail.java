package org.domeos.framework.api.consolemodel.LoadBalancer;

import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalancerPort;
import org.domeos.framework.api.model.deployment.Deployment;

import java.util.List;

/**
 * Created by xxs on 16/5/9.
 */
public class LoadBalancerDetail {
    List<LoadBalancerPort> loadBalancerPorts;
    LoadBalanceType type;
    List<String> externalIPs;
    int clusterId;
    String namespace;
    String dnsName;  // domain name
    List<Deployment> deploys;

    public List<LoadBalancerPort> getLoadBalancerPorts() {
        return loadBalancerPorts;
    }

    public void setLoadBalancerPorts(List<LoadBalancerPort> loadBalancerPorts) {
        this.loadBalancerPorts = loadBalancerPorts;
    }

    public LoadBalanceType getType() {
        return type;
    }

    public void setType(LoadBalanceType type) {
        this.type = type;
    }

    public List<String> getExternalIPs() {
        return externalIPs;
    }

    public void setExternalIPs(List<String> externalIPs) {
        this.externalIPs = externalIPs;
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

    public String getDnsName() {
        return dnsName;
    }

    public void setDnsName(String dnsName) {
        this.dnsName = dnsName;
    }

    public List<Deployment> getDeploys() {
        return deploys;
    }

    public void setDeploys(List<Deployment> deploys) {
        this.deploys = deploys;
    }
}
