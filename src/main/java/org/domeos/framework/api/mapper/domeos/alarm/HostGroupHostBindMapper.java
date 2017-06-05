package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.*;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface HostGroupHostBindMapper {

    @Delete("DELETE FROM alarm_host_group_host_bind WHERE hostGroupId=#{hostGroupId}")
    int deleteHostGroupHostBindByHostGroupId(@Param("hostGroupId") long hostGroupId);

    @Delete("DELETE FROM alarm_host_group_host_bind WHERE hostGroupId=#{hostGroupId} AND hostId=#{hostId}")
    int deleteHostGroupHostBind(@Param("hostGroupId") long hostGroupId, @Param("hostId") long hostId);

    @Select("SELECT bindTime FROM alarm_host_group_host_bind WHERE hostGroupId=#{hostGroupId} AND hostId=#{hostId}")
    Long getHostGroupHostBindTime(@Param("hostGroupId") long hostGroupId, @Param("hostId") long hostId);

    @Insert("INSERT INTO alarm_host_group_host_bind(hostGroupId, hostId, bindTime) VALUES (" +
            "#{hostGroupId}, #{hostId}, #{bindTime})")
    int addHostGroupHostBind(@Param("hostGroupId") long hostGroupId, @Param("hostId") long hostId, @Param("bindTime") long bindTime);

    @Update("UPDATE alarm_host_group_host_bind SET bindTime=#{bindTime} WHERE hostGroupId=#{hostGroupId} AND hostId=#{hostId}")
    int updateHostGroupHostBind(@Param("hostGroupId") long hostGroupId, @Param("hostId") long hostId, @Param("bindTime") long bindTime);
}
