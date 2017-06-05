package org.domeos.framework.api.mapper.portal;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.falcon.portal.GroupTemplate;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Mapper
public interface PortalGroupTemplateMapper {
    @Delete("DELETE FROM grp_tpl WHERE grp_id=#{grp_id}")
    int deleteByHostGroup(@Param("grp_id") long grp_id);

    @Delete("DELETE FROM grp_tpl WHERE tpl_id=#{tpl_id}")
    int deleteByTemplate(@Param("tpl_id") long tpl_id);

    @Insert("INSERT INTO grp_tpl (grp_id, tpl_id, bind_user) VALUES (#{grp_id}, #{tpl_id}, #{bind_user})")
    int insertGroupTemplateBind(GroupTemplate groupTemplate);

    @Select("SELECT grp_id FROM grp_tpl WHERE grp_id=#{grp_id} AND tpl_id=#{tpl_id}")
    Integer checkGroupTemplateBind(GroupTemplate groupTemplate);

    @Select("SELECT grp_id FROM grp_tpl WHERE tpl_id=#{tpl_id}")
    Integer getGroupIdByTemplateId(@Param("tpl_id") long tpl_id);
}
