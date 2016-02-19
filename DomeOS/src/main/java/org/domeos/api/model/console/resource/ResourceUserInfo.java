package org.domeos.api.model.console.resource;

import org.domeos.api.model.user.ResourceOwnerType;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ResourceUserInfo {
    private long user_id;
    private ResourceOwnerType owner_type;
    private String role;
    private long update_time;
    private String user_name;
    private String email;
    private String phone;

    public ResourceUserInfo() {
    }

    public ResourceUserInfo(long user_id, ResourceOwnerType owner_type, String role, long update_time, String user_name, String email, String phone) {
        this.user_id = user_id;
        this.owner_type = owner_type;
        this.role = role;
        this.update_time = update_time;
        this.user_name = user_name;
        this.email = email;
        this.phone = phone;
    }

    public long getUser_id() {
        return user_id;
    }

    public void setUser_id(long user_id) {
        this.user_id = user_id;
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

    public String getUser_name() {
        return user_name;
    }

    public void setUser_name(String user_name) {
        this.user_name = user_name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
