package org.domeos.framework.api.model.deployment.related;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.domeos.framework.api.consolemodel.loadBalancer.KubeServiceDraft;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerPort;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;

public class LoadBalancerForDeployDraft {
    private List<LoadBalancerPort> loadBalancerPorts;
    private boolean sessionAffinity;

    public LoadBalancerForDeployDraft() {
    }
    
    public List<LoadBalancerPort> getLoadBalancerPorts() {
        return loadBalancerPorts;
    }

    public void setLoadBalancerPorts(List<LoadBalancerPort> loadBalancerPorts) {
        this.loadBalancerPorts = loadBalancerPorts;
    }
    
    public boolean isSessionAffinity() {
        return sessionAffinity;
    }

    public void setSessionAffinity(boolean sessionAffinity) {
        this.sessionAffinity = sessionAffinity;
    }
    
    public LoadBalancer toLoadBalancer(Deployment deployment) {
        LoadBalancer loadBalancer = new LoadBalancer();
        loadBalancer.setName(deployment.getName());
        loadBalancer.setClusterId(deployment.getClusterId());
        loadBalancer.setNamespace(deployment.getNamespace());
        loadBalancer.setType(LoadBalancerType.INNER_SERVICE);
        KubeServiceDraft serviceDraft = new KubeServiceDraft();
        serviceDraft.setLbPorts(this.loadBalancerPorts);
        serviceDraft.setDeployId(deployment.getId());
        serviceDraft.setDeployName(deployment.getName());
        serviceDraft.setDeployStatus(deployment.getState());
        serviceDraft.setSessionAffinity(this.sessionAffinity);
        loadBalancer.setServiceDraft(serviceDraft);
        loadBalancer.setCreateTime(System.currentTimeMillis());
        loadBalancer.setLastUpdateTime(loadBalancer.getCreateTime());
        loadBalancer.setState(DeploymentStatus.STOP.name());
        return loadBalancer;
    }

    public String checkLegality() {
        if (loadBalancerPorts == null || loadBalancerPorts.size() == 0) {
            return "do not have port info";
        } else {
            Set<Integer> portSet = new HashSet<Integer>();
            for (LoadBalancerPort port: loadBalancerPorts) {
                if (port.getPort() < 1 || port.getPort() > 65535 ) {
                    return "port range is 1~65535; ";
                }
                if (port.getTargetPort() < 1 || port.getTargetPort() > 65535 ) {
                    return "targetPort range is 1~65535; ";
                }
                portSet.add(port.getPort());
            }
            if (loadBalancerPorts.size() != portSet.size()) {
                return "loadBalancer port must be different; ";
            }
        }

        return "";
    }
}
