package org.domeos.framework.api.mapper.portal;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.falcon.portal.GroupHost;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Mapper
public interface PortalGroupHostMapper {
    @Delete("DELETE FROM grp_host WHERE grp_id=#{grp_id}")
    int deleteByHostGroup(@Param("grp_id") long grp_id);

    @Delete("DELETE FROM grp_host WHERE grp_id IN (SELECT grp_id FROM portal.grp_tpl WHERE tpl_id=#{tpl_id})")
    int deleteByTemplate(@Param("tpl_id") long tpl_id);

    @Insert("INSERT INTO grp_host (grp_id, host_id) VALUES (#{grp_id}, #{host_id})")
    int insertGroupHostBind(GroupHost groupHost);

    @Insert("DELETE FROM grp_host WHERE grp_id=#{grp_id} AND host_id=#{host_id}")
    int deleteGroupHostBind(@Param("grp_id") long grp_id, @Param("host_id") long host_id);

    @Select("SELECT grp_id FROM grp_host WHERE grp_id=#{grp_id} AND host_id=#{host_id}")
    Integer checkGroupHostBind(GroupHost groupHost);
}
