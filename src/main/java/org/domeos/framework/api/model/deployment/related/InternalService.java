package org.domeos.framework.api.model.deployment.related;

import org.domeos.framework.api.model.deployment.related.DeployServiceProtocol;

/**
 * Created by xxs on 16/4/5.
 */
public class InternalService {
    String name;  // name of service port
    DeployServiceProtocol deployServiceProtocol = DeployServiceProtocol.TCP;  // TCP or UDP, default TCP
    int port = -1;  // service port number
    int targetPort;  // pod container port number

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setDeployServiceProtocol(DeployServiceProtocol deployServiceProtocol) {
        this.deployServiceProtocol = deployServiceProtocol;
    }

    public DeployServiceProtocol getDeployServiceProtocol() {
        return deployServiceProtocol;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public int getPort() {
        return port;
    }

    public void setTargetPort(int targetPort) {
        this.targetPort = targetPort;
    }

    public int getTargetPort() {
        return targetPort;
    }

    public String checkLegality() {
        if (port < 1 || port > 65535) {
            return "service port is absent or illegal";
        } else if (targetPort < 1 || targetPort > 65535) {
            return "target port is absent or illegal";
        }
        return "";
    }
}

