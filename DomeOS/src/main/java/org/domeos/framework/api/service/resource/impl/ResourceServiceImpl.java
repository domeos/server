package org.domeos.framework.api.service.resource.impl;

/**
 * Created by feiliu206363 on 2016/4/6.
 */

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.*;
import org.domeos.framework.api.service.resource.ResourceService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
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
    ResourceBiz resourceBiz;
    @Autowired
    AuthBiz authBiz;


    @Override
    public List<Resource> getResourceListByUserId(ResourceType resourceType, int userId) {
        return resourceBiz.getResourceByOwnerId(userId, ResourceOwnerType.USER, resourceType);
    }

    public List<Resource> getGroupResourceListByUserId(ResourceType resourceType, int userId) {
        return resourceBiz.getGroupResourceByUserId(userId, ResourceOwnerType.GROUP.name(), resourceType);
    }

    @Override
    public void deleteResourceByIdAndType(ResourceType resourceType, int resourceId) {
        resourceBiz.deleteResourceByIdAndType(resourceId, resourceType);
    }

    @Override
    public List<Resource> getAllResourceByType(ResourceType resourceType) {
        return resourceBiz.getAllResourcesByType(resourceType);
    }

    @Override
    public Role getUserRoleInResource(ResourceType resourceType, int resourceId, int userId) {
        List<Resource> resources = resourceBiz.getResourceByResourceIdAndType(resourceId, resourceType);
        if (resources == null) {
            return Role.NOTEXIST;
        }
        Role roleType = Role.NOTEXIST;
        for (Resource resource : resources) {
            if (resource.getOwnerType() == ResourceOwnerType.USER) {
                if (userId == resource.getOwnerId() && resource.getRole().getAccessLevel() < roleType.getAccessLevel()) {
                    roleType = resource.getRole();
                }
            }
            if (resource.getOwnerType() == ResourceOwnerType.GROUP) {
                UserGroupMap userGroup = authBiz.getUserGroup(userId, resource.getOwnerId());
                if (userGroup != null && userGroup.getRole().getAccessLevel() < roleType.getAccessLevel()) {
                    roleType = userGroup.getRole();
                }
            }
        }
        return roleType;
    }


    @Override
    public HttpResponseTemp<?> setResource(ResourceInfo resourceInfo) {
        if (resourceInfo == null) {
            return ResultStat.FORBIDDEN.wrap("resourceInfo is null");
        }
        User user = CurrentThreadInfo.getUser();
        AuthUtil.verify(user.getId(), resourceInfo.getResourceId(), resourceInfo.getResourceType(), OperationType.ADDUSER);

        if (!StringUtils.isBlank(resourceInfo.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, resourceInfo.checkLegality());
        }

        setResourceInfo(resourceInfo);

//        ResourceHistory resourceHistory = new ResourceHistory(resourceInfo.getResource_type().name(), new Long(resourceInfo.getResource_id()).intValue(),
//                OperationType.ADDUSER.getOperation(), userId, System.currentTimeMillis(), "OK");
//        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> updateResource(ResourceInfo resourceInfo) {
        if (resourceInfo == null) {
            throw ApiException.wrapMessage(ResultStat.FORBIDDEN, "resourceInfo is null");
        }
        User user = CurrentThreadInfo.getUser();
        AuthUtil.verify(user.getId(), resourceInfo.getResourceId(), resourceInfo.getResourceType(), OperationType.MODIFYUSER);

        if (!StringUtils.isBlank(resourceInfo.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, resourceInfo.checkLegality());
        }

        setResourceInfo(resourceInfo);

//        ResourceHistory resourceHistory = new ResourceHistory(resourceInfo.getResource_type().name(), new Long(resourceInfo.getResource_id()).intValue(),
//                OperationType.ADDUSER.getOperation(), userId, System.currentTimeMillis(), "OK");
//        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getResourceUsers(ResourceType resourceType, int resourceId) {
        User user = CurrentThreadInfo.getUser();
        AuthUtil.verify(user.getId(), resourceId, resourceType, OperationType.GETUSER);

        List<Resource> resources = resourceBiz.getResourceByResourceIdAndType(resourceId, resourceType);
        if (resources == null) {
            return ResultStat.OK.wrap(null);
        }

        return ResultStat.OK.wrap(getResourceOwnerInfo(resources, resourceId, resourceType));
    }

    @Override
    public HttpResponseTemp<?> getResourceUsersOnly(ResourceType resourceType, int resourceId) {
        User user = CurrentThreadInfo.getUser();
        AuthUtil.verify(user.getId(), resourceId, resourceType, OperationType.GETUSER);

        List<Resource> resources = resourceBiz.getResourceByResourceIdAndType(resourceId, resourceType);
        if (resources == null) {
            return ResultStat.OK.wrap(null);
        }

        return ResultStat.OK.wrap(getResourceOwnerInfoUserOnly(resources, resourceId, resourceType));
    }

    @Override
    public HttpResponseTemp<?> getResourcesUsers(ResourceType resourceType) {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        List<Resource> resourceList = AuthUtil.getResourceList(user.getId(), resourceType);
        if (resourceList == null) {
            return ResultStat.OK.wrap(null);
        }
        List<ResourceOwnerInfo> ownerInfos = new LinkedList<>();
        for (Resource tmpResource : resourceList) {
            List<Resource> resources = resourceBiz.getResourceByResourceIdAndType(tmpResource.getResourceId(), resourceType);
            if (resources == null || resources.size() == 0) {
                continue;
            }
            ResourceOwnerInfo ownerInfo = getResourceOwnerInfo(resources, tmpResource.getResourceId(), resourceType);
            if (ownerInfo != null) {
                ownerInfos.add(ownerInfo);
            }
        }
        return ResultStat.OK.wrap(ownerInfos);
    }

    @Override
    public HttpResponseTemp<?> getResourcesUsersOnly(ResourceType resourceType) {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        List<Resource> resourceList = AuthUtil.getResourceList(user.getId(), resourceType);
        if (resourceList == null) {
            return ResultStat.OK.wrap(null);
        }
        List<ResourceOwnerInfo> ownerInfos = new LinkedList<>();
        for (Resource tmpResource : resourceList) {
            List<Resource> resources = resourceBiz.getResourceByResourceIdAndType(tmpResource.getResourceId(), resourceType);
            if (resources == null || resources.size() == 0) {
                continue;
            }
            ResourceOwnerInfo ownerInfo = getResourceOwnerInfoUserOnly(resources, tmpResource.getResourceId(), resourceType);
            if (ownerInfo != null) {
                ownerInfos.add(ownerInfo);
            }
        }
        return ResultStat.OK.wrap(ownerInfos);
    }

    @Override
    public HttpResponseTemp<?> deleteResourceUser(ResourceType resourceType, int resourceId, ResourceOwnerType ownerType, int ownerId) {
        User user = CurrentThreadInfo.getUser();
        AuthUtil.verify(user.getId(), resourceId, resourceType, OperationType.DELETEUSER);

        resourceBiz.deleteResource(resourceType, resourceId, ownerType, ownerId);

//        ResourceHistory resourceHistory = new ResourceHistory(resourceType.getResourceName(), resourceId.intValue(),
//                OperationType.DELETEUSER.getOperation(), userId, System.currentTimeMillis(), "OK");
//        resourceHistoryMapper.addResourceHistory(resourceHistory);

        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> getResourceListByGroupId(int groupId, ResourceType resourceType) {
        List<Resource> res = resourceBiz.getResourceByOwnerId(groupId, ResourceOwnerType.GROUP, resourceType);
        return ResultStat.OK.wrap(res);
    }

    // decide whether a user own a resource
    public Resource getResourceByUserAndResourceId(int userId, int resourceId, ResourceType resourceType) {
        return resourceBiz.getResource(userId, ResourceOwnerType.USER, resourceId, resourceType);
    }

    // decide whether a resource is created by group
    public Resource getGroupResourceByResourceId(int resourceId, ResourceType resourceType) {
        return resourceBiz.getGroupResource(ResourceOwnerType.GROUP.name(),
                resourceId, resourceType);
    }

    public void addResource(Resource resource) {
        if (resource == null) {
            return;
        }
        // if alread exist
        Resource res = resourceBiz.getResource(resource.getOwnerId(), resource.getOwnerType(),
                resource.getResourceId(), resource.getResourceType());
        if (res != null) {
            return;
        }
        resourceBiz.addResource(resource);
    }

    public void modifyResource(Resource resource) {
        resourceBiz.modifyResource(resource);
    }

    public void setResourceInfo(ResourceInfo resourceInfo) {
        if (resourceInfo == null || resourceInfo.getOwnerInfos() == null) {
            return;
        }
        for (OwnerInfo ownerInfo : resourceInfo.getOwnerInfos()) {
            Resource oldResource = resourceBiz.getResource(ownerInfo.getOwnerId(), ResourceOwnerType.USER,
                    resourceInfo.getResourceId(), resourceInfo.getResourceType());
            if (oldResource != null) {
                oldResource.setRole(ownerInfo.getRole());
                oldResource.setUpdateTime(resourceInfo.getUpdateTime());
                resourceBiz.modifyResource(oldResource);
            } else {
                User user = authBiz.getUserById(ownerInfo.getOwnerId());
                if (user != null) {
                    resourceBiz.addResource(new Resource(resourceInfo.getResourceId(), resourceInfo.getResourceType(),
                            ownerInfo.getOwnerId(), ownerInfo.getOwnerType(), ownerInfo.getRole(), resourceInfo.getUpdateTime()));
                }
            }
        }
    }

    public ResourceOwnerInfo getResourceOwnerInfo(List<Resource> resources, int resourceId, ResourceType resourceType) {
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
            if (resource.getOwnerType().equals(ResourceOwnerType.GROUP)) {
                ResourceGroupInfo groupInfo = new ResourceGroupInfo(resource.getOwnerId(), resource.getOwnerType(),
                        resource.getRole(), resource.getUpdateTime());
                List<UserGroupMap> userGroups = authBiz.getAllUsersInGroup(resource.getOwnerId());
                if (userGroups != null) {
                    for (UserGroupMap userGroup : userGroups) {
                        User user = authBiz.getUserById(userGroup.getUserId());
                        if (user != null) {
                            ResourceUserInfo userInfo = new ResourceUserInfo(user.getId(), resource.getOwnerType(),
                                    userGroup.getRole(), resource.getUpdateTime(), user.getUsername(), user.getEmail(), user.getPhone());
                            groupInfo.addUserInfo(userInfo);
                        }
                    }
                    ownerInfo.setGroupInfo(groupInfo);
                }
            } else if (resource.getOwnerType().equals(ResourceOwnerType.USER)) {
                User user = authBiz.getUserById(resource.getOwnerId());
                if (user != null) {
                    ResourceUserInfo userInfo = new ResourceUserInfo(user.getId(), resource.getOwnerType(), resource.getRole(),
                            resource.getUpdateTime(), user.getUsername(), user.getEmail(), user.getPhone());
                    ownerInfo.addUserInfo(userInfo);
                }
            }
        }
        return ownerInfo;
    }

    public ResourceOwnerInfo getResourceOwnerInfoUserOnly(List<Resource> resources, int resourceId, ResourceType resourceType) {
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
            if (resource.getOwnerType().equals(ResourceOwnerType.GROUP)) {
                List<UserGroupMap> userGroups = authBiz.getAllUsersInGroup(resource.getOwnerId());
                if (userGroups != null) {
                    for (UserGroupMap userGroup : userGroups) {
                        User user = authBiz.getUserById(userGroup.getUserId());
                        if (user != null) {
                            ResourceUserInfo userInfo = new ResourceUserInfo(user.getId(), ResourceOwnerType.USER, userGroup.getRole(),
                                    resource.getUpdateTime(), user.getUsername(), user.getEmail(), user.getPhone());
                            ownerInfo.addUserInfo(userInfo);
                        }
                    }
                }
            } else if (resource.getOwnerType().equals(ResourceOwnerType.USER)) {
                User user = authBiz.getUserById(resource.getOwnerId());
                if (user != null) {
                    ResourceUserInfo userInfo = new ResourceUserInfo(user.getId(), resource.getOwnerType(), resource.getRole(),
                            resource.getUpdateTime(), user.getUsername(), user.getEmail(), user.getPhone());
                    ownerInfo.addUserInfo(userInfo);
                }
            }
        }
        return ownerInfo;
    }

    public String getResourceNameByIdAndType(int resourceId, ResourceType type) {
        String tableName;
        switch (type) {
            case PROJECT:
                tableName = GlobalConstant.PROJECT_TABLE_NAME;
                break;
            case CLUSTER:
                tableName = GlobalConstant.CLUSTER_TABLE_NAME;
                break;
            case DEPLOY:
                tableName = GlobalConstant.DEPLOY_TABLE_NAME;
                break;
            default:
                return null;
        }
        return resourceBiz.getNameById(tableName, resourceId);
    }
}

