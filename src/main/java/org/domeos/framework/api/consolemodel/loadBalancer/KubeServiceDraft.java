package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.List;

import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerPort;
import org.domeos.util.StringUtils;

/**
* Created by jackfan on 17/2/27.
 */
public class KubeServiceDraft {
    private List<LoadBalancerPort> lbPorts;
    private boolean sessionAffinity;
    private int deployId;
    private String deployName;
    private String deployStatus;
    
    public List<LoadBalancerPort> getLbPorts() {
        return lbPorts;
    }

    public void setLbPorts(List<LoadBalancerPort> lbPorts) {
        this.lbPorts = lbPorts;
    }

    public boolean isSessionAffinity() {
        return sessionAffinity;
    }
    
    public void setSessionAffinity(boolean sessionAffinity) {
        this.sessionAffinity = sessionAffinity;
    }
    
    public int getDeployId() {
        return deployId;
    }

    public void setDeployId(int deployId) {
        this.deployId = deployId;
    }
    
    public String getDeployName() {
        return deployName;
    }

    public void setDeployName(String deployName) {
        this.deployName = deployName;
    }

    public String getDeployStatus() {
        return deployStatus;
    }

    public void setDeployStatus(String deployStatus) {
        this.deployStatus = deployStatus;
    }

    public String checkLegality() {
        String error = "";
        if (lbPorts == null || lbPorts.size() == 0) {
            error += "lbPorts is blank; ";
        } else {
            for (LoadBalancerPort port: lbPorts) {
                if (port.getPort() < 1 || port.getPort() > 65535 ) {
                    error += "port range is 1~65535; ";
                }
                if (port.getTargetPort() < 1 || port.getTargetPort() > 65535 ) {
                    error += "targetPort range is 1~65535; ";
                }
            }
        }
        if (deployId <= 0) {
           error += "deploy id must greater than 0";
        }
        if (StringUtils.isBlank(deployName)) {
            error += "deploy name is blank; ";
        }
        return error;
    }
}
