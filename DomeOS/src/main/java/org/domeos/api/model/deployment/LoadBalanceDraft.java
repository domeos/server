package org.domeos.api.model.deployment;

import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.deployment.related.LoadBalanceType;
import sun.net.util.IPAddressUtil;

import java.util.List;

/**
 */
public class LoadBalanceDraft {
    int id;
    String name;
    int port; // service port
    int targetPort; // container port
    long deployId;
    List<String> externalIPs;
    LoadBalanceType type; // tcp or http
    int clusterId;

    public LoadBalanceDraft() {
    }

    public LoadBalanceDraft(LoadBalancer loadBalancer) {
        id = loadBalancer.getId();
        name = loadBalancer.getName();
        port = loadBalancer.getPort();
        targetPort = loadBalancer.getTargetPort();
        externalIPs = loadBalancer.getExternalIPs();
        if (loadBalancer.getType() == org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType.NGINX) {
            type = LoadBalanceType.HTTP;
        } else {
            type = LoadBalanceType.TCP;
        }
        clusterId = loadBalancer.getClusterId();
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

    public long getDeployId() {
        return deployId;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public List<String> getExternalIPs() {
        return externalIPs;
    }

    public void setExternalIPs(List<String> externalIPs) {
        this.externalIPs = externalIPs;
    }

    public LoadBalanceType getType() {
        return type;
    }

    public void setType(LoadBalanceType type) {
        this.type = type;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
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
