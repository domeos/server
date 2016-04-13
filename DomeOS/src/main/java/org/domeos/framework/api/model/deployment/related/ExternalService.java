package org.domeos.framework.api.model.deployment.related;

import org.domeos.framework.api.model.deployment.related.DeployServiceProtocol;
import sun.net.util.IPAddressUtil;

import java.util.List;

/**
 * Created by xxs on 16/4/5.
 */
public class ExternalService {
    String name; // name of service port
    DeployServiceProtocol deployServiceProtocol = DeployServiceProtocol.TCP;
    int port; // service port
    int targetPort; // container port
    List<String> externalIPs;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DeployServiceProtocol getDeployServiceProtocol() {
        return deployServiceProtocol;
    }

    public void setDeployServiceProtocol(DeployServiceProtocol deployServiceProtocol) {
        this.deployServiceProtocol = deployServiceProtocol;
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

    public List<String> getExternalIPs() {
        return externalIPs;
    }

    public void setExternalIPs(List<String> externalIPs) {
        this.externalIPs = externalIPs;
    }

    public String checkLegality() {
        if (port < 1 || port > 65535) {
            return "service port is absent or illegal";
        } else if (targetPort < 1 || targetPort > 65535) {
            return "target port is absent or illegal";
        } else if (externalIPs == null || externalIPs.size() < 1) {
            return "externalIPs is empty";
        } else {
            for (String ip : externalIPs) {
                if (!IPAddressUtil.isIPv4LiteralAddress(ip)) {
                    return ip + "is not a valid ip address";
                }
            }
        }
        return "";
    }
}
