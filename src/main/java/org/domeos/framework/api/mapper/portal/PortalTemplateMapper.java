package org.domeos.framework.api.mapper.portal;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.falcon.portal.Template;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Mapper
public interface PortalTemplateMapper {
    @Insert("INSERT INTO tpl (id, tpl_name, action_id, create_user, create_at) VALUES (" +
            "#{id}, #{tpl_name}, #{action_id}, #{create_user}, #{create_at})")
    int insertTemplateById(Template template);

    @Update("UPDATE tpl SET tpl_name=#{tpl_name}, action_id=#{action_id} WHERE id=#{id}")
    int updateTemplateById(Template template);

    @Select("SELECT * FROM tpl WHERE id=#{id}")
    Template getTemplateById(@Param("id") long id);

    @Delete("DELETE FROM tpl WHERE id=#{id}")
    int deleteTemplateById(@Param("id") long id);
}
