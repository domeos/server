package org.domeos.framework.api.model.LoadBalancer.related;

/**
 * Created by xxs on 16/5/9.
 */
public class LoadBalancerPort {
    int port;
    int targetPort;
    LoadBalanceProtocol protocol; // tcp or http

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

    public LoadBalanceProtocol getProtocol() {
        return protocol;
    }

    public void setProtocol(LoadBalanceProtocol protocol) {
        this.protocol = protocol;
    }
}
