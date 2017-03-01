package org.domeos.framework.api.model.LoadBalancer;

import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceProtocol;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.engine.model.RowModelBase;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by xxs on 16/4/28.
 */
public class LoadBalancerV1 extends RowModelBase {
    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public static Set<String> toExclude = new HashSet<String>() {{
        addAll(RowModelBase.toExclude);
        add("deploys");
    }};

    int port; // service port
    int targetPort; // container port
    LoadBalanceType type;
    List<String> externalIPs;
    LoadBalanceProtocol protocol;
    int clusterId;
    String namespace;
    String dnsName;
    List<Deployment> deploys;

    public static Set<String> getToExclude() {
        return toExclude;
    }

    public static void setToExclude(Set<String> toExclude) {
        LoadBalancerV1.toExclude = toExclude;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public int getTargetPort() {
        return targetPort;
    }

    public void setTargetPort(int targetPort) {
        this.targetPort = targetPort;
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

    public LoadBalanceProtocol getProtocol() {
        return protocol;
    }

    public void setProtocol(LoadBalanceProtocol protocol) {
        this.protocol = protocol;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
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
