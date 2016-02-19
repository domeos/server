package org.domeos.api.service.group.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.group.GroupMapper;
import org.domeos.api.mapper.group.UserGroupMapper;
import org.domeos.api.mapper.user.UserMapper;
import org.domeos.api.model.console.group.GroupMember;
import org.domeos.api.model.console.group.GroupMembers;
import org.domeos.api.model.console.user.UserInfo;
import org.domeos.api.model.global.LdapInfo;
import org.domeos.api.model.group.Group;
import org.domeos.api.model.group.Namespace;
import org.domeos.api.model.group.UserGroup;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.api.model.user.User;
import org.domeos.api.model.user.UserLoginType;
import org.domeos.api.service.global.GlobalService;
import org.domeos.api.service.group.UserGroupService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by zhenfengchen on 15-11-20.
 */
@Service("userGroupService")
public class UserGroupServiceImpl implements UserGroupService {
    @Autowired
    UserGroupMapper userGroupMapper;
    @Autowired
    GroupMapper groupMapper;
    @Autowired
    UserMapper userMapper;
    @Autowired
    GlobalService globalService;

    public HttpResponseTemp<?> addUserToGroup(UserGroup userGroup) {
        addUserGroup(userGroup);
        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> deleteAllUserInGroup(long groupId) {
        userGroupMapper.deleteAllUserInGroup(groupId);
        return ResultStat.OK.wrap(null);
    }

    public void addUserGroup(UserGroup userGroup) {
        int exist = userGroupMapper.userExistInGroup(userGroup);
        if (exist != 0) {
            userGroupMapper.modifyUserGroup(userGroup);
        } else {
            userGroupMapper.addUserGroup(userGroup);
        }
    }

    public  UserGroup getUserGroup(long user_id, long group_id) {
        return userGroupMapper.getUserGroup(user_id, group_id);
    }

    public int masterCountInGroup(long group_id) {
        return userGroupMapper.masterCountInGroup(group_id);
    }

    public HttpResponseTemp<?> addGroupMember(long userId, UserGroup userGroup) {
        if (!AuthUtil.groupVerify(userId, userGroup.getGroup_id(),
            OperationType.ADDGROUPMEMBER, userGroup.getUser_id())) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        int exist = userGroupMapper.userExistInGroup(userGroup);
        if (exist != 0) {
            userGroupMapper.modifyUserGroup(userGroup);
        } else {
            userGroupMapper.addUserGroup(userGroup);
        }
        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> addGroupMembers(long userId, GroupMembers members) {
        if (members == null) {
            return ResultStat.FORBIDDEN.wrap("Group is null");
        }
        if (!AuthUtil.groupVerify(userId, members.getGroupId(),
            OperationType.ADDGROUPMEMBER, -1)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        String membersLegalityInfo = members.checkLegality();
        if (!StringUtils.isBlank(membersLegalityInfo)) {
            return ResultStat.GROUP_MEMBER_FAILED.wrap(membersLegalityInfo);
        }
        for (UserGroup userGroup : members.getMembers()) {
            userGroup.setGroup_id(members.getGroupId());
            userGroup.setUpdate_time(new Date());
            addUserGroup(userGroup);
        }
        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> deleteGroupMember(long userId, UserGroup userGroup) {
        if (userGroup == null) {
            return ResultStat.FORBIDDEN.wrap("userGroup is null");
        }
        if (!AuthUtil.groupVerify(userId, userGroup.getGroup_id(),
            OperationType.DELETEGROUPMEMBER, userGroup.getUser_id())) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        userGroupMapper.deleteUserGroup(userGroup);
        return ResultStat.OK.wrap(null);
    }

    public HttpResponseTemp<?> listGroupMember(long userId, long groupId) {
        if (!AuthUtil.groupVerify(userId, groupId,
            OperationType.LISTGROUPMEMBER, -1)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        List<UserGroup> userGroups = userGroupMapper.getAllUsersInGroup(groupId);
        List<GroupMember> res = null;
        if (userGroups != null) {
            res = new ArrayList<>();
            for (UserGroup userGroup : userGroups) {
                GroupMember groupMember = new GroupMember(userGroup);
                UserInfo userInfo = userMapper.getUserInfoById(groupMember.getUser_id());
                groupMember.setUser_name(userInfo.getUsername());
                res.add(groupMember);
            }
        }
        return ResultStat.OK.wrap(res);
    }

    public HttpResponseTemp<?> getNamespace(User user) {
        if (user == null) {
            return ResultStat.NAMESPACE_FAILED.wrap(null);
        }
        List<Long> groupIds = userGroupMapper.getGroupIds(user.getId());
        List<Namespace> res = new ArrayList<>();
        String userName = user.getUsername();
        LdapInfo ldapInfo = globalService.getLdapInfo();
        if (ldapInfo != null) {
            if (user.getLogin_type() != null && userName != null && user.getLogin_type().equals(UserLoginType.LDAP.name()) && ldapInfo.getEmailSuffix() != null) {
                userName = userName.substring(0, userName.length() - ldapInfo.getEmailSuffix().length());
            }
        }
        Namespace namespace = new Namespace(ResourceOwnerType.USER.name(), userName, user.getId());
        res.add(namespace);
        if (groupIds == null) {
            return ResultStat.OK.wrap(res);
        }
        for (Long groupId : groupIds) {
            Group group = groupMapper.getGroupById(groupId);
            if (group != null) {
                Namespace item = new Namespace(ResourceOwnerType.GROUP.name(), group.getName(), groupId);
                res.add(item);
            }
        }
        return ResultStat.OK.wrap(res);
    }
}
