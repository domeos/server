package org.domeos.framework.api.mapper.auth;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.auth.Group;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Repository
public interface GroupMapper {
    @Select("SELECT * FROM groups WHERE id=#{groupId}")
    Group getGroupById(@Param("groupId") int groupId);

    @Select("SELECT * FROM groups WHERE name=#{groupName} and state=1")
    Group getGroupByName(@Param("groupName") String groupName);

    @Select("SELECT * FROM groups where state=1")
    List<Group> listAllGroup();

    /**
     * normal user can list the groups which he is in
     *
     * @return
     */
    @Select("SELECT * FROM groups g, user_group_map ug where ug.userId=#{userId} and g.id = ug.groupId and g.state=1")
    List<Group> listAllGroupByUserId(@Param("userId") int userId);

    @Insert("INSERT INTO groups (name, description, createTime, updateTime) VALUES (" +
            "#{name}, #{description}, #{createTime},#{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addGroup(Group group);

    @Update("UPDATE groups set description=#{description}, updateTime=#{updateTime} where id=#{id}")
    int modifyGroup(Group group);

    @Update("UPDATE groups set state=#{state}, updateTime=#{updateTime} where id=#{id}")
    int deleteGroup(Group group);

    @Select("SELECT id FROM groups WHERE state=1")
    List<Integer> getAllGroupIds();
}
