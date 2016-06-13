package org.domeos.framework.api.biz.resource;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public interface ResourceBiz extends BaseBiz {

    void addResource(int resourceId, ResourceType resourceType, int ownerId, ResourceOwnerType s, Role role);

    void addResource(Resource resource);

    Resource getResourceByUserAndResourceId(int userId, int resourceId, ResourceType resourceType);

    Resource getGroupResourceByResourceId(int resourceId, ResourceType resourceType);

    List<Resource> getAllResourceByType(ResourceType resourceType);

    List<Resource> getResourceListByUserId(int userId, ResourceType resourceType);

    List<Resource> getGroupResourceListByUserId(int userId, ResourceType resourceType);

    List<Resource> getResourceByResourceIdAndType(int resourceId, ResourceType type);

    List<Resource> getResourceByOwnerId(int groupId, ResourceOwnerType type, ResourceType project);

    void deleteResourceByIdAndType(int resourceId, ResourceType type);

    List<Resource> getGroupResourceByUserId(int id, String name, ResourceType resourceType);

    List<Resource> getAllResourcesByType(ResourceType resourceType);

    void deleteResource(ResourceType resourceType, int resourceId, ResourceOwnerType ownerType, int ownerId);

    Resource getResource(int userId, ResourceOwnerType user, int resourceId, ResourceType resourceType);

    Resource getGroupResource(String name, int resourceId, ResourceType resourceType);

    void modifyResource(Resource resource);
}
