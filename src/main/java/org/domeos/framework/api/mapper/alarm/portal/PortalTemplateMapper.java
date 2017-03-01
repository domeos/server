package org.domeos.framework.api.mapper.alarm.portal;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.falcon.portal.Template;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Mapper
public interface PortalTemplateMapper {
    @Insert("INSERT INTO portal.tpl (id, tpl_name, action_id, create_user, create_at) VALUES (" +
            "#{id}, #{tpl_name}, #{action_id}, #{create_user}, #{create_at})")
    int insertTemplateById(Template template);

    @Update("UPDATE portal.tpl SET tpl_name=#{tpl_name}, action_id=#{action_id} WHERE id=#{id}")
    int updateTemplateById(Template template);

    @Select("SELECT * FROM portal.tpl WHERE id=#{id}")
    Template getTemplateById(@Param("id") long id);

    @Delete("DELETE FROM portal.tpl WHERE id=#{id}")
    int deleteTemplateById(@Param("id") long id);
}
