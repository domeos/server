package org.domeos.framework.api.model.loadBalancer;

import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerCollectionType;
import org.domeos.framework.engine.model.RowModelBase;

/**
 * Created by jackfan on 17/2/24.
 */
public class LoadBalancerCollection extends RowModelBase{
    private int creatorId;
    private LoadBalancerCollectionType type;
    
    public LoadBalancerCollection() {
    }

    public int getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(int creatorId) {
        this.creatorId = creatorId;
    }

    public LoadBalancerCollectionType getType() {
        return type;
    }

    public void setType(LoadBalancerCollectionType type) {
        this.type = type;
    }

}
