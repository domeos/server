package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.related.InnerServiceProtocol;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;

/**
 * Created by xxs on 16/3/23.
 */
public class InnerServiceDraft {
    long id;
    long deployId = -1;
    String name;  // name of service port
    InnerServiceProtocol protocol = InnerServiceProtocol.TCP;  // TCP or UDP, default TCP
    int port = -1;  // service port number
    int targetPort;  // pod container port number

    public InnerServiceDraft() {
    }

    public InnerServiceDraft(LoadBalancer loadBalancer) {
        name = loadBalancer.getName();
        port = loadBalancer.getPort();
        targetPort = loadBalancer.getTargetPort();
        protocol = InnerServiceProtocol.valueOf(loadBalancer.getProtocol().toString());
    }


    public void setId(long id) {
        this.id = id;
    }

    public long getId() {
        return id;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public InnerServiceProtocol getProtocol() {
        return protocol;
    }

    public void setProtocol(InnerServiceProtocol protocol) {
        this.protocol = protocol;
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
            return "port is absent or illegal";
        } else if (targetPort < 1 || targetPort > 65535) {
            return "targetPort is absent or illegal";
        }
        return "";
    }
}
