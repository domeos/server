package org.domeos.framework.engine;

import org.apache.shiro.SecurityUtils;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.Group;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by zhenfengchen on 15-11-20.
 */

public class AuthUtil {

    static AuthBiz authBiz;
    static ResourceBiz resourceBiz;
    static ProjectBiz projectBiz;

    @Autowired
    public void setAuthBiz(AuthBiz authBiz) {
        AuthUtil.authBiz = authBiz;
    }

    @Autowired
    public void setResourceBiz(ResourceBiz resourceBiz) {
        AuthUtil.resourceBiz = resourceBiz;
    }

    @Autowired
    public void setProjectBiz(ProjectBiz projectBiz) {
        AuthUtil.projectBiz = projectBiz;
    }

//    public static boolean isAdmin() {
//        Subject subject = SecurityUtils.getSubject();
//        return subject.hasRole(Role.ADMINISTRATOR.name());
//    }

    public static boolean isAdmin(int userId) {
        return authBiz.isAdmin(userId);
    }

    public static String getCurrentUserName() {
        return (String) SecurityUtils.getSubject().getPrincipal();
    }

    /**
     * Get current user' id,
     *
     * @return userId or -1 if not aquired
     */
    public static int getUserId() {
        String userName = getCurrentUserName();
        return authBiz.getUserId(userName);
    }

    public static User getUser() {
        String userName = getCurrentUserName();
        return authBiz.getUser(userName);
    }

    public static String getUserNameById(int id) {
        return authBiz.getUserNameById(id);
    }

//    /**
//     * Set resource ownerId and ownerType cause the resource may be created by user or by group
//     *
//     * @param resource     resource
//     * @param userId       user who submit the resource creation request
//     * @param type         resource type, USER or GROUP
//     * @param resourceName resouceName
//     */
//    public static void setResourceOwnerAndType(Resource resource, int userId,
//                                               OwnerType type, String resourceName) {
//        resource.setOwnerType(type);
//        if (type == OwnerType.USER) {
//            resource.setOwnerId(userId);
//        } else {
//            String groupName = ResourceUtil.getOwnerName(resourceName);
//            Group group = authBiz.getGroupByName(groupName);
//            if (group != null) {
//                resource.setOwnerId(group.getId());
//            }
//        }
//    }

    public static void setResourceOwnerId(Resource resource, String ownerName, ResourceOwnerType type, int userId) {
        resource.setOwnerType(type);
        if (type == ResourceOwnerType.USER) {
            resource.setOwnerId(userId);
        } else {
            Group group = authBiz.getGroupByName(ownerName);
            if (group != null) {
                resource.setOwnerId(group.getId());
            }
        }
    }

    public static boolean addResource(Resource resource) {
        resourceBiz.addResource(resource);
        return true;
    }

    /**
     * Decide whether a user has permission to operate on specified resource
     *
     * @param userId        user id
     * @param resourceId    resource id
     * @param resourceType  resource type, USER or GROUP
     * @param operationType Modify Get Delete
     * @return verification result
     */
    public static boolean verify(int userId, int resourceId,
                                 ResourceType resourceType, OperationType operationType) {

        if (isAdmin(userId)) {
            return true;
        }

        // step 1
        // decide whether the user own this resource
        Resource userOwnedResource = resourceBiz.getResourceByUserAndResourceId(userId,
                resourceId, resourceType);
        // decide whether the user'group own this resource
        Resource groupOwnedResource = resourceBiz.getGroupResourceByResourceId(resourceId, resourceType);

        // step 2
        Role userRoleType = Role.NOTEXIST;
        if (userOwnedResource != null) {
            userRoleType = userOwnedResource.getRole();
        }

        Role userRoleTypeInGroup = Role.NOTEXIST;
        if (groupOwnedResource != null) {
            // means the resource is created by a group
            UserGroupMap userGroup = authBiz.getUserGroup(userId, groupOwnedResource.getOwnerId());
            if (userGroup != null) {
                // user is in this group
                userRoleTypeInGroup = userGroup.getRole();
            }
        }

        // step 3
        if (userRoleType == Role.ADMINISTRATOR) {
            return true;
        }

        boolean result = false;

        switch (operationType) {
            case GET:
                if (userRoleType.getAccessLevel() < Role.GUEST.getAccessLevel()) {
                    result = true;
                } else if (userRoleTypeInGroup.getAccessLevel() < Role.GUEST.getAccessLevel()) {
                    result = true;
                } else if (resourceType == ResourceType.PROJECT) {
                    result = projectBiz.isAuthorited(resourceId);
                } else {
                    throw new PermitException(userId, resourceId, resourceType, operationType);
                }
                break;
            case MODIFY:
                result = userRoleType.getAccessLevel() <= Role.DEVELOPER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= Role.DEVELOPER.getAccessLevel();
                break;
            case DELETE:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case SET:
                result = true;
                break;
            case ADDUSER:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case GETUSER:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case MODIFYUSER:
                result =userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case DELETEUSER:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
        }

        if (!result) {
            throw new PermitException(userId, resourceId, resourceType, operationType);
        }

        return true;
    }

