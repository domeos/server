package org.domeos.framework.api.mapper.alarm;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.framework.api.consolemodel.alarm.AlarmEventInfoDraft;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Repository
public interface AlarmEventInfoMapper {

    @Select("SELECT * FROM alarm_event_info_draft")
    List<AlarmEventInfoDraft> listAlarmEventInfoDraft();

    @Select("SELECT id FROM alarm_event_info_draft WHERE strategy_id IN (SELECT id FROM portal.strategy WHERE tpl_id=#{templateId})")
    List<String> listAlarmEventInfoIdByTemplateId(@Param("templateId") long templateId);

    @Select("SELECT id FROM alarm_event_info_draft WHERE strategy_id IN (SELECT id FROM portal.strategy WHERE tags IN (${containerIds}))")
    List<String> listAlarmEventInfoIdByContainerIds(@Param("containerIds") String containerIds);
}
