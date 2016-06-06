package org.domeos.framework.engine.k8s;

import org.domeos.client.kubernetesclient.definitions.v1.ObjectMeta;
import org.domeos.client.kubernetesclient.definitions.v1.ServicePort;
import org.domeos.client.kubernetesclient.definitions.v1.ServiceSpec;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.client.kubernetesclient.definitions.v1.Service;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceProtocol;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalancerPort;
import org.domeos.global.GlobalConstant;

import java.util.List;


/**
 * Created by sparkchen on 16/4/12.
 */
public class ServiceBuilder {
    private LoadBalancer loadBalancer;
    public ServiceBuilder(LoadBalancer loadBalancer) {
        this.loadBalancer = loadBalancer;
    }
    public Service build() {
        if (loadBalancer.getType() == LoadBalanceType.INNER_SERVICE ||
            loadBalancer.getType() == LoadBalanceType.EXTERNAL_SERVICE) {
            return buildService();
        } else {
            return null;
        }
    }
    private Service buildService() {
        Service service = new Service();
        service.putMetadata(new ObjectMeta())
            .getMetadata()
            .putName(GlobalConstant.RC_NAME_PREFIX + loadBalancer.getDnsName())
            .putLabels(new K8sLabel(GlobalConstant.LOAD_BALANCER_ID_STR, String.valueOf(loadBalancer.getId())))
            .putNamespace(loadBalancer.getNamespace())
        ;

        // init rc spec
        ServiceSpec spec = new ServiceSpec();
        if (loadBalancer.getType() == LoadBalanceType.EXTERNAL_SERVICE) {
            List<String> ips = loadBalancer.getExternalIPs();
            spec.setExternalIPs(ips.toArray(new String[ips.size()]));
        }
        ServicePort[] servicePorts = new ServicePort[loadBalancer.getLoadBalancerPorts().size()];
        int i = 0;
        for (LoadBalancerPort port : loadBalancer.getLoadBalancerPorts()) {
            ServicePort servicePort = new ServicePort();
            LoadBalanceProtocol protocol = port.getProtocol();
            if (protocol == null) {
                protocol = LoadBalanceProtocol.TCP;
            }
            servicePort.putProtocol(protocol.toString())
                .putPort(port.getPort())
                .putTargetPort(port.getTargetPort())
                .putName("port" + port.getPort());
            servicePorts[i] = servicePort;
            i++;
        }
        spec.setPorts(servicePorts);
        if (loadBalancer.getType() == LoadBalanceType.EXTERNAL_SERVICE) {
            spec.setType(GlobalConstant.NODE_PORT_STR);
        } else if (loadBalancer.getType() == LoadBalanceType.INNER_SERVICE) {
            spec.setType(GlobalConstant.CLUSTER_IP_STR);
        }
        spec.setSelector(new K8sLabel(GlobalConstant.WITH_LB_PREFIX + loadBalancer.getId(), GlobalConstant.WITH_LB_VALUE));
        service.setSpec(spec);
        return service;
    }

}
