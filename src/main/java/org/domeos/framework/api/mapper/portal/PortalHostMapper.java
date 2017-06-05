package org.domeos.framework.api.mapper.portal;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Mapper
public interface PortalHostMapper {

    @Select("SELECT id FROM host WHERE hostname=#{hostname}")
    Integer getHostIdByHostname(@Param("hostname") String hostname);
}