    /**
     * user group related verify
     *
     * @param userId        user id
     * @param groupId       group id
     * @param operationType operation type
     * @param dstUserId     needs only if we want to remove a user from group
     * @return verification result
     */
    public static boolean groupVerify(int userId, int groupId, OperationType operationType, int dstUserId) {
        if (isAdmin(userId)) {
            return true;
        }
        UserGroupMap userGroup = authBiz.getUserGroup(userId, groupId);
        Role userRoleType = Role.NOTEXIST;
        if (userGroup != null) {
            userRoleType = userGroup.getRole();
        }
        boolean result = false;
        switch (operationType) {
            case DELETE:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case ADDGROUPMEMBER:
            case MODIFYGROUPMEMBER:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case DELETEGROUPMEMBER:
                if (userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel()) {
                    // master of a group can delete other users from the group
                    // can only leave from a group if he's not the last master in the group
                    if (userId == dstUserId) {
                        if (authBiz.masterCountInGroup(groupId) <= 1) {
                            result = false;
                        } else {
                            result = true;
                        }
                    } else {
                        result = true;
                    }
                } else {
                    // normal user can leave from a group
                    result = (userId == dstUserId);
                }
                break;
            case LISTGROUPMEMBER:
                result = userRoleType.getAccessLevel() < Role.NOTEXIST.getAccessLevel();
                break;
        }

        if (!result) {
            throw new PermitException(userId, groupId, operationType, dstUserId);
        }

        return true;
    }

    /**
     * Get specified resource a user can get
     *
     * @param userId       the user's id
     * @param resourceType resourceType which the user wants to get
     * @return resource a user can get
     */
    public static List<Resource> getResourceList(int userId, ResourceType resourceType) {
        if (isAdmin(userId)) {
            return resourceBiz.getAllResourceByType(resourceType);
        }
        // user owned resource
        List<Resource> uRes = resourceBiz.getResourceListByUserId(userId, resourceType);
        // user's group owned resource
        List<Resource> gRes = resourceBiz.getGroupResourceListByUserId(userId, resourceType);
        List<Resource> res = new ArrayList<>();
        if (uRes != null) {
            res.addAll(uRes);
        }
        if (gRes != null) {
            res.addAll(gRes);
        }
        return res;
    }

    public static Role getUserRoleInResource(ResourceType type, int resourceId, int userId) {
        if (isAdmin(userId)) {
            return Role.MASTER;
        }

        List<Resource> resources = resourceBiz.getResourceByResourceIdAndType(resourceId, type);
        if (resources == null) {
            return Role.NOTEXIST;
        }
        Role role = Role.NOTEXIST;
        for (Resource resource : resources) {
            if (resource.getOwnerType() == ResourceOwnerType.USER) {
                if (userId == resource.getOwnerId() && resource.getRole().getAccessLevel() < role.getAccessLevel()) {
                    role = resource.getRole();
                }
            }
            if (resource.getOwnerType() == ResourceOwnerType.GROUP) {
                UserGroupMap userGroup = authBiz.getUserGroup(userId, resource.getOwnerId());
                if (userGroup != null && userGroup.getRole().getAccessLevel() < role.getAccessLevel()) {
                    role = userGroup.getRole();
                }
            }
        }

        if (type == ResourceType.PROJECT && role == Role.NOTEXIST && projectBiz.isAuthorited(resourceId)) {
            return Role.REPORTER;
        }
        return role;
    }

    public static String getNameByOwnerTypeAndId(ResourceOwnerType creatorType, int creatorId) {
        return authBiz.getNameByTypeAndId(creatorType, creatorId);
    }
}
