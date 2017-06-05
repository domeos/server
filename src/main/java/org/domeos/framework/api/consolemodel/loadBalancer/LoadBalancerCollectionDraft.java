package org.domeos.framework.api.consolemodel.loadBalancer;

import org.domeos.framework.api.model.loadBalancer.LoadBalancerCollection;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerCollectionType;
import org.domeos.util.StringUtils;


/**
 * Created by jackfan on 17/2/24.
 */
public class LoadBalancerCollectionDraft {
    private int id;
    private String name;
    private String description;
    private LoadBalancerCollectionType type;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    
    public LoadBalancerCollectionType getType() {
        return type;
    }

    public void setType(LoadBalancerCollectionType type) {
        this.type = type;
    }

    public String checkLegality() {
        String error = "";
        if (StringUtils.isBlank(name)) {
            error += "loadBalancer collection name is blank; ";
        }
        if (type == null) {
            error += "loadBalancer collection type is blank; ";
        }
        return error;
    }
    
    public LoadBalancerCollection toLoadBalancerConnection() {
        LoadBalancerCollection lbc = new LoadBalancerCollection();
        lbc.setName(this.name);
        lbc.setDescription(this.description);
        lbc.setCreateTime(System.currentTimeMillis());
        lbc.setType(this.type);
        return lbc;
    }
}
