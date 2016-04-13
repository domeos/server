package org.domeos.framework.api.mapper.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.biz.deployment.impl.DeployEventBiz;
import org.domeos.framework.api.model.deployment.DeployEventDBProto;
import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 */
@Repository
public interface DeployEventMapper {

    @Insert("INSERT INTO " + DeployEventBiz.deployEventName + " (deployId, operation, eventStatus, statusExpire, content) values" +
            "(#{deployId}, #{operation}, #{eventStatus}, #{statusExpire}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "eid", keyColumn = "eid")
    void createEvent(DeployEventDBProto proto);

    @Select("SELECT * FROM " + DeployEventBiz.deployEventName + " WHERE eid=#{eid}")
    DeployEventDBProto getEvent(@Param("eid") long eid);

    @Select("SELECT * FROM " + DeployEventBiz.deployEventName + " WHERE eid=" +
            "(SELECT MAX(eid) FROM " + DeployEventBiz.deployEventName + " where deployId=#{deployId})")
    DeployEventDBProto gentNewestEvent(@Param("deployId") int deployId);

    @Select("SELECT * FROM " + DeployEventBiz.deployEventName + " WHERE deployId=#{deployId}")
    List<DeployEventDBProto> getEventByDeployId(@Param("deployId") int deployId);

    @Update("UPDATE " + DeployEventBiz.deployEventName + " set content=#{content}, eventStatus=#{status}, statusExpire=#{statusExpire} WHERE eid=#{eid}")
    void updateEvent(@Param("eid") long eid, @Param("status") DeployEventStatus status,
                     @Param("statusExpire") long statusExpire, @Param("content") String content);

    @Select("SELECT * FROM " + DeployEventBiz.deployEventName + " WHERE eventStatus not in ('SUCCESS', 'FAILED')")
    List<DeployEventDBProto> getUnfinishedEvent();

}
