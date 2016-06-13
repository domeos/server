package org.domeos.framework.api.mapper.auth;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Repository
public interface UserGroupMapMapper {
    @Insert("INSERT INTO user_group_map (groupId, userId, role, updateTime) VALUES (" +
            "#{groupId}, #{userId}, #{role},#{updateTime})")
    int addUserGroup(UserGroupMap userGroup);

    @Select("SELECT COUNT(*) FROM user_group_map WHERE userId=#{userId} and groupId=#{groupId}")
    int userExistInGroup(UserGroupMap userGroup);

    @Select("SELECT COUNT(*) FROM user_group_map WHERE role='master' and groupId=#{groupId}")
    int masterCountInGroup(@Param("groupId") int groupId);

    @Select("SELECT * FROM user_group_map WHERE userId=#{userId} and groupId=#{groupId}")
    UserGroupMap getUserGroup(@Param("userId") int userId, @Param("groupId") int groupId);

    @Select("SELECT groupId FROM user_group_map WHERE userId=#{userId}")
    List<Integer> getGroupIds(@Param("userId") int userId);

    @Delete("DELETE FROM user_group_map where userId=#{userId} and groupId=#{groupId}")
    int deleteUserGroup(UserGroupMap userGroup);

    @Delete("DELETE FROM user_group_map where groupId=#{groupId}")
    int deleteAllUserInGroup(@Param("groupId") int groupId);

    @Update("UPDATE user_group_map set role=#{role},updateTime=#{updateTime} where userId=#{userId} and groupId=#{groupId}")
    int modifyUserGroup(UserGroupMap userGroup);

    @Select("SELECT * FROM user_group_map WHERE groupId=#{groupId}")
    List<UserGroupMap> getAllUsersInGroup(@Param("groupId") int groupId);
}
