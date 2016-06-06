package org.domeos.framework.api.mapper.alarm.portal;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Repository
public interface PortalHostMapper {

    @Select("SELECT id FROM portal.host WHERE hostname=#{hostname}")
    Integer getHostIdByHostname(@Param("hostname") String hostname);
}
