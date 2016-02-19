package org.domeos.api.mapper.deployment;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.api.model.deployment.DeploymentStatus;
import org.springframework.stereotype.Repository;

/**
 */
@Repository
public interface DeploymentStatusMapper {

    @Select("SELECT status FROM deploymentStatus WHERE deployId=#{deployId}")
    DeploymentStatus getDeploymentStatus(@Param("deployId") long deployId);

    @Insert("INSERT INTO deploymentStatus (deployId, status) VALUES (#{deployId}, #{status}) " +
            "on duplicate key update status=#{status}")
    void setDeploymentStatus(@Param("deployId") long deployId, @Param("status") DeploymentStatus status);

}
