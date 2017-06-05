package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface TemplateUserGroupBindMapper {

    @Insert("INSERT INTO alarm_template_user_group_bind(templateId, userGroupId, bindTime) VALUES (" +
            "#{templateId}, #{userGroupId}, #{bindTime})")
    int addTemplateUserGroupBind(@Param("templateId") long templateId, @Param("userGroupId") long userGroupId, @Param("bindTime") long bindTime);

    @Delete("DELETE FROM alarm_template_user_group_bind WHERE templateId=#{templateId}")
    int deleteTemplateUserGroupBindByTemplateId(@Param("templateId") long templateId);

    @Select("SELECT userGroupId FROM alarm_template_user_group_bind WHERE templateId=#{templateId}")
    List<Long> listUserGroupIdByTemplateId(@Param("templateId") long templateId);
}
