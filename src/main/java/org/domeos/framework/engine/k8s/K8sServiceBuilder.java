package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.*;

import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerPort;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;
import org.domeos.global.GlobalConstant;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by jackfan on 17/3/1.
 */
public class K8sServiceBuilder {
    private LoadBalancer loadBalancer;
    public K8sServiceBuilder(LoadBalancer loadBalancer) {
        this.loadBalancer = loadBalancer;
    }
    public Service build() {
        if (loadBalancer.getType() == LoadBalancerType.INNER_SERVICE ||
            loadBalancer.getType() == LoadBalancerType.EXTERNAL_SERVICE) {
            return buildService();
        } else {
            return null;
        }
    }
    private Service buildService() {
        Service service = new io.fabric8.kubernetes.api.model.ServiceBuilder()
                .withNewMetadata()
                .withName(GlobalConstant.RC_NAME_PREFIX + loadBalancer.getName())
                .withNamespace(loadBalancer.getNamespace())
                .endMetadata()
                .build();
        // init serivce spec
        ServiceSpec spec = new ServiceSpec();
        if (loadBalancer.getType() == LoadBalancerType.EXTERNAL_SERVICE) {
            List<String> ips = loadBalancer.getExternalIPs();
            spec.setExternalIPs(ips);
        }
        List<LoadBalancerPort> lbPorts = loadBalancer.getServiceDraft().getLbPorts();
        List<ServicePort> servicePorts = new ArrayList<>(lbPorts.size());
        for (LoadBalancerPort port : lbPorts) {
            ServicePort servicePort = new ServicePortBuilder()
                    .withProtocol(port.getProtocol().name())
                    .withPort(port.getPort())
                    .withTargetPort(new IntOrString(port.getTargetPort()))
                    .withName("port" + port.getPort())
                    .build();

            servicePorts.add(servicePort);
        }
        spec.setPorts(servicePorts);
        if (loadBalancer.getType() == LoadBalancerType.EXTERNAL_SERVICE) {
            spec.setType(GlobalConstant.NODE_PORT_STR);
        } else if (loadBalancer.getType() == LoadBalancerType.INNER_SERVICE) {
            spec.setType(GlobalConstant.CLUSTER_IP_STR);
        }
        if(loadBalancer.getServiceDraft().isSessionAffinity()){
            spec.setSessionAffinity("ClientIP");
        }
        spec.setSelector(new K8sLabel(GlobalConstant.DEPLOY_ID_STR,
             String.valueOf(loadBalancer.getServiceDraft().getDeployId())));
        service.setSpec(spec);
        return service;
    }

}