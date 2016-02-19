package org.domeos.api.model.user;

/**
 * Created by zhenfengchen on 15-11-19.
 * owner type of resource such as project/depley/cluster etc
 */
public enum ResourceOwnerType {
    /**
     * Created by a single user
     */
    USER("USER"),
    /**
     * Created by a member of group
     */
    GROUP("GROUP");

    public final String ownerTypeName;
    private ResourceOwnerType(String ownerTypeName) {
        this.ownerTypeName = ownerTypeName;
    }
    public String getOwnerTypeName() {
        return ownerTypeName;
    }
}
