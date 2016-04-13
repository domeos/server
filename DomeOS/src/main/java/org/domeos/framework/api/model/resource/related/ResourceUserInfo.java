package org.domeos.framework.api.model.resource.related;


import org.domeos.framework.api.model.auth.related.Role;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public class ResourceUserInfo {
    private int userId;
    private ResourceOwnerType ownerType;
    private Role role;
    private long updatetime;
    private String username;
    private String email;
    private String phone;

    public ResourceUserInfo() {
    }

    public ResourceUserInfo(int userId, ResourceOwnerType ownerType, Role role, long updatetime, String username, String email, String phone) {
        this.userId = userId;
        this.ownerType = ownerType;
        this.role = role;
        this.updatetime = updatetime;
        this.username = username;
        this.email = email;
        this.phone = phone;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
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

    public long getUpdatetime() {
        return updatetime;
    }

    public void setUpdatetime(long updatetime) {
        this.updatetime = updatetime;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
