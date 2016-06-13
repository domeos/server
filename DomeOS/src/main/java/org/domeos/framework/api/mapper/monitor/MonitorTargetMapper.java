package org.domeos.framework.api.mapper.monitor;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.monitor.MonitorTarget;
import org.springframework.stereotype.Repository;


/**
 * Created by baokangwang on 2016/3/7.
 */
@Repository
public interface MonitorTargetMapper {

    @Insert("INSERT INTO monitor_targets (target, create_time) VALUES (" +
            "#{target}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addMonitorTarget(MonitorTarget MonitorTarget);

    @Update("UPDATE monitor_targets SET target=#{target}, create_time=#{createTime} WHERE id=#{id}")
    int updateMonitorTargetById(MonitorTarget MonitorTarget);

    @Select("SELECT target FROM monitor_targets WHERE id = #{id}")
    String getMonitorTargetById(@Param("id") long id);
}