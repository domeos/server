package org.domeos.api.mapper.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.deployment.DeployEventDBProto;
import org.domeos.api.model.deployment.DeployEventStatus;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 */
@Repository
public interface DeployEventMapper {

    @Insert("INSERT INTO deployEvent (deployId, operation, eventStatus, statusExpire, content) values" +
            "(#{deployId}, #{operation}, #{eventStatus}, #{statusExpire}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "eid", keyColumn = "eid")
    void createEvent(DeployEventDBProto proto);

    @Select("SELECT * FROM deployEvent WHERE eid=#{eid}")
    DeployEventDBProto getEvent(@Param("eid") long eid);

    @Select("SELECT * FROM deployEvent WHERE eid=" +
            "(SELECT MAX(eid) FROM deployEvent where deployId=#{deployId})")
    DeployEventDBProto gentNewestEvent(@Param("deployId") long deployId);

    @Select("SELECT * FROM deployEvent WHERE deployId=#{deployId}")
    List<DeployEventDBProto> getEventByDeployId(@Param("deployId") long deployId);

    @Update("UPDATE deployEvent set content=#{content}, eventStatus=#{status}, statusExpire=#{statusExpire} WHERE eid=#{eid}")
    void updateEvent(@Param("eid") long eid, @Param("status") DeployEventStatus status,
                     @Param("statusExpire") long statusExpire, @Param("content") String content);

    @Select("SELECT * FROM deployEvent WHERE eventStatus not in ('SUCCESS', 'FAILED')")
    List<DeployEventDBProto> getUnfinishedEvent();

}
