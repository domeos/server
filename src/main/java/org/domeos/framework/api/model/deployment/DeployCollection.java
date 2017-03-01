package org.domeos.framework.api.model.deployment;

import org.domeos.framework.engine.model.RowModelBase;

/**
 * Created by KaiRen on 2016/9/20.
 */
public class DeployCollection extends RowModelBase {
    private int creatorId;

    public DeployCollection() {
    }

    public int getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(int creatorId) {
        this.creatorId = creatorId;
    }
}
