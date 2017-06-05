package org.domeos.framework.api.model.loadBalancer.related;

import org.domeos.util.StringUtils;
/**
 * Created by jackfan on 2017/2/27.
 */
public class ForwardingRule {
    private String domain;
    private int deployId;
    private String deployName;
    private String deployStatus;
    private String serviceName;
    private int servicePort;
    
    public String getDomain() {
        return domain;
    }
    
    public void setDomain(String domain) {
        this.domain = domain;
    }
    
    public int getDeployId() {
        return deployId;
    }

    public void setDeployId(int deployId) {
        this.deployId = deployId;
    }

    public int getServicePort() {
        return servicePort;
    }

    public void setServicePort(int servicePort) {
        this.servicePort = servicePort;
    }
    
    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
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
        if (StringUtils.isBlank(domain)) {
            error += "domain is blank; ";
        }
        if (deployId <= 0) {
            error += "deploy id less than 0; ";
        }
        if (StringUtils.isBlank(deployName)) {
            error += "deploy name is blank; ";
        }
        if (StringUtils.isBlank(serviceName)) {
            error += "service name is blank; ";
        }
        if (servicePort < 1 || servicePort > 65535) {
            error += "deploy port range is 1~65535; ";
        }
        return error;
    }
}
