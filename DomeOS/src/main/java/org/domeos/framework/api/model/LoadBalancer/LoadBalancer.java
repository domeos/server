package org.domeos.framework.api.model.LoadBalancer;

import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceProtocol;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.engine.model.RowModelBase;
import sun.net.util.IPAddressUtil;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by xupeng on 16-4-5.
 */
public class LoadBalancer extends RowModelBase {

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
    LoadBalanceProtocol protocol; // tcp or http
    int clusterId; // used for unique cluster and port
    String dnsName;  // domain name
    List<Deployment> deploys;

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

    public static Set<String> getToExclude() {
        return toExclude;
    }

    public static void setToExclude(Set<String> toExclude) {
        LoadBalancer.toExclude = toExclude;
    }

    public String checkLegality() {
        if (clusterId <= 0) {
            return "cluster id less than 0";
        } else if (externalIPs == null || externalIPs.size() == 0) {
        //     return "do not have external ip info";
            return "";  // for stateful deployment
        } else {
            for (String ip : externalIPs) {
                if (!IPAddressUtil.isIPv4LiteralAddress(ip)) {
                    return ip + " is not a valid ip address";
                }
            }
        }
        return "";
    }

    public String checkExternalIPs() {
        if (externalIPs == null || externalIPs.size() < 1) {
            return "externalIPs is empty";
        }
        return "";
    }
}
