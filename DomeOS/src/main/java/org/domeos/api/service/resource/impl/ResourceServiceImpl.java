package org.domeos.api.service.resource.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.cluster.ClusterBasicMapper;
import org.domeos.api.mapper.deployment.DeploymentMapper;
import org.domeos.api.mapper.group.GroupMapper;
import org.domeos.api.mapper.group.UserGroupMapper;
import org.domeos.api.mapper.project.ProjectBasicMapper;
import org.domeos.api.mapper.resource.ResourceHistoryMapper;
import org.domeos.api.mapper.resource.ResourceMapper;
import org.domeos.api.mapper.user.UserMapper;
import org.domeos.api.model.cluster.ClusterBasic;
import org.domeos.api.model.console.resource.*;
import org.domeos.api.model.deployment.Deployment;
import org.domeos.api.model.group.UserGroup;
import org.domeos.api.model.project.ProjectBasic;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceHistory;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.api.model.user.RoleType;
import org.domeos.api.model.user.User;
import org.domeos.api.service.resource.ResourceService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.domeos.util.RoleUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by zhenfengchen on 15-11-29.
 */
@Service("resourceService")
public class ResourceServiceImpl implements ResourceService {
    @Autowired
    ResourceMapper resourceMapper;
    @Autowired
    UserGroupMapper userGroupMapper;
    @Autowired
    ResourceHistoryMapper resourceHistoryMapper;
    @Autowired
    GroupMapper groupMapper;
    @Autowired
    UserMapper userMapper;
    @Autowired
    ProjectBasicMapper projectBasicMapper;
    @Autowired
    ClusterBasicMapper clusterBasicMapper;
    @Autowired
    DeploymentMapper deploymentMapper;

    public List<Resource> getResourceListByUserId(long userId, ResourceType resourceType) {
        return resourceMapper.getResourceByOwnerId(userId,
                ResourceOwnerType.USER.name(), resourceType);
    }

    public List<Resource> getGroupResourceListByUserId(long userId, ResourceType resourceType) {
        return resourceMapper.getGroupResourceByUserId(userId,
                ResourceOwnerType.GROUP.name(), resourceType);
    }

    @Override
    public void deleteResourceByIdAndType(ResourceType resourceType, long resourceId) {
        resourceMapper.deleteResourceByIdAndType(resourceType, resourceId);
    }

    @Override
    public List<Resource> getAllResourceByType(ResourceType resourceType) {
        return resourceMapper.getAllResourcesByType(resourceType);
    }

    @Override
    public RoleType getUserRoleInResource(ResourceType resourceType, long resourceId, long userId) {
        List<Resource> resources = resourceMapper.getResourceByResourceIdAndType(resourceId, resourceType);
        if (resources == null) {
            return RoleType.NOTEXIST;
        }
        RoleType roleType = RoleType.NOTEXIST;
        for (Resource resource : resources) {
            if (resource.getOwner_type() == ResourceOwnerType.USER) {
                if (userId == resource.getOwner_id() && RoleUtil.getRoleType(resource.getRole()).getAccessLevel() < roleType.getAccessLevel()) {
                    roleType = RoleUtil.getRoleType(resource.getRole());
                }
            }
            if (resource.getOwner_type() == ResourceOwnerType.GROUP) {
                UserGroup userGroup = userGroupMapper.getUserGroup(userId, resource.getOwner_id());
                if (userGroup != null && RoleUtil.getRoleType(userGroup.getRole()).getAccessLevel() < roleType.getAccessLevel()) {
                    roleType = RoleUtil.getRoleType(userGroup.getRole());
                }
            }
        }
        return roleType;
    }


