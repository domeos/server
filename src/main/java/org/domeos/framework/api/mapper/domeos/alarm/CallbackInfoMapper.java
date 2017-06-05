package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.CallBackInfo;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface CallbackInfoMapper {

    @Insert("INSERT INTO alarm_callback_info(url, beforeCallbackSms, beforeCallbackMail, afterCallbackSms, afterCallbackMail) VALUES (" +
            "#{url}, #{beforeCallbackSms}, #{beforeCallbackMail}, #{afterCallbackSms}, #{afterCallbackMail})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addCallBackInfo(CallBackInfo callBackInfo);

    @Delete("DELETE FROM alarm_callback_info WHERE id IN " +
            "(SELECT callbackId FROM alarm_template_info WHERE id=#{templateId})")
    int deleteCallbackInfoByTemplateId(@Param("templateId") long templateId);

    @Select("SELECT * FROM alarm_callback_info WHERE id IN " +
            "(SELECT callbackId FROM alarm_template_info WHERE id=#{templateId})")
    CallBackInfo getCallbackInfoByTemplateId(@Param("templateId") long templateId);
}
