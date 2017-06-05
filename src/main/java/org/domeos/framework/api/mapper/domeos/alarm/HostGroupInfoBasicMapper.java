package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.HostGroupInfoBasic;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface HostGroupInfoBasicMapper {

    @Select("SELECT * FROM alarm_host_group_info")
    List<HostGroupInfoBasic> listHostGroupInfoBasic();

    @Select("SELECT * FROM alarm_host_group_info WHERE id=#{id}")
    HostGroupInfoBasic getHostGroupInfoBasicById(@Param("id") long id);

    @Select("SELECT * FROM alarm_host_group_info WHERE hostGroupName=#{hostGroupName}")
    HostGroupInfoBasic getHostGroupInfoBasicByName(@Param("hostGroupName") String hostGroupName);

    @Insert("INSERT INTO alarm_host_group_info(hostGroupName, creatorId, creatorName, createTime, updateTime) VALUES (" +
            "#{hostGroupName}, #{creatorId}, #{creatorName}, #{createTime}, #{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addHostGroupInfoBasic(HostGroupInfoBasic hostGroupInfoBasic);

    @Update("UPDATE alarm_host_group_info SET hostGroupName=#{hostGroupName}, updateTime=#{updateTime} WHERE id=#{id}")
    int updateHostGroupInfoBasicById(HostGroupInfoBasic hostGroupInfoBasic);

    @Delete("DELETE FROM alarm_host_group_info WHERE id=#{id}")
    int deleteHostGroupInfoBasicById(@Param("id") long id);

    @Select("SELECT * FROM alarm_host_group_info WHERE id IN " +
            "(SELECT hostGroupId FROM alarm_template_host_group_bind WHERE templateId=#{templateId})")
    List<HostGroupInfoBasic> listHostGroupInfoBasicByTemplateId(@Param("templateId") long templateId);
}
