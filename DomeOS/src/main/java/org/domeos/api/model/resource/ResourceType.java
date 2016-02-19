package org.domeos.api.model.resource;

/**
 * Created by zhenfengchen on 15-11-19.
 */
public enum ResourceType {
    PROJECT("PROJECT"),
    CLUSTER("CLUSTER"),
    DEPLOY("DEPLOY"),
    GITLAB("GITLAB"),
    LDAP("LDAP"),
    SUBVERSION("SUBVERSION");

    public final String resourceName;
    private ResourceType(String resourceName) {
        this.resourceName = resourceName;
    }
    public String getResourceName() {
        return resourceName;
    }
}
