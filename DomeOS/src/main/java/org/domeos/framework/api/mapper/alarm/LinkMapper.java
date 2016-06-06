package org.domeos.framework.api.mapper.alarm;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.framework.api.model.alarm.assist.Link;
import org.springframework.stereotype.Repository;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Repository
public interface LinkMapper {

    @Insert("INSERT INTO alarm_link_info(content) VALUES (#{content})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addLink(Link link);

    @Select("SELECT * FROM alarm_link_info WHERE id=#{id}")
    Link getLinkById(@Param("id") long id);
}
