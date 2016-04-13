package org.domeos.framework.api.biz.resource.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.mapper.resource.ResourcesMapper;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Service("resourceBiz")
public class ResourceBizImpl extends BaseBizImpl implements ResourceBiz {
    @Autowired
    ResourcesMapper resourcesMapper;

    @Override
    public void addResource(int resourceId, ResourceType resourceType, int ownerId, ResourceOwnerType resourceOwnerType,
                            Role role) {
        Resource resource = new Resource();
        resource.setResourceId(resourceId);
        resource.setResourceType(resourceType);
        resource.setOwnerId(ownerId);
        resource.setOwnerType(resourceOwnerType);
        resource.setRole(role);
        resource.setUpdateTime(System.currentTimeMillis());

        resourcesMapper.addResource(resource);
    }

    @Override
    public void addResource(Resource resource) {
        resourcesMapper.addResource(resource);
    }

    @Override
    public Resource getResourceByUserAndResourceId(int userId, int resourceId, ResourceType resourceType) {
        return resourcesMapper.getResourceByUserAndResourceId(userId, ResourceOwnerType.USER, resourceId, resourceType);
    }

    @Override
    public Resource getGroupResourceByResourceId(int resourceId, ResourceType resourceType) {
        return resourcesMapper.getGroupResourceByResourceId(ResourceOwnerType.GROUP, resourceId, resourceType);
    }

    @Override
    public List<Resource> getAllResourceByType(ResourceType resourceType) {
        return resourcesMapper.getAllResourcesByType(resourceType);
    }

    @Override
    public List<Resource> getResourceListByUserId(int userId, ResourceType resourceType) {
        return resourcesMapper.getResourceListByOwnerId(userId, ResourceOwnerType.USER, resourceType);
    }

    @Override
    public List<Resource> getGroupResourceListByUserId(int userId, ResourceType resourceType) {
        return resourcesMapper.getGroupResourceListByUserId(userId, ResourceOwnerType.GROUP, resourceType);
    }

    @Override
    public List<Resource> getResourceByResourceIdAndType(int resourceId, ResourceType type) {
        return resourcesMapper.getResourceByResourceIdAndType(resourceId, type);
    }

    @Override
    public List<Resource> getResourceByOwnerId(int groupId, ResourceOwnerType type, ResourceType project) {
        return resourcesMapper.getResourceByOwnerId(groupId, type, project);
    }

    @Override
    public void deleteResourceByIdAndType(int resourceId, ResourceType type) {
        resourcesMapper.deleteResourceByIdAndType(type, resourceId);
    }

    @Override
    public List<Resource> getGroupResourceByUserId(int id, String name, ResourceType resourceType) {
        return resourcesMapper.getGroupResourceByUserId(id, name, resourceType);
    }

    @Override
    public List<Resource> getAllResourcesByType(ResourceType resourceType) {
        return resourcesMapper.getAllResourcesByType(resourceType);
    }

    @Override
    public void deleteResource(ResourceType resourceType, int resourceId, ResourceOwnerType ownerType, int ownerId) {
        resourcesMapper.deleteResource(resourceType, resourceId, ownerType, ownerId);
    }

    @Override
    public Resource getResource(int userId, ResourceOwnerType user, int resourceId, ResourceType resourceType) {
        return resourcesMapper.getResource(userId, user, resourceId, resourceType);
    }

    @Override
    public Resource getGroupResource(String name, int resourceId, ResourceType resourceType) {
        return resourcesMapper.getGroupResource(name, resourceId, resourceType);
    }

    @Override
    public void modifyResource(Resource resource) {

    }
}
