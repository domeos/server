package org.domeos.framework.api.consolemodel;


import org.domeos.framework.api.model.resource.related.ResourceOwnerType;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class CreatorDraft {
    private ResourceOwnerType creatorType;
    private int creatorId;

    public ResourceOwnerType getCreatorType() {
        return creatorType;
    }

    public void setCreatorType(ResourceOwnerType creatorType) {
        this.creatorType = creatorType;
    }

    public int getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(int creatorId) {
        this.creatorId = creatorId;
    }

    public String checkLegality() {
        if (creatorType == null) {
            return "creator type must be set";
        }
        if (creatorId <= 0) {
            return "creator id must > 0";
        }
        return null;
    }
}
