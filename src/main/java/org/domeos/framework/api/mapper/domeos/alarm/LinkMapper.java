package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.alarm.assist.Link;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Mapper
public interface LinkMapper {

    @Insert("INSERT INTO alarm_link_info(content) VALUES (#{content})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addLink(Link link);

    @Select("SELECT * FROM alarm_link_info WHERE id=#{id}")
    Link getLinkById(@Param("id") long id);
}
