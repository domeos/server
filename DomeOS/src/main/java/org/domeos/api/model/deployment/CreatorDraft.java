package org.domeos.api.model.deployment;

import org.domeos.api.model.user.ResourceOwnerType;

/**
 * Created by xxs on 15/12/15.
 */
public final class CreatorDraft {
    private ResourceOwnerType creatorType;
    private long creatorId;

    public ResourceOwnerType getCreatorType() {
        return creatorType;
    }

    public void setCreatorType(ResourceOwnerType creatorType) {
        this.creatorType = creatorType;
    }

    public long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(long creatorId) {
        this.creatorId = creatorId;
    }
}
