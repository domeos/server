package org.domeos.framework.api.service.alarm;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.model.alarm.AlarmGroupMember;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/18.
 */
public interface AlarmGroupService {

    /**
     *
     * @return
     */
    HttpResponseTemp<?> listAlarmGroupMembers();

    /**
     *
     * @param alarmGroupMembers
     * @return
     */
    HttpResponseTemp<?> addAlarmGroupMembers(List<AlarmGroupMember> alarmGroupMembers);

    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteAlarmGroupMember(int userId);
}
