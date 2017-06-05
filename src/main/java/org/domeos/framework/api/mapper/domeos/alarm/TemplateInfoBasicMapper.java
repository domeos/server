package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.TemplateInfoBasic;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface TemplateInfoBasicMapper {

    @Select("SELECT * FROM alarm_template_info LEFT OUTER JOIN alarm_template_host_group_bind ON " +
            "alarm_template_info.id = alarm_template_host_group_bind.templateId WHERE alarm_template_host_group_bind.hostGroupId " +
            "= #{hostGroupId} AND alarm_template_info.isRemoved = 0 order by alarm_template_host_group_bind.bindTime")
    List<TemplateInfoBasic> getTemplateInfoBasicByHostGroupId(@Param("hostGroupId") long hostGroupId);

    @Select("SELECT * FROM alarm_template_info LEFT OUTER JOIN alarm_template_user_group_bind ON " +
            "alarm_template_info.id = alarm_template_user_group_bind.templateId WHERE alarm_template_user_group_bind.userGroupId " +
            "= #{userGroupId} AND alarm_template_info.isRemoved = 0 order by alarm_template_user_group_bind.bindTime")
    List<TemplateInfoBasic> getTemplateInfoBasicByUserGroupId(@Param("userGroupId") long hostGroupId);

    @Select("SELECT * FROM alarm_template_info WHERE isRemoved = 0 ORDER BY createTime DESC")
    List<TemplateInfoBasic> listTemplateInfoBasic();

    @Select("SELECT * FROM alarm_template_info WHERE isRemoved = 0 AND templateName=#{templateName}")
    TemplateInfoBasic getTemplateInfoBasicByName(@Param("templateName") String templateName);

    @Select("SELECT * FROM alarm_template_info WHERE isRemoved = 0 AND id=#{id}")
    TemplateInfoBasic getTemplateInfoBasicById(@Param("id") long id);

    @Insert("INSERT INTO alarm_template_info(templateName, templateType, creatorId, creatorName, createTime, updateTime) VALUES (" +
            "#{templateName}, #{templateType}, #{creatorId}, #{creatorName}, #{createTime}, #{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addTemplateInfoBasic(TemplateInfoBasic templateInfoBasic);

    @Update("UPDATE alarm_template_info SET templateName=#{templateName}, updateTime=#{updateTime} WHERE id=#{id}")
    int updateTemplateInfoBasicById(TemplateInfoBasic templateInfoBasic);

    @Update("UPDATE alarm_template_info SET callbackId=#{callbackId} WHERE id=#{id}")
    int setTemplateCallbackIdByTemplateId(@Param("id") long id, @Param("callbackId") long callbackId);

    @Update("UPDATE alarm_template_info SET deployId=#{deployId} WHERE id=#{id}")
    int setTemplateDeployIdByTemplateId(@Param("id") long id, @Param("deployId") long deployId);

    @Update("UPDATE alarm_template_info SET isRemoved = 1 WHERE id=#{id}")
    int deleteTemplateInfoBasicById(@Param("id") long id);

    @Select("SELECT deployId FROM alarm_template_info WHERE id=#{id}")
    Long getDeployIdByTemplateId(@Param("id") long id);
}
