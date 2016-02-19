package org.domeos.api.mapper.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.deployment.HealthChecker;
import org.springframework.stereotype.Repository;

/**
 */
@Repository
public interface HealthCheckerMapper {

    @Insert("INSERT INTO healthChecker (deployId, type, port, timeout, url) VALUES " +
            "(#{deployId}, #{type}, #{port}, #{timeout}, #{url})")
    void createHealthChecker(HealthChecker healthChecker);

    @Select("SELECT * FROM healthChecker WHERE deployId=#{deployId}")
    HealthChecker getHealthCheckerByDeployId(@Param("deployId") long deployId);

    @Update("UPDATE healthChecker SET type=#{type}, port=#{port}, timeout=#{timeout}, " +
            "url=#{url} WHERE deployId=#{deployId}")
    void modifyHealthChecker(HealthChecker healthChecker);

    @Delete("DELETE FROM healthChecker WHERE deployId=#{deployId}")
    void deleteHealthChecker(@Param("deployId") long deployId);

}
