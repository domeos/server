package org.domeos.framework.api.model.loadBalancer;

import java.util.HashSet;
import java.util.Set;

import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.engine.model.RowModelBase;

/**
 * Created by jackfan on 17/2/28.
 */
public class LoadBalancerEvent extends RowModelBase {
    
    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public static Set<String> toExclude = new HashSet<String>() {{
        addAll(RowModelBase.toExclude);
        add("loadBalancerId");
    }};
    
    private int loadBalancerId;
    private DeployOperation operation;
    private long statusExpire;
    private int userId;
    private String userName;
    private String message;
    
    public int getLoadBalancerId() {
        return loadBalancerId;
    }
    public void setLoadBalancerId(int loadBalancerId) {
        this.loadBalancerId = loadBalancerId;
    }
    public DeployOperation getOperation() {
        return operation;
    }
    public void setOperation(DeployOperation operation) {
        this.operation = operation;
    }
    public long getStatusExpire() {
        return statusExpire;
    }
    public void setStatusExpire(long statusExpire) {
        this.statusExpire = statusExpire;
    }
    public int getUserId() {
        return userId;
    }
    public void setUserId(int userId) {
        this.userId = userId;
    }
    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    
}
