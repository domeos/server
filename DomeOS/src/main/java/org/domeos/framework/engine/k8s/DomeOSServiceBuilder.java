package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.*;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceProtocol;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalancerPort;
import org.domeos.global.GlobalConstant;

import java.util.ArrayList;
import java.util.List;


/**
 * Created by sparkchen on 16/4/12.
 */
public class DomeOSServiceBuilder {
    private LoadBalancer loadBalancer;
    public DomeOSServiceBuilder(LoadBalancer loadBalancer) {
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
        Service service = new io.fabric8.kubernetes.api.model.ServiceBuilder()
                .withNewMetadata()
                .withName(GlobalConstant.RC_NAME_PREFIX + loadBalancer.getDnsName())
                .addToLabels(GlobalConstant.LOAD_BALANCER_ID_STR, String.valueOf(loadBalancer.getId()))
                .withNamespace(loadBalancer.getNamespace())
                .endMetadata()
                .build();

        // init rc spec
        ServiceSpec spec = new ServiceSpec();
        if (loadBalancer.getType() == LoadBalanceType.EXTERNAL_SERVICE) {
            List<String> ips = loadBalancer.getExternalIPs();
            spec.setExternalIPs(ips);
        }
        List<ServicePort> servicePorts = new ArrayList<>(loadBalancer.getLoadBalancerPorts().size());
        for (LoadBalancerPort port : loadBalancer.getLoadBalancerPorts()) {
            LoadBalanceProtocol protocol = port.getProtocol();
            if (protocol == null) {
                protocol = LoadBalanceProtocol.TCP;
            }
            ServicePort servicePort = new ServicePortBuilder()
                    .withProtocol(protocol.toString())
                    .withPort(port.getPort())
                    .withTargetPort(new IntOrString(port.getTargetPort()))
                    .withName("port" + port.getPort())
                    .build();

            servicePorts.add(servicePort);
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
