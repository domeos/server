package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.domeos.framework.api.consolemodel.deployment.VolumeMountConsole;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.deployment.related.VolumeType;
import org.domeos.framework.api.model.loadBalancer.related.ForwardingRule;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerMethod;
import org.domeos.util.StringUtils;

/**
 * Created by jackfan on 17/2/27.
 */
public class NginxDraft {
    private int listenPort;
    private String registry;
    private String image;
    private String tag;
    private LoadBalancerMethod lbMethod;
    private double cpu;
    private double mem;
    private List<LabelSelector> selectors; //test or product env
    private VolumeMountConsole volumeConsole;
    private List<ForwardingRule> rules;
    private int deployIdForLB;
    
    public int getListenPort() {
        return listenPort;
    }
    
    public void setListenPort(int listenPort) {
        this.listenPort = listenPort;
    }
    
    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        this.registry = registry;
    }

    public String getImage() {
        return image;
    }
    
    public void setImage(String image) {
        this.image = image;
    }
    
    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }
    
    public LoadBalancerMethod getLbMethod() {
        return lbMethod;
    }
    
    public void setLbMethod(LoadBalancerMethod lbMethod) {
        this.lbMethod = lbMethod;
    }
    
    public double getCpu() {
        return cpu;
    }
    
    public void setCpu(double cpu) {
        this.cpu = cpu;
    }
    
    public double getMem() {
        return mem;
    }
    
    public void setMem(double mem) {
        this.mem = mem;
    }
    
    public VolumeMountConsole getVolumeConsole() {
        return volumeConsole;
    }

    public void setVolumeConsole(VolumeMountConsole volumeConsole) {
        this.volumeConsole = volumeConsole;
    }

    public List<ForwardingRule> getRules() {
        return rules;
    }
    
    public void setRules(List<ForwardingRule> rules) {
        this.rules = rules;
    }
    
    public List<LabelSelector> getSelectors() {
        return selectors;
    }

    public void setSelectors(List<LabelSelector> selectors) {
        this.selectors = selectors;
    }
    
    public int getDeployIdForLB() {
        return deployIdForLB;
    }

    public void setDeployIdForLB(int deployIdForLB) {
        this.deployIdForLB = deployIdForLB;
    }

    public String checkLegality() {
        String error = "";
        if (listenPort < 1 || listenPort > 65535 ) {
            error += "listenPort range is 1~65535; ";
        }
        if (StringUtils.isBlank(image)) {
            error += "image is blank; ";
        }
        if (cpu < 0 || mem < 0) {
            error += "cpu or mem is negative; ";
        }
        if (StringUtils.isBlank(registry) || StringUtils.isBlank(image) 
                || StringUtils.isBlank(tag)) {
            error += "registry or image or tag is blank; ";
        }
        if (volumeConsole != null) {
            if (volumeConsole.getVolumeType() == VolumeType.HOSTPATH) {
                if (StringUtils.isBlank(volumeConsole.getHostPath())) {
                    error += "host path must set for volume; ";
                }
            } else if (volumeConsole.getVolumeType() == VolumeType.PERSISTENTVOLUMECLAIM) {
                if (volumeConsole.getVolumePVC() == null) {
                    error += "volume pvc info must be set; ";
                } else  if (StringUtils.isBlank(volumeConsole.getVolumePVC().getClaimName())) {
                    error += "pvc name must be set; ";
                }
            }
        }
        if (selectors == null || selectors.size() == 0) {
            error += "must define test or product env; ";
        }
        if (rules != null) {
            Set<String> set = new HashSet<String>();
            for (ForwardingRule rule : rules) {
                if (!StringUtils.isBlank(rule.checkLegality())) {
                   return error += rule.checkLegality();
                }
                set.add(rule.getDomain());
            }
            if (set.size() != rules.size()) {
                error += "domain must be set different; ";
            }
        }
        return error;
    }
}
