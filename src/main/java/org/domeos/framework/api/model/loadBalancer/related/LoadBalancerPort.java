package org.domeos.framework.api.model.loadBalancer.related;

/**
 * Created by jackfan on 17/2/27.
 */
public class LoadBalancerPort {
    private int port;
    private int targetPort;
    private LoadBalancerProtocol protocol = LoadBalancerProtocol.TCP; // tcp or udp

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

    public LoadBalancerProtocol getProtocol() {
        return protocol;
    }

    public void setProtocol(LoadBalancerProtocol protocol) {
        this.protocol = protocol;
    }
}
