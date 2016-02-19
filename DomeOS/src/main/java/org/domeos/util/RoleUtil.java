package org.domeos.util;

import org.domeos.api.model.user.RoleType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by zhenfengchen on 15-11-30.
 */
public class RoleUtil {
    private static Logger logger = LoggerFactory.getLogger(RoleUtil.class);

    public static RoleType getRoleType(String role) {
        RoleType roleType = RoleType.GUEST;
        try {
            if (role != null) {
                roleType = RoleType.valueOf(role.toUpperCase());
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return roleType;
    }

    public static RoleType getMaxRoleType(RoleType a, RoleType b) {
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
