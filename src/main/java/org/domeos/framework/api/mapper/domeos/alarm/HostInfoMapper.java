package org.domeos.framework.api.mapper.domeos.alarm;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.framework.api.model.alarm.HostInfo;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/13.
 */
@Mapper
public interface HostInfoMapper {

    @Select("SELECT * FROM alarm_host_info WHERE id=#{id}")
    HostInfo getHostInfoById(@Param("id") long id);

    @Select("SELECT * FROM alarm_host_info WHERE hostname=#{hostname} ORDER BY createTime DESC LIMIT 1")
    HostInfo getHostInfoByHostname(@Param("hostname") String hostname);

    @Select("SELECT * FROM alarm_host_info WHERE hostname=#{hostname} AND ip=#{ip} AND cluster=#{cluster}")
    HostInfo selectHostInfo(@Param("hostname") String hostname, @Param("ip") String ip, @Param("cluster") String cluster);

    @Insert("INSERT INTO alarm_host_info(id, hostname, ip, cluster, createTime) VALUES (" +
            "#{id}, #{hostname}, #{ip}, #{cluster}, #{createTime})")
    int addHostInfo(HostInfo hostInfo);

    @Select("SELECT * FROM alarm_host_info LEFT OUTER JOIN alarm_host_group_host_bind ON " +
            "alarm_host_info.id = alarm_host_group_host_bind.hostId WHERE alarm_host_group_host_bind.hostGroupId " +
            "= #{hostGroupId} order by alarm_host_group_host_bind.bindTime")
    List<HostInfo> getHostInfoByHostGroupId(@Param("hostGroupId") long hostGroupId);
}
