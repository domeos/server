package org.domeos.framework.api.model.resource.related;

import org.domeos.framework.api.model.auth.related.Role;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class OwnerInfo {
    private int ownerId;
    private ResourceOwnerType ownerType;
    private Role role;
    private long updateTime;

    public int getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(int ownerId) {
        this.ownerId = ownerId;
    }

    public ResourceOwnerType getOwnerType() {
        return ownerType;
    }

    public void setOwnerType(ResourceOwnerType ownerType) {
        this.ownerType = ownerType;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }

    public String checkLegality() {
        if (ownerType == null) {
            return "in owner info, owner type must be set";
        }
        if (role == null) {
            return "in owner info, role must be set";
        }
        if (ownerId <= 0) {
            return "in owner info, owner id must be set";
        }
        return null;
    }
}
