package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.UserInfo;

import java.util.List;

/**
 * Created by KaiRen on 2016/4/13.
 */
@Mapper
public interface UserGroupUserBindMapper {

    @Delete("DELETE FROM alarm_user_group_user_bind WHERE userGroupId=#{userGroupId}")
    int deleteUserGroupUserBindByUserGroupId(@Param("userGroupId") long userGroupId);

    @Delete("DELETE FROM alarm_user_group_user_bind WHERE userGroupId=#{userGroupId} AND userId=#{userId}")
    int deleteUserGroupUserBind(@Param("userGroupId") long userGroupId, @Param("userId") long userId);

    @Select("SELECT bindTime FROM alarm_user_group_user_bind WHERE userGroupId=#{userGroupId} AND userId=#{userId}")
    Long getUserGroupUserBindTime(@Param("userGroupId") long userGroupId, @Param("userId") long userId);

    @Insert("INSERT INTO alarm_user_group_user_bind(userGroupId, userId, bindTime) VALUES (" +
            "#{userGroupId}, #{userId}, #{bindTime})")
    int addUserGroupUserBind(@Param("userGroupId") long userGroupId, @Param("userId") long userId, @Param("bindTime") long bindTime);

    @Update("UPDATE alarm_user_group_user_bind SET bindTime=#{bindTime} WHERE userGroupId=#{userGroupId} AND userId=#{userId}")
    int updateUserGroupUserBind(@Param("userGroupId") long userGroupId, @Param("userId") long userId, @Param("bindTime") long bindTime);

    @Select("SELECT id, username, email, phone FROM users LEFT OUTER JOIN alarm_user_group_user_bind ON " +
            "users.id = alarm_user_group_user_bind.userId WHERE alarm_user_group_user_bind.userGroupId " +
            "= #{userGroupId} order by alarm_user_group_user_bind.bindTime")
    List<UserInfo> getUserInfoByUserGroupId(@Param("userGroupId") long userGroupId);
}
