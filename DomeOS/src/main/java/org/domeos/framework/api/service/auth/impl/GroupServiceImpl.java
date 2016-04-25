package org.domeos.framework.api.service.auth.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.consolemodel.auth.GroupInfo;
import org.domeos.framework.api.consolemodel.auth.ResourceCountKey;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.auth.Group;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.auth.GroupService;
import org.domeos.framework.engine.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by zhenfengchen on 15-11-19.
 */
@Service("groupService")
public class GroupServiceImpl implements GroupService {
    @Autowired
    AuthBiz authBiz;
    @Autowired
    ResourceBiz resourceBiz;

    @Override
    public HttpResponseTemp<?> createGroup(Group group) {
        if (group == null) {
            throw ApiException.wrapMessage(ResultStat.GROUP_NOT_LEGAL, "group info is null");
        }

        if (!StringUtils.isBlank(group.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.GROUP_NOT_LEGAL, group.checkLegality());
        }

        if (authBiz.getGroupByName(group.getName()) != null) {
            throw ApiException.wrapResultStat(ResultStat.GROUP_EXISTED);
        }
        group.setCreateTime(System.currentTimeMillis());
        group.setUpdateTime(System.currentTimeMillis());
        group.setState(1);
        authBiz.createGroup(group);
        return ResultStat.OK.wrap(group);
    }

    @Override
    public HttpResponseTemp<?> deleteGroup(int userId, int groupId) {
        AuthUtil.groupVerify(userId, groupId, OperationType.DELETE, -1);
        Group group = authBiz.getGroupById(groupId);
        if (group == null) {
            throw ApiException.wrapResultStat(ResultStat.GROUP_NOT_EXIST);
        }
        group.setUpdateTime(System.currentTimeMillis());
        group.setState(0);
        authBiz.deleteGroup(group);
        return ResultStat.OK.wrap(group);
    }

    @Override
    public HttpResponseTemp<?> modifyGroup(Group group) {
        if (group == null) {
            return ResultStat.GROUP_NOT_EXIST.wrap(null);
        }
        Group groupInDB = authBiz.getGroupByName(group.getName());
        if (groupInDB == null) {
            return ResultStat.GROUP_NOT_EXIST.wrap(null);
        }
        groupInDB.setDescription(group.getDescription());
        group.setUpdateTime(System.currentTimeMillis());
        authBiz.modifyGroup(groupInDB);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getGroup(int groupId) {
        Group group = authBiz.getGroupById(groupId);
        if (group == null) {
            throw ApiException.wrapResultStat(ResultStat.GROUP_NOT_EXIST);
        }
        return ResultStat.OK.wrap(group);
    }

    @Override
    public HttpResponseTemp<List<GroupInfo>> listAllGroupInfo(int userId) {
        List<Group> groups;
        if (AuthUtil.isAdmin(userId)) {
            groups = authBiz.listAllGroup();
        } else {
            groups = authBiz.listAllGroupByUserId(userId);
        }
        if (groups == null || groups.size() == 0) {
            return ResultStat.OK.wrap(null);
        } else {
            List<GroupInfo> groupInfos = new ArrayList<>();
            for (Group group : groups) {
                GroupInfo groupInfo = new GroupInfo(group);
                int groupId = groupInfo.getId();
                // groupMembers
                List<UserGroupMap> members = authBiz.getAllUsersInGroup(groupId);
                groupInfo.addItemToCountMap(ResourceCountKey.memberCount, members);
                List<Resource> res = resourceBiz.getResourceByOwnerId(groupId, ResourceOwnerType.GROUP,
                        ResourceType.PROJECT);
                groupInfo.addItemToCountMap(ResourceCountKey.projectCount, res);
                res = resourceBiz.getResourceByOwnerId(groupId,
                        ResourceOwnerType.GROUP, ResourceType.DEPLOY);
                groupInfo.addItemToCountMap(ResourceCountKey.deployCount, res);
                res = resourceBiz.getResourceByOwnerId(groupId,
                        ResourceOwnerType.GROUP, ResourceType.CLUSTER);
                groupInfo.addItemToCountMap(ResourceCountKey.clusterCount, res);
                groupInfos.add(groupInfo);
            }
            return ResultStat.OK.wrap(groupInfos);
        }
    }

    public Group getGroupByName(String groupName) {
        return authBiz.getGroupByName(groupName);
    }
}
