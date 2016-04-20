package org.domeos.framework.api.service.auth.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.consolemodel.auth.GroupMember;
import org.domeos.framework.api.consolemodel.auth.GroupMembers;
import org.domeos.framework.api.consolemodel.auth.Namespace;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.Group;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.auth.related.LoginType;
import org.domeos.framework.api.model.global.LdapInfo;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.service.auth.UserGroupService;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.engine.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by zhenfengchen on 15-11-20.
 */
@Service("userGroupService")
public class UserGroupServiceImpl implements UserGroupService {
    @Autowired
    AuthBiz authBiz;
    @Autowired
    GlobalBiz globalBiz;

    @Override
    public HttpResponseTemp<?> addUserToGroup(UserGroupMap userGroup) {
        addUserGroup(userGroup);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteAllUserInGroup(int groupId) {
        authBiz.deleteAllUserInGroup(groupId);
        return ResultStat.OK.wrap(null);
    }

    public void addUserGroup(UserGroupMap userGroup) {
        int exist = authBiz.userExistInGroup(userGroup);
        if (exist != 0) {
            authBiz.modifyUserGroup(userGroup);
        } else {
            authBiz.addUserGroup(userGroup);
        }
    }

    @Override
    public HttpResponseTemp<?> addGroupMember(int userId, UserGroupMap userGroup) {
        AuthUtil.groupVerify(userId, userGroup.getGroupId(), OperationType.ADDGROUPMEMBER, userGroup.getUserId());
        int exist = authBiz.userExistInGroup(userGroup);
        if (exist != 0) {
            authBiz.modifyUserGroup(userGroup);
        } else {
            authBiz.addUserGroup(userGroup);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> addGroupMembers(int userId, GroupMembers members) {
        if (members == null) {
            throw new PermitException("group is null");
        }
        AuthUtil.groupVerify(userId, members.getGroupId(), OperationType.ADDGROUPMEMBER, -1);
        String membersLegalityInfo = members.checkLegality();
        if (!StringUtils.isBlank(membersLegalityInfo)) {
            throw ApiException.wrapMessage(ResultStat.GROUP_MEMBER_FAILED, membersLegalityInfo);
        }
        for (UserGroupMap userGroup : members.getMembers()) {
            userGroup.setGroupId(members.getGroupId());
            userGroup.setUpdateTime(System.currentTimeMillis());
            addUserGroup(userGroup);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteGroupMember(int userId, UserGroupMap userGroup) {
        if (userGroup == null) {
            throw new PermitException("userGroup is null");
        }
        AuthUtil.groupVerify(userId, userGroup.getGroupId(), OperationType.DELETEGROUPMEMBER, userGroup.getUserId());
        authBiz.deleteUserGroup(userGroup);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> listGroupMember(int userId, int groupId) {
        AuthUtil.groupVerify(userId, groupId, OperationType.LISTGROUPMEMBER, -1);
        List<UserGroupMap> userGroups = authBiz.getAllUsersInGroup(groupId);
        List<GroupMember> res = null;
        if (userGroups != null) {
            res = new ArrayList<>();
            for (UserGroupMap userGroup : userGroups) {
                GroupMember groupMember = new GroupMember(userGroup);
                User user = authBiz.getUserById(groupMember.getUserId());
                groupMember.setUsername(user.getUsername());
                res.add(groupMember);
            }
        }
        return ResultStat.OK.wrap(res);
    }

    @Override
    public HttpResponseTemp<?> getNamespace(User user) {
        if (user == null) {
            throw ApiException.wrapResultStat(ResultStat.NAMESPACE_FAILED);
        }
        List<Integer> groupIds;
        if (AuthUtil.isAdmin(user.getId())) {
            groupIds = authBiz.getAllGroupIds();
        } else {
            groupIds =authBiz.getGroupIds(user.getId());
        }
        List<Namespace> res = new ArrayList<>();
        String userName = user.getUsername();
        LdapInfo ldapInfo = globalBiz.getLdapInfo();
        if (ldapInfo != null) {
            if (user.getLoginType() != null && userName != null && user.getLoginType() == LoginType.LDAP && ldapInfo.getEmailSuffix() != null) {
                userName = userName.substring(0, userName.length() - ldapInfo.getEmailSuffix().length());
            }
        }
        Namespace namespace = new Namespace(ResourceOwnerType.USER.name(), userName, user.getId());
        res.add(namespace);
        if (groupIds == null) {
            return ResultStat.OK.wrap(res);
        }
        for (int groupId : groupIds) {
            Group group = authBiz.getGroupById(groupId);
            if (group != null) {
                Namespace item = new Namespace(ResourceOwnerType.GROUP.name(), group.getName(), groupId);
                res.add(item);
            }
        }
        return ResultStat.OK.wrap(res);
    }
}
