package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import org.domeos.framework.api.consolemodel.deployment.ContainerConsole;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.consolemodel.deployment.VolumeMountConsole;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.model.deployment.related.DeploymentType;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.deployment.related.NetworkMode;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;

/**
 * Created by jackfan on 17/2/24.
 */
public class LoadBalancerDraft {
    private int id;
    private String name;
    private String description;
    private LoadBalancerType type;
    private int clusterId;
    private String namespace;
    private int lbcId;
    private List<String> externalIPs;
    private KubeServiceDraft serviceDraft;
    private NginxDraft nginxDraft;
    
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LoadBalancerType getType() {
        return type;
    }

    public void setType(LoadBalancerType type) {
        this.type = type;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public int getLbcId() {
        return lbcId;
    }

    public void setLbcId(int lbcId) {
        this.lbcId = lbcId;
    }
    
    public KubeServiceDraft getServiceDraft() {
        return serviceDraft;
    }

    public void setServiceDraft(KubeServiceDraft serviceDraft) {
        this.serviceDraft = serviceDraft;
    }

    public NginxDraft getNginxDraft() {
        return nginxDraft;
    }

    public void setNginxDraft(NginxDraft nginxDraft) {
        this.nginxDraft = nginxDraft;
    }
    
    public List<String> getExternalIPs() {
        return externalIPs;
    }

    public void setExternalIPs(List<String> externalIPs) {
        this.externalIPs = externalIPs;
    }

    public LoadBalancer toLoadBalancer() {
        LoadBalancer lb = new LoadBalancer();
        lb.setId(this.id);
        lb.setName(this.name);
        lb.setDescription(this.description);
        lb.setClusterId(this.clusterId);
        lb.setNamespace(this.namespace);
        lb.setType(this.type);
        lb.setExternalIPs(this.externalIPs);
        lb.setServiceDraft(this.serviceDraft);
        lb.setNginxDraft(this.nginxDraft);
        lb.setCreateTime(System.currentTimeMillis());
        lb.setLastUpdateTime(lb.getCreateTime());
        lb.setState(DeploymentStatus.STOP.name());
        return lb;
    }
    
    public DeploymentDraft toDeploymentDraft(String apiserver) {
        List<ContainerConsole> containerDrafts = new LinkedList<ContainerConsole>();
        DeploymentDraft deploymentDraft = new DeploymentDraft();
        
        ContainerConsole nginxContainerDraft = new ContainerConsole();
        nginxContainerDraft.setRegistry(this.nginxDraft.getRegistry());
        nginxContainerDraft.setImage(this.nginxDraft.getImage());
        nginxContainerDraft.setTag(this.nginxDraft.getTag());
        nginxContainerDraft.setCpu(this.nginxDraft.getCpu());
        nginxContainerDraft.setMem(this.nginxDraft.getMem());
        
        List<EnvDraft> nginxEnvDrafts = new LinkedList<>();
        nginxEnvDrafts.add(new EnvDraft("LBMETHOD", this.nginxDraft.getLbMethod().getMethod()));
        nginxEnvDrafts.add(new EnvDraft("LISTENPORT", String.valueOf(this.nginxDraft.getListenPort())));
        nginxContainerDraft.setEnvs(nginxEnvDrafts);
        List<String> args = new ArrayList<String>();
        args.add("/nginx-ingress-controller");
        args.add("--apiserver-host=" + apiserver);
        args.add("--watch-namespace=" + this.namespace);
        args.add("--election-id=" + GlobalConstant.WITH_NEWLB_PREFIX + this.name);
        args.add("--ingress-class=" + GlobalConstant.WITH_NEWLB_PREFIX + this.name);
        nginxContainerDraft.setArgs(args);
        
        VolumeMountConsole volumeMountConsole = this.nginxDraft.getVolumeConsole();
        if (volumeMountConsole != null) {
            List<VolumeMountConsole> volumeMountConsoles = new LinkedList<VolumeMountConsole>();
            volumeMountConsole.setContainerPath("/var/log/nginx/");
            volumeMountConsole.setName(GlobalConstant.RC_NAME_PREFIX + "log-volume");
            volumeMountConsoles.add(volumeMountConsole);
            nginxContainerDraft.setVolumeMountConsoles(volumeMountConsoles);
        }
        containerDrafts.add(nginxContainerDraft);
        
        deploymentDraft.setDeploymentType(DeploymentType.DAEMONSET);
        deploymentDraft.setReplicas(this.externalIPs.size());
        deploymentDraft.setHostList(this.externalIPs);
        deploymentDraft.setClusterId(this.clusterId);
        deploymentDraft.setNamespace(this.namespace);
        deploymentDraft.setContainerConsoles(containerDrafts);
        deploymentDraft.setCreateTime(System.currentTimeMillis());
        deploymentDraft.setCreatorId(CurrentThreadInfo.getUserId());
        deploymentDraft.setDeployName(this.getName() + GlobalConstant.LOADBALANCER_SUFFIX);
        deploymentDraft.setNetworkMode(NetworkMode.HOST);
        deploymentDraft.setExposePortNum(1);
        deploymentDraft.setDescription("LOADBALANCER-NGINX");
        List<LabelSelector> selectors = new ArrayList<LabelSelector>();
        selectors.addAll( this.getNginxDraft().getSelectors());
        deploymentDraft.setLabelSelectors(selectors);
        deploymentDraft.setScalable(false);
        deploymentDraft.setStateful(false);
        return deploymentDraft;
    }
    
    public String checkLegality() {
        String error = "";
        if (StringUtils.isBlank(name)) {
            error += "loadBalancer name is blank; ";
        } else if (name.length() > 20) {
            error = "loadBalancer name must less than 20 chars; ";
        } else if (!StringUtils.checkDnsNamePattern(name)) {
            error = "loadBalancer name should start and end with [a-z0-9], only contains [-a-z0-9.]; ";
        }
        if (StringUtils.isBlank(namespace)) {
            error += "namespace is blank; ";
        }
        if (clusterId <= 0) {
            error += "clusterId must greater than 0; ";
        }
        if (lbcId <= 0) {
            error += "lbcId must greater than 0; ";
        }
        if (externalIPs == null || externalIPs.size() == 0) {
            error += "externalIPs is blank; ";
        } else {
            Set<String> set = new HashSet<String>();
            for (String ip : externalIPs) {
                set.add(ip);
            }
            if (set.size() != externalIPs.size()) {
                error += "externalIPs must be set different; ";
            }
        }
        if (type == null) {
            error += "loadBalancer type is blank; ";
        } else {
            if (type == LoadBalancerType.EXTERNAL_SERVICE) {
                if (serviceDraft == null) {
                    error += "serviceDraft is blank; ";
                } else {
                    error += serviceDraft.checkLegality();
                }
            }
            if (type == LoadBalancerType.NGINX) {
                if (nginxDraft == null) {
                    error += "nginxDraft is blank; ";
                } else {
                    error += nginxDraft.checkLegality();
                }
            }
        }
        return error;
    }
    
}
