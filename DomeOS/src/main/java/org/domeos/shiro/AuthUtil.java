package org.domeos.shiro;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.domeos.api.mapper.project.ProjectBasicMapper;
import org.domeos.api.mapper.user.AdminRoleMapper;
import org.domeos.api.model.group.Group;
import org.domeos.api.model.group.UserGroup;
import org.domeos.api.model.project.ProjectBasic;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.*;
import org.domeos.api.service.group.GroupService;
import org.domeos.api.service.group.UserGroupService;
import org.domeos.api.service.resource.ResourceService;
import org.domeos.api.service.user.UserService;
import org.domeos.util.ResourceUtil;
import org.domeos.util.RoleUtil;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by zhenfengchen on 15-11-20.
 */

public class AuthUtil {

    static UserService userService;
    static GroupService groupService;
    static UserGroupService userGroupService;
    static ResourceService resourceService;
    static ProjectBasicMapper projectBasicMapper;
    static AdminRoleMapper adminRoleMapper;

    @Autowired
    public void setUserService(UserService userService) {
        AuthUtil.userService = userService;
    }

    @Autowired
    public void setGroupService(GroupService groupService) {
        AuthUtil.groupService = groupService;
    }

    @Autowired
    public void setUserGroupService(UserGroupService userGroupService) {
        AuthUtil.userGroupService = userGroupService;
    }

    @Autowired
    public void setResourceService(ResourceService resourceService) {
        AuthUtil.resourceService = resourceService;
    }

    @Autowired
    public void setProjectBasicMapper(ProjectBasicMapper projectBasicMapper) {
        AuthUtil.projectBasicMapper = projectBasicMapper;
    }

    @Autowired
    public void setAdminRoleMapper(AdminRoleMapper adminRoleMapper) {
        AuthUtil.adminRoleMapper = adminRoleMapper;
    }

    public static boolean isAdmin() {
        Subject subject = SecurityUtils.getSubject();
        return subject.hasRole(RoleType.ADMINISTRATOR.getRoleName());
    }

    public static boolean isAdmin(long userId) {
        AdminRole adminRole = adminRoleMapper.getAdminById(userId);
        if (adminRole != null) {
            return true;
        }
        return false;
    }

    public static String getCurrentUserName() {
        return (String)SecurityUtils.getSubject().getPrincipal();
    }

    /**
     * Get current user' id,
     * @return userId or -1 if not aquired
     */
    public static long getUserId() {
        String userName = getCurrentUserName();
        return userService.getUserId(userName);
    }

    public static User getUser() {
        String userName = getCurrentUserName();
        return userService.getUser(userName);
    }

    /**
     * Set resource ownerId and ownerType cause the resource may be created by user or by group
     * @param resource resource
     * @param userId user who submit the resource creation request
     * @param type  resource type, USER or GROUP
     * @param resourceName resouceName
     */
    public static void setResourceOwnerAndType(Resource resource, long userId,
        ResourceOwnerType type, String resourceName) {
        resource.setOwner_type(type);
        if (type == ResourceOwnerType.USER) {
            resource.setOwner_id(userId);
        } else {
            String groupName = ResourceUtil.getOwnerName(resourceName);
            Group group = groupService.getGroupByName(groupName);
            if (group != null) {
                resource.setOwner_id(group.getId());
            }
        }
    }

    public static void setResourceOwnerId(Resource resource, String ownerName, ResourceOwnerType type, long userId) {
        resource.setOwner_type(type);
        if (type == ResourceOwnerType.USER) {
            resource.setOwner_id(userId);
        } else {
            Group group = groupService.getGroupByName(ownerName);
            if (group != null) {
                resource.setOwner_id(group.getId());
            }
        }
    }

    public static boolean addResource(Resource resource) {
        resourceService.addResource(resource);
        return true;
    }

