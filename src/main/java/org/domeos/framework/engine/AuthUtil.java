package org.domeos.framework.engine;

import org.apache.shiro.SecurityUtils;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.project.ProjectCollectionBiz;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.VersionType;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.project.ProjectCollection;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by zhenfengchen on 15-11-20.
 */
@Component
public class AuthUtil {


    private static AuthBiz authBiz;
    private static ProjectCollectionBiz projectCollectionBiz;
    private static CollectionBiz collectionBiz;
    private static DeploymentBiz deploymentBiz;

    @Autowired
    public void setAuthBiz(AuthBiz authBiz) {
        AuthUtil.authBiz = authBiz;
    }

    @Autowired
    public void setProjectCollectionBiz(ProjectCollectionBiz projectCollectionBiz) {
        AuthUtil.projectCollectionBiz = projectCollectionBiz;
    }

    @Autowired
    public void setCollectionBiz(CollectionBiz collectionBiz) {
        AuthUtil.collectionBiz = collectionBiz;
    }

    @Autowired
    public void setDeploymentBiz(DeploymentBiz deploymentBiz) {
        AuthUtil.deploymentBiz = deploymentBiz;
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
//     * @param resourceName resourceName
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

        Role userRoleType = getUserRoleWithResourceId(resourceType, resourceId, userId);


        if (userRoleType == Role.ADMINISTRATOR) {
            return true;
        }

        boolean result = false;

        switch (operationType) {
            case GET:
                if (userRoleType.getAccessLevel() < Role.GUEST.getAccessLevel()) {
                    result = true;
                }
                break;
            case MODIFY:
                result = userRoleType.getAccessLevel() <= Role.DEVELOPER.getAccessLevel();
                break;
            case DELETE:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case SET:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case ADDUSER:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case GETUSER:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case MODIFYUSER:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
            case DELETEUSER:
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel();
                break;
        }

        if (!result) {
            throw new PermitException(userId, resourceId, resourceType, operationType);
        }

        return true;
    }

    /**
     * user collection related verify
     *
     * @param userId        user id
     * @param collectionId  collection id
     * @param resourceType  resource type
     * @param operationType operation type
     * @param dstUserId     needs only if we want to remove a user from group
     * @return verification result
     */
    public static boolean collectionVerify(int userId, int collectionId, ResourceType resourceType, OperationType operationType, int dstUserId) {
        if (isAdmin(userId)) {
            return true;
        }
        Role userRoleType = getUserRoleWithResourceId(resourceType, collectionId, userId);
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
                result = userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel() ||
                        userId == dstUserId;
                break;
            case LISTGROUPMEMBER:
                result = resourceType == ResourceType.ALARM ||
                        userRoleType.getAccessLevel() < Role.NOTEXIST.getAccessLevel();
                break;
            case GET:
                result = userRoleType.getAccessLevel() <= Role.REPORTER.getAccessLevel();
                if (ResourceType.PROJECT_COLLECTION.equals(resourceType)) {
                    ProjectCollection projectCollection = projectCollectionBiz.getById(ProjectCollectionBiz.PROJECT_COLLECTION,
                            collectionId, ProjectCollection.class);
                    if (projectCollection != null && ProjectCollection.ProjectCollectionState.PUBLIC.equals(projectCollection.getProjectCollectionState())) {
                        result = true;
                    }
                }
                break;
            case MODIFY:
                result = userRoleType.getAccessLevel() <= Role.DEVELOPER.getAccessLevel();
                break;
            case SET:
                result = userRoleType.getAccessLevel() <= Role.DEVELOPER.getAccessLevel();
                break;
        }

