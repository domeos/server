package org.domeos.framework.api.model.auth.related;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public enum Role {
    // administrator who can CRUD user
    ADMINISTRATOR(0),
    // user's role
    OWNER(1),
    MASTER(2),
    DEVELOPER(3),
    REPORTER(4),
    GUEST(5),
    NOTEXIST(100);

    public final int accessLevel;

    Role(int accessLevel) {
        this.accessLevel = accessLevel;
    }

    public int getAccessLevel() {
        return accessLevel;
    }

    public static Role getMaxRoleType(Role a, Role b) {
        if (a == null) {
            return b;
        } else if (b == null) {
            return a;
        }
        if (a.getAccessLevel() <= b.getAccessLevel()) {
            return a;
        } else {
            return b;
        }
    }
}
