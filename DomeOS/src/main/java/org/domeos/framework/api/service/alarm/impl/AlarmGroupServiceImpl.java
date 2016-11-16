package org.domeos.framework.api.service.alarm.impl;

import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.alarm.AlarmGroupMember;
import org.domeos.framework.api.model.auth.User;
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

    private static Logger logger = LoggerFactory.getLogger(AlarmGroupServiceImpl.class);

    @Autowired
    AuthBiz authBiz;

    @Autowired
    CollectionBiz collectionBiz;

    @Override
    public HttpResponseTemp<?> listAlarmGroupMembers() {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, ResourceType.ALARM, OperationType.GET, 0);

        List<CollectionAuthorityMap> authorityMaps = collectionBiz.getAuthoritiesByCollectionIdAndResourceType(GlobalConstant.alarmGroupId,
                ResourceType.ALARM);
        List<AlarmGroupMember> alarmGroupMembers = new ArrayList<>();
        if (authorityMaps != null) {
            for (CollectionAuthorityMap authorityMap : authorityMaps) {
                AlarmGroupMember alarmGroupMember = new AlarmGroupMember();
                alarmGroupMember.setUserId(authorityMap.getUserId());
                alarmGroupMember.setRole(authorityMap.getRole());
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

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, ResourceType.ALARM, OperationType.MODIFYGROUPMEMBER, 0);

        for (AlarmGroupMember alarmGroupMember : alarmGroupMembers) {
            CollectionAuthorityMap collectionAuthorityMap = new CollectionAuthorityMap();
            collectionAuthorityMap.setCollectionId(GlobalConstant.alarmGroupId);
            collectionAuthorityMap.setUserId(alarmGroupMember.getUserId());
            collectionAuthorityMap.setRole(alarmGroupMember.getRole());
            collectionAuthorityMap.setResourceType(ResourceType.ALARM);
            collectionAuthorityMap.setUpdateTime(System.currentTimeMillis());
            int exist = collectionBiz.userExistInCollection(collectionAuthorityMap);
            if (exist != 0) {
                collectionBiz.modifyCollectionAuthorityMap(collectionAuthorityMap);
            } else {
                collectionBiz.addAuthority(collectionAuthorityMap);
            }
        }

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deleteAlarmGroupMember(int userId) {

        AuthUtil.collectionVerify(CurrentThreadInfo.getUserId(), GlobalConstant.alarmGroupId, ResourceType.ALARM, OperationType.DELETE, userId);

        CollectionAuthorityMap authorityMap = new CollectionAuthorityMap();
        authorityMap.setUserId(userId);
        authorityMap.setCollectionId(GlobalConstant.alarmGroupId);
        authorityMap.setResourceType(ResourceType.ALARM);
        collectionBiz.deleteAuthorityMap(authorityMap);

        return ResultStat.OK.wrap(null);
    }
}