        if (!result) {
            throw new PermitException(userId, collectionId, resourceType, operationType, dstUserId);
        }
        return true;

    }

    /**
     * Get specified collections a user can get
     *
     * @param userId       the user's id
     * @param resourceType resourceType which the user wants to get
     * @return a specified type collections a user can get
     */
    public static List<CollectionAuthorityMap> getCollectionList(int userId, ResourceType resourceType) {
        if (isAdmin(userId)) {
            return collectionBiz.getAllCollectionByType(resourceType);
        }
        return collectionBiz.getAuthoritiesByUserIdAndResourceType(userId, resourceType);
    }

    private static Role getUserRoleWithResourceId(ResourceType resourceType, int resourceId, int userId) {
        Role userRoleType = Role.NOTEXIST;
        if (isAdmin(userId)) {
            userRoleType = Role.ADMINISTRATOR;
        } else {
            switch (resourceType) {
                case ALARM:
                    CollectionAuthorityMap authorityMap = collectionBiz.
                            getAuthorityByUserIdAndResourceTypeAndCollectionId(userId, resourceType, GlobalConstant.alarmGroupId);
                    if (authorityMap != null) {
                        userRoleType = authorityMap.getRole();
                    }
                    break;
                case PROJECT:
                    userRoleType = getRoleByCollectionAndResource(userId, resourceId, resourceType, ResourceType.PROJECT_COLLECTION);
                    break;
                case PROJECT_COLLECTION:
                    CollectionAuthorityMap projectCollectionAuthorityMap = collectionBiz.
                            getAuthorityByUserIdAndResourceTypeAndCollectionId(userId, resourceType, resourceId);
                    if (projectCollectionAuthorityMap != null) {
                        userRoleType = projectCollectionAuthorityMap.getRole();
                    } else if (projectCollectionBiz.isAuthorited(resourceId)) {
                        userRoleType = Role.REPORTER;
                    }
                    break;
                case DEPLOY:
                    Deployment deployment = deploymentBiz.getById(GlobalConstant.DEPLOY_TABLE_NAME, resourceId, Deployment.class);
                    if (deployment == null) {
                        userRoleType = Role.NOTEXIST;
                    } else if (VersionType.WATCHER.equals(deployment.getVersionType())) {
                        userRoleType = getRoleByCollectionAndResource(userId, deployment.getClusterId(), ResourceType.CLUSTER, ResourceType.CLUSTER);
                    } else {
                        userRoleType = getRoleByCollectionAndResource(userId, resourceId, resourceType, ResourceType.DEPLOY_COLLECTION);
                    }
                    break;
                case DEPLOY_COLLECTION:
                    CollectionAuthorityMap deployCollectionAuthorityMap = collectionBiz.
                            getAuthorityByUserIdAndResourceTypeAndCollectionId(userId, resourceType, resourceId);
                    if (deployCollectionAuthorityMap != null) {
                        userRoleType = deployCollectionAuthorityMap.getRole();
                    }
                    break;
                case LOADBALANCER:
                    userRoleType = getRoleByCollectionAndResource(userId, resourceId, resourceType, ResourceType.LOADBALANCER_COLLECTION);
                    break;
                case LOADBALANCER_COLLECTION:
                    CollectionAuthorityMap loadBalancerCollectionAuthorityMap = collectionBiz.
                            getAuthorityByUserIdAndResourceTypeAndCollectionId(userId, resourceType, resourceId);
                    if (loadBalancerCollectionAuthorityMap != null) {
                        userRoleType = loadBalancerCollectionAuthorityMap.getRole();
                    }
                    break;
                case CLUSTER:
                    userRoleType = getRoleByCollectionAndResource(userId, resourceId, resourceType, ResourceType.CLUSTER);
                    break;
                case CONFIGURATION_COLLECTION:
                    CollectionAuthorityMap configurationCollectionAuthorityMap = collectionBiz.
                            getAuthorityByUserIdAndResourceTypeAndCollectionId(userId, resourceType, resourceId);
                    if (configurationCollectionAuthorityMap != null) {
                        userRoleType = configurationCollectionAuthorityMap.getRole();
                    }
                    break;
                case CONFIGURATION:
                    userRoleType = getRoleByCollectionAndResource(userId, resourceId, resourceType, ResourceType.CONFIGURATION_COLLECTION);
                    break;
            }
        }
        return userRoleType;
    }

    private static Role getRoleByCollectionAndResource(int userId, int resourceId, ResourceType resourceType, ResourceType collectionType) {
        CollectionResourceMap resourceMap = collectionBiz.getResourceByResourceIdAndResourceType(resourceId, resourceType);
        Role userRoleType = Role.NOTEXIST;
        if (resourceMap != null) {
            if (resourceMap.getCreatorId() == userId) {
                userRoleType = Role.OWNER;
            } else {
                CollectionAuthorityMap authorityMap = collectionBiz.
                        getAuthorityByUserIdAndResourceTypeAndCollectionId(userId, collectionType, resourceMap.getCollectionId());
                if (authorityMap != null) {
                    userRoleType = authorityMap.getRole();
                } else if (collectionType == ResourceType.PROJECT_COLLECTION &&
                        projectCollectionBiz.isAuthorited(resourceMap.getCollectionId())) {
                    userRoleType = Role.REPORTER;
                }
            }
        }
        return userRoleType;
    }

    public static Role getUserRoleInResource(ResourceType type, int resourceId, int userId) {
        Role userRoleType = getUserRoleWithResourceId(type, resourceId, userId);
        if (userRoleType.getAccessLevel() <= Role.MASTER.getAccessLevel()) {
            userRoleType = Role.MASTER;
        } else if (userRoleType.getAccessLevel() >= Role.GUEST.getAccessLevel()) {
            userRoleType = Role.GUEST;
        }
        return userRoleType;
    }
}