package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.UserGroupBasic;

import java.util.List;

/**
 * Created by KaiRen on 2016/9/27.
 */
@Mapper
public interface UserGroupInfoBasicMapper {
    @Select("SELECT * FROM alarm_user_group_info")
    List<UserGroupBasic> listUserGroupInfoBasic();

    @Select("SELECT * FROM alarm_user_group_info WHERE id=#{id}")
    UserGroupBasic getUserGroupInfoBasicById(@Param("id") long id);

    @Select("SELECT * FROM alarm_user_group_info WHERE userGroupName=#{userGroupName}")
    UserGroupBasic getUserGroupInfoBasicByName(@Param("userGroupName") String userGroupName);

    @Insert("INSERT INTO alarm_user_group_info(userGroupName, creatorId, creatorName, createTime, updateTime) VALUES (" +
            "#{userGroupName}, #{creatorId}, #{creatorName}, #{createTime}, #{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addUserGroupInfoBasic(UserGroupBasic userGroupBasic);

    @Update("UPDATE alarm_user_group_info SET userGroupName=#{userGroupName}, updateTime=#{updateTime} WHERE id=#{id}")
    int updateUserGroupInfoBasicById(UserGroupBasic userGroupBasic);

    @Delete("DELETE FROM alarm_user_group_info WHERE id=#{id}")
    int deleteUserGroupInfoBasicById(@Param("id") long id);

    @Select("SELECT * FROM alarm_user_group_info WHERE id IN " +
            "(SELECT userGroupId FROM alarm_template_user_group_bind WHERE templateId=#{templateId})")
    List<UserGroupBasic> listUserGroupInfoBasicByTemplateId(@Param("templateId") long templateId);
}
