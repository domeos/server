package org.domeos.api.service.resource;

import org.domeos.api.model.console.resource.ResourceInfo;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.api.model.user.RoleType;
import org.domeos.basemodel.HttpResponseTemp;

import java.util.List;

public interface ResourceService {
    /**
     * set user or group info for resource
     * @param resourceInfo
     * @param userId
     * @return
     */
    HttpResponseTemp<?> setResource(ResourceInfo resourceInfo, Long userId);

    /**
     * update user or group info for resource
     * @param resourceInfo
     * @param userId
     * @return
     */
    HttpResponseTemp<?> updateResource(ResourceInfo resourceInfo, Long userId);

    /**
     * get resource group and user infos
     * @param resourceType
     * @param resourceId
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getResourceUsers(ResourceType resourceType, Long resourceId, Long userId);

    /**
     *
     * @param resourceType
     * @param resourceId
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getResourceUsersOnly(ResourceType resourceType, Long resourceId, Long userId);

    /**
     * get resource group and user infos
     * @param resourceType
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getResourcesUsers(ResourceType resourceType, Long userId);

    /**
     *
     * @param resourceType
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getResourcesUsersOnly(ResourceType resourceType, Long userId);

    /**
     * delete user or group from resource
     * @param resourceType
     * @param resourceId
     * @param ownerType
     * @param ownerId
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteResourceUser(ResourceType resourceType, Long resourceId, ResourceOwnerType ownerType, Long ownerId, long userId);

    HttpResponseTemp<?> getResourceListByGroupId(long groupId, ResourceType resourceType);

    Resource getResourceByUserAndResourceId(long userId, long resourceId, ResourceType resourceType);

    Resource getGroupResourceByResourceId(long resourceId, ResourceType resourceType);

    /**
     * Get the resource list which the userId is in as a single user
     * @param userId userId
     * @param resourceType resourceType
     * @return
     */
    List<Resource> getResourceListByUserId(long userId, ResourceType resourceType);

    /**
     * Get the resource list which the user's group is in
     * @param userId userId
     * @param resourceType resourceType
     * @return
     */
    List<Resource> getGroupResourceListByUserId(long userId, ResourceType resourceType);

    /**
     * Get all resource from database, only for admin
     *
     * */
    List<Resource> getAllResourceByType(ResourceType resourceType);

    /**
     * Get user role of resource from database
     * @param resourceType
     * @param resourceId
     * @param userId
     * @return
     */
    RoleType getUserRoleInResource(ResourceType resourceType, long resourceId, long userId);

    // add a user to specified resource
    void addResource(Resource resource);

    void modifyResource(Resource resource);

    // delete resource by resource_id and resource_type (for deploy)
    void deleteResourceByIdAndType(ResourceType resourceType, long resourceId);
}
