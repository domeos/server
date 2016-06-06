package org.domeos.framework.api.service.alarm.impl;

import org.apache.log4j.Logger;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.alarm.AlarmGroupMember;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.alarm.AlarmGroupService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by baokangwang on 2016/4/18.
 */
@Service("alarmGroupService")
public class AlarmGroupServiceImpl implements AlarmGroupService {

    private static Logger logger = Logger.getLogger(AlarmGroupServiceImpl.class);

    @Autowired
    AuthBiz authBiz;

    @Override
    public HttpResponseTemp<?> listAlarmGroupMembers() {

        AuthUtil.groupVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, OperationType.GET, 0);

        List<UserGroupMap> userGroups = authBiz.getAllUsersInGroup(GlobalConstant.alarmGroupId);
        List<AlarmGroupMember> alarmGroupMembers = new ArrayList<>();
        if (userGroups != null) {
            for (UserGroupMap userGroup : userGroups) {
                AlarmGroupMember alarmGroupMember = new AlarmGroupMember();
                alarmGroupMember.setUserId(userGroup.getUserId());
                alarmGroupMember.setRole(userGroup.getRole());
                User user = authBiz.getUserById(alarmGroupMember.getUserId());
                alarmGroupMember.setUsername(user.getUsername());
                alarmGroupMembers.add(alarmGroupMember);
            }
        }

        return ResultStat.OK.wrap(alarmGroupMembers);
    }

    @Override
    public HttpResponseTemp<?> addAlarmGroupMembers(List<AlarmGroupMember> alarmGroupMembers) {

        if (alarmGroupMembers == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "alarm group member is null");
        }

        AuthUtil.groupVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, OperationType.MODIFYGROUPMEMBER, 0);

        for (AlarmGroupMember alarmGroupMember : alarmGroupMembers) {
            UserGroupMap userGroup = new UserGroupMap();
            userGroup.setGroupId(GlobalConstant.alarmGroupId);
            userGroup.setUserId(alarmGroupMember.getUserId());
            userGroup.setRole(alarmGroupMember.getRole());
            userGroup.setUpdateTime(System.currentTimeMillis());
            int exist = authBiz.userExistInGroup(userGroup);
            if (exist != 0) {
                authBiz.modifyUserGroup(userGroup);
            } else {
                authBiz.addUserGroup(userGroup);
            }
        }

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteAlarmGroupMember(int userId) {

        AuthUtil.groupVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, OperationType.DELETE, userId);

        UserGroupMap userGroup = new UserGroupMap();
        userGroup.setUserId(userId);
        userGroup.setGroupId(GlobalConstant.alarmGroupId);
        authBiz.deleteUserGroup(userGroup);

        return ResultStat.OK.wrap(null);
    }
}
