package org.domeos.api.model.user;

/**
 * Created by zhenfengchen on 15-11-19.
 */
public enum RoleType {
    // administrator who can CRUD user
    ADMINISTRATOR("admin", 0),
    // user's role
    OWNER("owner", 1),
    MASTER("master", 2),
    DEVELOPER("developer", 3),
    REPORTER("reporter", 4),
    GUEST("guest", 5),
    NOTEXIST("notexist", 100);

    public final String roleName;
    public final int accessLevel;
    private RoleType(String roleName, int accessLevel) {
        this.roleName = roleName;
        this.accessLevel = accessLevel;
    }
    public String getRoleName() {
        return roleName;
    }
    public int getAccessLevel() { return accessLevel; }
}
