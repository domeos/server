package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface TemplateHostGroupBindMapper {

    @Insert("INSERT INTO alarm_template_host_group_bind(templateId, hostGroupId, bindTime) VALUES (" +
            "#{templateId}, #{hostGroupId}, #{bindTime})")
    int addTemplateHostGroupBind(@Param("templateId") long templateId, @Param("hostGroupId") long hostGroupId, @Param("bindTime") long bindTime);

    @Delete("DELETE FROM alarm_template_host_group_bind WHERE hostGroupId=#{hostGroupId}")
    int deleteTemplateHostGroupBindByHostGroupId(@Param("hostGroupId") long hostGroupId);

    @Delete("DELETE FROM alarm_template_host_group_bind WHERE templateId=#{templateId}")
    int deleteTemplateHostGroupBindByTemplateId(@Param("templateId") long templateId);
}
