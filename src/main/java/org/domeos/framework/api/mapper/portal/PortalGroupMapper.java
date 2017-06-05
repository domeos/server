package org.domeos.framework.api.mapper.portal;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.falcon.portal.Group;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Mapper
public interface PortalGroupMapper {
    @Insert("INSERT INTO grp (grp_name, create_user, create_at, come_from) VALUES (" +
            "#{grp_name}, #{create_user}, #{create_at}, #{come_from})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insertHostGroup(Group group);

    @Insert("INSERT INTO grp (id, grp_name, create_user, create_at, come_from) VALUES (" +
            "#{id}, #{grp_name}, #{create_user}, #{create_at}, #{come_from})")
    int insertHostGroupById(Group group);

    @Update("UPDATE grp SET grp_name=#{grp_name} WHERE id=#{id}")
    int updateHostGroup(@Param("id") long id, @Param("grp_name") String grp_name);

    @Delete("DELETE FROM grp WHERE id=#{id}")
    int deleteHostGroup(@Param("id") long id);

    @Delete("DELETE FROM grp WHERE id IN (SELECT grp_id FROM portal.grp_tpl WHERE tpl_id=#{tpl_id})")
    int deleteByTemplate(@Param("tpl_id") long tpl_id);

    @Select("SELECT * FROM grp")
    List<Group> listHostGroup();
}