    @Override
    public HttpResponseTemp<?> setResource(ResourceInfo resourceInfo, Long userId) {
        if (resourceInfo == null) {
            return ResultStat.FORBIDDEN.wrap("resourceInfo is null");
        }
        if (!AuthUtil.verify(userId, resourceInfo.getResource_id(), resourceInfo.getResource_type(), OperationType.ADDUSER)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if (!StringUtils.isBlank(resourceInfo.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, resourceInfo.checkLegality());
        }

        setResourceInfo(resourceInfo);

        ResourceHistory resourceHistory = new ResourceHistory(resourceInfo.getResource_type().name(), new Long(resourceInfo.getResource_id()).intValue(),
                OperationType.ADDUSER.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> updateResource(ResourceInfo resourceInfo, Long userId) {
        if (resourceInfo == null) {
            return ResultStat.FORBIDDEN.wrap("resourceInfo is null");
        }
        if (!AuthUtil.verify(userId, resourceInfo.getResource_id(), resourceInfo.getResource_type(), OperationType.MODIFYUSER)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if (!StringUtils.isBlank(resourceInfo.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, resourceInfo.checkLegality());
        }

        setResourceInfo(resourceInfo);

        ResourceHistory resourceHistory = new ResourceHistory(resourceInfo.getResource_type().name(), new Long(resourceInfo.getResource_id()).intValue(),
                OperationType.ADDUSER.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getResourceUsers(ResourceType resourceType, Long resourceId, Long userId) {
        if (!AuthUtil.verify(userId, resourceId, resourceType, OperationType.GETUSER)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        List<Resource> resources = resourceMapper.getResourceByResourceIdAndType(resourceId, resourceType);
        if (resources == null) {
            return ResultStat.OK.wrap(null);
        }

        return ResultStat.OK.wrap(getResourceOwnerInfo(resources, resourceId, resourceType));
    }

    @Override
    public HttpResponseTemp<?> getResourceUsersOnly(ResourceType resourceType, Long resourceId, Long userId) {
        if (!AuthUtil.verify(userId, resourceId, resourceType, OperationType.GETUSER)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        List<Resource> resources = resourceMapper.getResourceByResourceIdAndType(resourceId, resourceType);
        if (resources == null) {
            return ResultStat.OK.wrap(null);
        }

        return ResultStat.OK.wrap(getResourceOwnerInfoUserOnly(resources, resourceId, resourceType));
    }

    @Override
    public HttpResponseTemp<?> getResourcesUsers(ResourceType resourceType, Long userId) {
        List<Resource> resourceList = AuthUtil.getResourceList(userId, resourceType);
        if (resourceList == null) {
            return ResultStat.OK.wrap(null);
        }
        List<ResourceOwnerInfo> ownerInfos = new LinkedList<>();
        for (Resource tmpResource : resourceList) {
            List<Resource> resources = resourceMapper.getResourceByResourceIdAndType(tmpResource.getResource_id(), resourceType);
            if (resources == null || resources.size() == 0) {
                continue;
            }
            ResourceOwnerInfo ownerInfo = getResourceOwnerInfo(resources, tmpResource.getResource_id(), resourceType);
            if (ownerInfo != null) {
                ownerInfos.add(ownerInfo);
            }
        }
        return ResultStat.OK.wrap(ownerInfos);
    }

    @Override
    public HttpResponseTemp<?> getResourcesUsersOnly(ResourceType resourceType, Long userId) {
        List<Resource> resourceList = AuthUtil.getResourceList(userId, resourceType);
        if (resourceList == null) {
            return ResultStat.OK.wrap(null);
        }
        List<ResourceOwnerInfo> ownerInfos = new LinkedList<>();
        for (Resource tmpResource : resourceList) {
            List<Resource> resources = resourceMapper.getResourceByResourceIdAndType(tmpResource.getResource_id(), resourceType);
            if (resources == null || resources.size() == 0) {
                continue;
            }
            ResourceOwnerInfo ownerInfo = getResourceOwnerInfoUserOnly(resources, tmpResource.getResource_id(), resourceType);
            if (ownerInfo != null) {
                ownerInfos.add(ownerInfo);
            }
        }
        return ResultStat.OK.wrap(ownerInfos);
    }

    @Override
    public HttpResponseTemp<?> deleteResourceUser(ResourceType resourceType, Long resourceId, ResourceOwnerType ownerType, Long ownerId, long userId) {
        if (!AuthUtil.verify(userId, resourceId, resourceType, OperationType.DELETEUSER)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        resourceMapper.deleteResource(resourceType, resourceId, ownerType, ownerId);

        ResourceHistory resourceHistory = new ResourceHistory(resourceType.getResourceName(), resourceId.intValue(),
                OperationType.DELETEUSER.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> getResourceListByGroupId(long groupId, ResourceType resourceType) {
        List<Resource> res = resourceMapper.getResourceByOwnerId(groupId,
                ResourceOwnerType.GROUP.name(), resourceType);
        return ResultStat.OK.wrap(res);
    }

    // decide whether a user own a resource
    public Resource getResourceByUserAndResourceId(long userId, long resourceId, ResourceType resourceType) {
        Resource resource = resourceMapper.getResource(userId, ResourceOwnerType.USER.name(),
                resourceId, resourceType);
        return resource;
    }

    // decide whether a resource is created by group
    public Resource getGroupResourceByResourceId(long resourceId, ResourceType resourceType) {
        Resource resource = resourceMapper.getGroupResource(ResourceOwnerType.GROUP.name(),
                resourceId, resourceType);
        return resource;
    }

    public void addResource(Resource resource) {
        if (resource == null) {
            return;
        }
        // if alread exist
        Resource res = resourceMapper.getResource(resource.getOwner_id(), resource.getOwner_type().name(),
                resource.getResource_id(), resource.getResource_type());
        if (res != null) {
            return;
        }
        resourceMapper.addResource(resource);
    }

    public void modifyResource(Resource resource) {
        resourceMapper.modifyResource(resource);
    }

    public void setResourceInfo(ResourceInfo resourceInfo) {
        if (resourceInfo == null || resourceInfo.getOwnerInfos() == null) {
            return;
        }
        for (OwnerInfo ownerInfo : resourceInfo.getOwnerInfos()) {
            Resource oldResource = resourceMapper.getResource(ownerInfo.getOwner_id(), ResourceOwnerType.USER.name(),
                    resourceInfo.getResource_id(), resourceInfo.getResource_type());
            if (oldResource != null) {
                oldResource.setRole(ownerInfo.getRole());
                oldResource.setUpdate_time(resourceInfo.getUpdate_time());
                resourceMapper.modifyResource(oldResource);
            } else {
                User user = userMapper.getUserById(ownerInfo.getOwner_id());
                if (user != null) {
                    resourceMapper.addResource(new Resource(resourceInfo.getResource_id(), resourceInfo.getResource_type(),
                            ownerInfo.getOwner_id(), ownerInfo.getOwner_type(), ownerInfo.getRole(), resourceInfo.getUpdate_time()));
                }
            }
        }
    }

    public ResourceOwnerInfo getResourceOwnerInfo(List<Resource> resources, long resourceId, ResourceType resourceType) {
        ResourceOwnerInfo ownerInfo = new ResourceOwnerInfo();
        ownerInfo.setResourceId(resourceId);
        String resourceName = getResourceNameByIdAndType(resourceId, resourceType);
        if (StringUtils.isBlank(resourceName)) {
            return null;
        }
        ownerInfo.setResourceName(resourceName);
        ownerInfo.setResourceType(resourceType);
        if (resources == null) {
            return ownerInfo;
        }
        for (Resource resource : resources) {
            if (resource.getOwner_type().equals(ResourceOwnerType.GROUP)) {
                ResourceGroupInfo groupInfo = new ResourceGroupInfo(resource.getOwner_id(), resource.getOwner_type(), resource.getRole(), resource.update_time());
                List<UserGroup> userGroups = userGroupMapper.getAllUsersInGroup(resource.getOwner_id());
                if (userGroups != null) {
                    for (UserGroup userGroup : userGroups) {
                        User user = userMapper.getUserById(userGroup.getUser_id());
                        if (user != null) {
                            ResourceUserInfo userInfo = new ResourceUserInfo(user.getId(), resource.getOwner_type(), userGroup.getRole(), resource.update_time(), user.getUsername(), user.getEmail(), user.getPhone());
                            groupInfo.addUserInfo(userInfo);
                        }
                    }
                    ownerInfo.setGroupInfo(groupInfo);
                }
            } else if (resource.getOwner_type().equals(ResourceOwnerType.USER)) {
                User user = userMapper.getUserById(resource.getOwner_id());
                if (user != null) {
                    ResourceUserInfo userInfo = new ResourceUserInfo(user.getId(), resource.getOwner_type(), resource.getRole(), resource.update_time(), user.getUsername(), user.getEmail(), user.getPhone());
                    ownerInfo.addUserInfo(userInfo);
                }
            }
        }
        return ownerInfo;
    }

    public ResourceOwnerInfo getResourceOwnerInfoUserOnly(List<Resource> resources, long resourceId, ResourceType resourceType) {
        ResourceOwnerInfo ownerInfo = new ResourceOwnerInfo();
        ownerInfo.setResourceId(resourceId);
        String resourceName = getResourceNameByIdAndType(resourceId, resourceType);
        if (StringUtils.isBlank(resourceName)) {
            return null;
        }
        ownerInfo.setResourceName(resourceName);
        ownerInfo.setResourceType(resourceType);
        if (resources == null) {
            return ownerInfo;
        }
        for (Resource resource : resources) {
            if (resource.getOwner_type().equals(ResourceOwnerType.GROUP)) {
                List<UserGroup> userGroups = userGroupMapper.getAllUsersInGroup(resource.getOwner_id());
                if (userGroups != null) {
                    for (UserGroup userGroup : userGroups) {
                        User user = userMapper.getUserById(userGroup.getUser_id());
                        if (user != null) {
                            ResourceUserInfo userInfo = new ResourceUserInfo(user.getId(), ResourceOwnerType.USER, userGroup.getRole(), resource.update_time(), user.getUsername(), user.getEmail(), user.getPhone());
                            ownerInfo.addUserInfo(userInfo);
                        }
                    }
                }
            } else if (resource.getOwner_type().equals(ResourceOwnerType.USER)) {
                User user = userMapper.getUserById(resource.getOwner_id());
                if (user != null) {
                    ResourceUserInfo userInfo = new ResourceUserInfo(user.getId(), resource.getOwner_type(), resource.getRole(), resource.update_time(), user.getUsername(), user.getEmail(), user.getPhone());
                    ownerInfo.addUserInfo(userInfo);
                }
            }
        }
        return ownerInfo;
    }

    public String getResourceNameByIdAndType(long resourceId, ResourceType type) {
        switch (type) {
            case PROJECT:
                ProjectBasic projectBasic = projectBasicMapper.getProjectBasicById(new Long(resourceId).intValue());
                if (projectBasic != null) {
                    return projectBasic.getName();
                } else {
                    return null;
                }
            case CLUSTER:
                ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicById(new Long(resourceId).intValue());
                if (clusterBasic != null) {
                    return clusterBasic.getName();
                } else {
                    return null;
                }
            case DEPLOY:
                Deployment deployment = deploymentMapper.getDeploy(resourceId);
                if (deployment != null) {
                    return deployment.getDeployName();
                } else {
                    return null;
                }
            default:
                return null;
        }
    }
}
