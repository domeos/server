package org.domeos.api.model.resource;

import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.util.DateUtil;

import java.util.Date;

/**
 * Created by zhenfengchen on 2015/11/29.
 * Project Deploy Cluster related
 */
public class Resource {
    private Long id;
    private long resource_id;
    private ResourceType resource_type;
    private long owner_id;
    private ResourceOwnerType owner_type;
    private String role;
    private Date update_time;

    public Resource() {

    }

    public Resource(long resource_id, ResourceType resource_type) {
        this.resource_id = resource_id;
        this.resource_type = resource_type;
    }

    public Resource(long resource_id, ResourceType resource_type, long owner_id, ResourceOwnerType owner_type, String role, Date update_time) {
        this.resource_id = resource_id;
        this.resource_type = resource_type;
        this.owner_id = owner_id;
        this.owner_type = owner_type;
        this.role = role;
        this.update_time = update_time;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUpdate_time() {
        return DateUtil.getDatetime(update_time);
    }

    public long update_time() {
        return update_time.getTime();
    }

    public void setUpdate_time(Date update_time) {
        this.update_time = update_time;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public long getResource_id() {
        return resource_id;
    }

    public void setResource_id(long resource_id) {
        this.resource_id = resource_id;
    }

    public ResourceType getResource_type() {
        return resource_type;
    }

    public void setResource_type(ResourceType resource_type) {
        this.resource_type = resource_type;
    }

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
}