    /**
     * Decide whether a user has permission to operate on specified resource
     * @param userId user id
     * @param resourceId resource id
     * @param resourceType resource type, USER or GROUP
     * @param operationType Modify Get Delete
     * @return verification result
     */
    public static boolean verify(long userId, long resourceId,
        ResourceType resourceType, OperationType operationType) {

        if (isAdmin(userId)) {
            return true;
        }

        // step 1
        // decide whether the user own this resource
        Resource userOwnedResource = resourceService.getResourceByUserAndResourceId(userId,
            resourceId, resourceType);
        // decide whether the user'group own this resource
        Resource groupOwnedResource = resourceService.getGroupResourceByResourceId(resourceId, resourceType);

        // step 2
        RoleType userRoleType = RoleType.NOTEXIST;
        if (userOwnedResource != null) {
            userRoleType = RoleUtil.getRoleType(userOwnedResource.getRole());
        }

        RoleType userRoleTypeInGroup = RoleType.NOTEXIST;
        if (groupOwnedResource != null) {
            // means the resource is created by a group
            UserGroup userGroup = userGroupService.getUserGroup(userId, groupOwnedResource.getOwner_id());
            if (userGroup != null) {
                // user is in this group
                userRoleTypeInGroup = RoleUtil.getRoleType(userGroup.getRole());
            }
        }

        // step 3
        if (userRoleType == RoleType.ADMINISTRATOR) {
            return true;
        }

        switch (operationType) {
            case GET:
                if (userRoleType.getAccessLevel() < RoleType.GUEST.getAccessLevel()) {
                    return true;
                } else if (userRoleTypeInGroup.getAccessLevel() < RoleType.GUEST.getAccessLevel()) {
                    return true;
                } else if (resourceType == ResourceType.PROJECT) {
                    ProjectBasic projectBasic = projectBasicMapper.getProjectBasicById(new Long(resourceId).intValue());
                    return projectBasic != null && projectBasic.getAuthority() == 1;
                } else {
                    return false;
                }
            case MODIFY:
                return userRoleType.getAccessLevel() <= RoleType.DEVELOPER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= RoleType.DEVELOPER.getAccessLevel();
            case DELETE:
                return userRoleType.getAccessLevel() <= RoleType.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= RoleType.MASTER.getAccessLevel();
            case SET:
                return true;
            case ADDUSER:
                return userRoleType.getAccessLevel() <= RoleType.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= RoleType.MASTER.getAccessLevel();
            case GETUSER:
                return userRoleType.getAccessLevel() <= RoleType.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= RoleType.MASTER.getAccessLevel();
            case MODIFYUSER:
                return userRoleType.getAccessLevel() <= RoleType.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= RoleType.MASTER.getAccessLevel();
            case DELETEUSER:
                return userRoleType.getAccessLevel() <= RoleType.MASTER.getAccessLevel() ||
                        userRoleTypeInGroup.getAccessLevel() <= RoleType.MASTER.getAccessLevel();
            default:
                return false;
        }
    }

    /**
     * user group related verify
     * @param userId user id
     * @param groupId group id
     * @param operationType operation type
     * @param dstUserId needs only if we want to remove a user from group
     * @return verification result
     */
    public static boolean groupVerify(long userId, long groupId, OperationType operationType, long dstUserId) {
        if (isAdmin(userId)) {
            return true;
        }
        UserGroup userGroup = userGroupService.getUserGroup(userId, groupId);
        RoleType userRoleType = RoleType.NOTEXIST;
        if (userGroup != null) {
            userRoleType = RoleUtil.getRoleType(userGroup.getRole());
        }
        switch (operationType) {
            case DELETE:
                return userRoleType.getAccessLevel() <= RoleType.MASTER.getAccessLevel();
            case ADDGROUPMEMBER:
            case MODIFYGROUPMEMBER:
                return userRoleType.getAccessLevel() <= RoleType.MASTER.getAccessLevel();
            case DELETEGROUPMEMBER:
                if (userRoleType.getAccessLevel() <= RoleType.MASTER.getAccessLevel()) {
                    // master of a group can delete other users from the group
                    // can only leave from a group if he's not the last master in the group
                    if (userId == dstUserId) {
                        if (userGroupService.masterCountInGroup(groupId) <= 1) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                } else {
                    // normal user can leave from a group
                    return userId == dstUserId;
                }
            case LISTGROUPMEMBER:
                return userRoleType.getAccessLevel() < RoleType.NOTEXIST.getAccessLevel();
            default:
                return false;
        }
    }

    /**
     * Get specified resource a user can get
     * @param userId the user's id
     * @param resourceType resourceType which the user wants to get
     * @return resource a user can get
     */
    public static List<Resource> getResourceList(long userId, ResourceType resourceType) {
        if (isAdmin(userId)) {
            return resourceService.getAllResourceByType(resourceType);
        }
        // user owned resource
        List<Resource> uRes = resourceService.getResourceListByUserId(userId, resourceType);
        // user's group owned resource
        List<Resource> gRes = resourceService.getGroupResourceListByUserId(userId, resourceType);
        List<Resource> res = new ArrayList<>();
        if (uRes != null) {
            res.addAll(uRes);
        }
        if (gRes != null) {
            res.addAll(gRes);
        }
        return res;
    }

    public static RoleType getUserRoleInResource(ResourceType type, long resourceId, long userId) {
        if (isAdmin(userId)) {
            return RoleType.MASTER;
        }
        RoleType roleType = resourceService.getUserRoleInResource(type, resourceId, getUserId());
        if (type == ResourceType.PROJECT && roleType == RoleType.NOTEXIST) {
            ProjectBasic projectBasic = projectBasicMapper.getProjectBasicById(new Long(resourceId).intValue());
            if (projectBasic != null && projectBasic.getAuthority() == 1) {
                return RoleType.REPORTER;
            }
        }
        return roleType;
    }
}
