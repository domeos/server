package org.domeos.api.service.group.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.group.GroupMapper;
import org.domeos.api.mapper.group.UserGroupMapper;
import org.domeos.api.mapper.resource.ResourceMapper;
import org.domeos.api.mapper.user.UserMapper;
import org.domeos.api.model.console.group.GroupInfo;
import org.domeos.api.model.console.group.ResourceCountKey;
import org.domeos.api.model.group.Group;
import org.domeos.api.model.group.UserGroup;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.api.service.group.GroupService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by zhenfengchen on 15-11-19.
 */
@Service("groupService")
public class GroupServiceImpl implements GroupService {
    @Autowired
    GroupMapper groupMapper;

    @Autowired
    UserGroupMapper userGroupMapper;

    @Autowired
    UserMapper userMapper;

    @Autowired
    ResourceMapper resourceMapper;

    public HttpResponseTemp<?> createGroup(Group group) {
        if (group == null) {
            return ResultStat.GROUP_NOT_LEGAL.wrap(null, "group info is null");
        }

        if (!StringUtils.isBlank(group.checkLegality())) {
            return ResultStat.GROUP_NOT_LEGAL.wrap(null, group.checkLegality());
        }

        if (groupMapper.getGroupByName(group.getName()) != null) {
            return ResultStat.GROUP_EXISTED.wrap(null);
        }
        group.setCreate_time(new Date());
        group.setUpdate_time(new Date());
        group.setStatus(1);
        groupMapper.addGroup(group);
        return ResultStat.OK.wrap(group);
    }

    public HttpResponseTemp<?> deleteGroup(long userId, long groupId) {
        if (!AuthUtil.groupVerify(userId, groupId, OperationType.DELETE, -1)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        Group group = groupMapper.getGroupById(groupId);
        if (group == null) {
            return ResultStat.GROUP_NOT_EXIST.wrap(null);
        }
        group.setUpdate_time(new Date());
        group.setStatus(0);
        groupMapper.deleteGroup(group);
        return ResultStat.OK.wrap(group);
    }

    public HttpResponseTemp<?> modifyGroup(Group group) {
        if (group == null) {
            return ResultStat.GROUP_NOT_EXIST.wrap(null);
        }
        Group groupInDB = groupMapper.getGroupByName(group.getName());
        if (groupInDB == null) {
            return ResultStat.GROUP_NOT_EXIST.wrap(null);
        }
        groupInDB.setDescription(group.getDescription());
        group.setUpdate_time(new Date());
        groupMapper.modifyGroup(groupInDB);
        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> getGroup(long groupId) {
        Group group = groupMapper.getGroupById(groupId);
        if (group == null) {
            return ResultStat.GROUP_NOT_EXIST.wrap(null);
        }
        return ResultStat.OK.wrap(group);
    }

    public HttpResponseTemp<List<GroupInfo>> listAllGroupInfo(long userId) {
        List<Group> groups;
        if (AuthUtil.isAdmin(userId)) {
            groups = groupMapper.listAllGroup();
        } else {
            groups = groupMapper.listAllGroupByUserId(userId);
        }
        if (groups == null || groups.size() == 0) {
            return ResultStat.OK.wrap(null);
        } else {
            List<GroupInfo> groupInfos = new ArrayList<>();
            for (Group group : groups) {
                GroupInfo groupInfo = new GroupInfo(group);
                long groupId = groupInfo.getId();
                // groupMembers
                List<UserGroup> members = userGroupMapper.getAllUsersInGroup(groupId);
                groupInfo.addItemToCountMap(ResourceCountKey.memberCount, members);
                List<Resource> res = resourceMapper.getResourceByOwnerId(groupId,
                    ResourceOwnerType.GROUP.name(), ResourceType.PROJECT);
                groupInfo.addItemToCountMap(ResourceCountKey.projectCount, res);
                res = resourceMapper.getResourceByOwnerId(groupId,
                    ResourceOwnerType.GROUP.name(), ResourceType.DEPLOY);
                groupInfo.addItemToCountMap(ResourceCountKey.deployCount, res);
                res = resourceMapper.getResourceByOwnerId(groupId,
                    ResourceOwnerType.GROUP.name(), ResourceType.CLUSTER);
                groupInfo.addItemToCountMap(ResourceCountKey.clusterCount, res);
                groupInfos.add(groupInfo);
            }
            return ResultStat.OK.wrap(groupInfos);
        }
    }

    public Group getGroupByName(String groupName) {
        return groupMapper.getGroupByName(groupName);
    }
}
