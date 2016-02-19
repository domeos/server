package org.domeos.api.model.console.resource;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.user.ResourceOwnerType;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class OwnerInfo {
    private long owner_id;
    private ResourceOwnerType owner_type;
    private String role;
    private long update_time;

    public long getOwner_id() {
        return owner_id;
    }

    public void setOwner_id(long owner_id) {
        this.owner_id = owner_id;
    }

    public ResourceOwnerType getOwner_type() {
        return owner_type;
    }

    public void setOwner_type(ResourceOwnerType owner_type) {
        this.owner_type = owner_type;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public long getUpdate_time() {
        return update_time;
    }

    public void setUpdate_time(long update_time) {
        this.update_time = update_time;
    }

    public String checkLegality() {
        if (owner_type == null) {
            return "in owner info, owner type must be set";
        }
        if (StringUtils.isBlank(role)) {
            return "in owner info, role must be set";
        }
        if (owner_id <= 0) {
            return "in owner info, owner id must be set";
        }
        return null;
    }
}
