package org.domeos.api.model.deployment;

import org.apache.commons.lang.StringUtils;
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
    String clusterName;

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

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(clusterName)) {
            return "cluster name is empty";
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
}
