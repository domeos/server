package org.domeos.api.mapper.group;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.group.Group;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by zhenfengchen on 15-11-19.
 */
@Repository
public interface GroupMapper {
    // group related
    @Select("SELECT * FROM sys_groups WHERE id=#{groupId}")
    Group getGroupById(@Param("groupId") long groupId);

    @Select("SELECT * FROM sys_groups WHERE name=#{groupName} and status=1")
    Group getGroupByName(@Param("groupName") String groupName);

    @Select("SELECT * FROM sys_groups where status=1")
    List<Group> listAllGroup();

    /**
     * normal user can list the groups which he is in
     * @return
     */
    @Select("SELECT * FROM sys_groups g, sys_user_group ug where ug.user_id=#{user_id} and g.id = ug.group_id and g.status=1")
    List<Group> listAllGroupByUserId(@Param("user_id") Long userId);

    @Insert("INSERT INTO sys_groups (name, description, create_time, update_time) VALUES (" +
        "#{name}, #{description}, #{create_time},#{update_time})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addGroup(Group group);

    @Update("UPDATE sys_groups set description=#{description},update_time=#{update_time} where id=#{id}")
    int modifyGroup(Group group);

    @Update("UPDATE sys_groups set status=#{status},update_time=#{update_time} where id=#{id}")
    int deleteGroup(Group group);
}
