package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.Service;
import io.fabric8.kubernetes.api.model.extensions.Ingress;

import org.domeos.exception.K8sDriverException;
import org.domeos.exception.LoadBalancerException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.service.project.impl.KubeServiceInfo;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;

/**
 * Created by jackfan on 2017/3/1.
 */
public class LoadBalancerWrapper {
    private KubeUtils client;

    public LoadBalancerWrapper init(int clusterId, String namespace) throws K8sDriverException {
        Cluster cluster = KubeServiceInfo.getClusterBasicById(clusterId);
        if (cluster == null) {
            throw new K8sDriverException("no such cluster info, id=" + clusterId);
        }

        // TODO: when we have different cluster type, should add more op here
        client = Fabric8KubeUtils.buildKubeUtils(cluster, namespace);
        return this;
    }
    
    public void createLoadBalancerService(LoadBalancer lb) throws LoadBalancerException {
        Service service = new K8sServiceBuilder(lb).build();
        if (service == null) {
            throw new LoadBalancerException("fail create service, lbId=" + lb.getId());
        }
        try {
            client.createService(service);
        } catch (K8sDriverException e) {
            throw new LoadBalancerException("create service exception with message=" + e.getMessage());
        }
    }

    public void deleteLoadBalancerService(LoadBalancer lb) throws LoadBalancerException {
        try {
            Service oldService = client.serviceInfo(GlobalConstant.RC_NAME_PREFIX + lb.getName());
            if (oldService != null) {
                client.deleteService(GlobalConstant.RC_NAME_PREFIX + lb.getName());
            }
        } catch (K8sDriverException e) {
            throw new LoadBalancerException("delete service exception with message=" + e.getMessage());
        }
    }
    
    public void updateLoadBalanceService(LoadBalancer lb) throws LoadBalancerException {
        Service newService = new K8sServiceBuilder(lb).build();
        if (newService == null) {
            throw new LoadBalancerException("fail update service, lbId=" + lb.getId());
        }
        try {
            Service oldService = client.serviceInfo(newService.getMetadata().getName());
            if (oldService == null) {
                client.createService(newService);
            } else {
                client.patchService(newService.getMetadata().getName(), newService);
            }
        } catch (K8sDriverException e) {
            throw new LoadBalancerException("fail update service with message=" + e.getMessage());
        }
    }
    
    public Service getLoadBalancerService(LoadBalancer lb) throws LoadBalancerException {
        if (lb == null || StringUtils.isBlank(lb.getName())) {
            return null;
        }
        return getLoadBalancerService(lb.getName());
    }
    
    public Service getLoadBalancerService(String name) throws LoadBalancerException {
        try {
            if (StringUtils.isBlank(name)) {
                return null;
            }
            return client.serviceInfo(GlobalConstant.RC_NAME_PREFIX + name);
        } catch (K8sDriverException e) {
            throw new LoadBalancerException(e.getMessage());
        }
    }
    
    public void createIngress(LoadBalancer lb) throws LoadBalancerException {
        Ingress ingress = new K8sIngressBuilder(lb).build();
        if (ingress == null) {
            throw new LoadBalancerException("fail create ingress, lbId=" + lb.getId());
        }
        try {
            client.createIngress(ingress);
        } catch (K8sDriverException e) {
            throw new LoadBalancerException("create ingress exception with message=" + e.getMessage());
        }
    }
    
    public void deleteIngress(LoadBalancer lb) throws LoadBalancerException {
        try {
            Ingress oldIngress = client.ingressInfo(GlobalConstant.RC_NAME_PREFIX + lb.getName() + "-lb");
            if (oldIngress != null) {
                client.deleteIngress(GlobalConstant.RC_NAME_PREFIX + lb.getName() + "-lb");
            }
        } catch (K8sDriverException e) {
            throw new LoadBalancerException("delete ingress exception with message=" + e.getMessage());
        }
    }
    
    public void updateIngress(LoadBalancer lb) throws LoadBalancerException {
        Ingress newIngress = new K8sIngressBuilder(lb).build();
        if (newIngress == null) {
            throw new LoadBalancerException("fail create ingress, lbId=" + lb.getId());
        }
        try {
            Ingress oldIngress = client.ingressInfo(GlobalConstant.RC_NAME_PREFIX + lb.getName() + "-lb");
            if (oldIngress == null) {
                client.createIngress(newIngress);
            } else {
                client.patchIngress(oldIngress.getMetadata().getName(), newIngress);
            }
        } catch (K8sDriverException e) {
            throw new LoadBalancerException("fail update ingress with message=" + e.getMessage());
        }
        
    }
}
