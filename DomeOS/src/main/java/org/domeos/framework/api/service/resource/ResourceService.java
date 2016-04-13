package org.domeos.framework.api.service.resource;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceInfo;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/6.
 */
public interface ResourceService {
    /**
     * set user or group info for resource
     *
     * @param resourceInfo
     * @return
     */
    HttpResponseTemp<?> setResource(ResourceInfo resourceInfo);

    /**
     * update user or group info for resource
     *
     * @param resourceInfo
     * @return
     */
    HttpResponseTemp<?> updateResource(ResourceInfo resourceInfo);

    /**
     * get resource group and user infos
     *
     * @param resourceType
     * @param resourceId
     * @return
     */
    HttpResponseTemp<?> getResourceUsers(ResourceType resourceType, int resourceId);

    /**
     * @param resourceType
     * @param resourceId
     * @return
     */
    HttpResponseTemp<?> getResourceUsersOnly(ResourceType resourceType, int resourceId);

    /**
     * get resource group and user infos
     *
     * @param resourceType
     * @return
     */
    HttpResponseTemp<?> getResourcesUsers(ResourceType resourceType);

    /**
     * @param resourceType
     * @return
     */
    HttpResponseTemp<?> getResourcesUsersOnly(ResourceType resourceType);

    /**
     * delete user or group from resource
     *
     * @param resourceType
     * @param resourceId
     * @param ownerType
     * @param ownerId
     * @return
     */
    HttpResponseTemp<?> deleteResourceUser(ResourceType resourceType, int resourceId, ResourceOwnerType ownerType, int ownerId);

    HttpResponseTemp<?> getResourceListByGroupId(int groupId, ResourceType resourceType);

    Resource getResourceByUserAndResourceId(int userId, int resourceId, ResourceType resourceType);

    Resource getGroupResourceByResourceId(int resourceId, ResourceType resourceType);

    /**
     * Get the resource list which the userId is in as a single user
     *
     * @param resourceType resourceType
     * @return
     */
    List<Resource> getResourceListByUserId(ResourceType resourceType, int userId);

    /**
     * Get the resource list which the user's group is in
     *
     * @param resourceType resourceType
     * @return
     */
    List<Resource> getGroupResourceListByUserId(ResourceType resourceType, int userId);

    /**
     * Get all resource from database, only for admin
     */
    List<Resource> getAllResourceByType(ResourceType resourceType);

    /**
     * Get user role of resource from database
     *
     * @param resourceType
     * @param resourceId
     * @return
     */
    Role getUserRoleInResource(ResourceType resourceType, int resourceId, int userId);

    // add a user to specified resource
    void addResource(Resource resource);

    void modifyResource(Resource resource);

    // delete resource by resource_id and resource_type (for deploy)
    void deleteResourceByIdAndType(ResourceType resourceType, int resourceId);
}
