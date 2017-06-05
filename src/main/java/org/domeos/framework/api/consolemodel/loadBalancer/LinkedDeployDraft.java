package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.List;

/**
* Created by jackfan on 17/3/13.
 */
public class LinkedDeployDraft {
    private int deployId;
    private String deployName;
    private String deployStatus;
    private String innerServiceName;
    private List<Integer> ports;
    
    public LinkedDeployDraft(){
    }
    
    public LinkedDeployDraft(int deployId, String deployName, String deployStatus) {
        super();
        this.deployId = deployId;
        this.deployName = deployName;
        this.deployStatus = deployStatus;
    }
    
    public LinkedDeployDraft(int deployId, String deployName, String deployStatus, 
                            String innerServiceName, List<Integer> ports) {
        super();
        this.deployId = deployId;
        this.deployName = deployName;
        this.deployStatus = deployStatus;
        this.innerServiceName = innerServiceName;
        this.ports = ports;
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

    public String getInnerServiceName() {
        return innerServiceName;
    }

    public void setInnerServiceName(String innerServiceName) {
        this.innerServiceName = innerServiceName;
    }

    public List<Integer> getPorts() {
        return ports;
    }

    public void setPorts(List<Integer> ports) {
        this.ports = ports;
    }
}
