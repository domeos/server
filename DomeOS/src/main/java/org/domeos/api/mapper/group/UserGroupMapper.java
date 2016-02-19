package org.domeos.api.mapper.group;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.group.UserGroup;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by zhenfengchen on 15-11-20.
 * 1. add a user to group
 * 2. delete a user from group
 * 3. modify user's role in group
 * 4. delete all users from one group
 */
@Repository
public interface UserGroupMapper {
    @Insert("INSERT INTO sys_user_group (group_id, user_id, role, update_time) VALUES (" +
        "#{group_id}, #{user_id}, #{role},#{update_time})")
    int addUserGroup(UserGroup userGroup);

    @Select("SELECT COUNT(*) FROM sys_user_group WHERE user_id=#{user_id} and group_id=#{group_id}")
    int userExistInGroup(UserGroup userGroup);

    @Select("SELECT COUNT(*) FROM sys_user_group WHERE role='master' and group_id=#{group_id}")
    int masterCountInGroup(@Param("group_id") long groupId);

    @Select("SELECT * FROM sys_user_group WHERE user_id=#{user_id} and group_id=#{group_id}")
    UserGroup getUserGroup(@Param("user_id") long userId, @Param("group_id") long groupId);

    @Select("SELECT group_id FROM sys_user_group WHERE user_id=#{user_id}")
    List<Long> getGroupIds(@Param("user_id") long userId);

    @Delete("DELETE FROM sys_user_group where user_id=#{user_id} and group_id=#{group_id}")
    int deleteUserGroup(UserGroup userGroup);

    @Delete("DELETE FROM sys_user_group where group_id=#{group_id}")
    int deleteAllUserInGroup(@Param("group_id") Long groupId);

    @Update("UPDATE sys_user_group set role=#{role},update_time=#{update_time} where user_id=#{user_id} and group_id=#{group_id}")
    int modifyUserGroup(UserGroup userGroup);

    @Select("SELECT * FROM sys_user_group WHERE group_id=#{group_id}")
    List<UserGroup> getAllUsersInGroup(@Param("group_id")long groupId);
}
