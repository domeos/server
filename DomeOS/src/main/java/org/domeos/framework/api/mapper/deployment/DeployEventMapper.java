package org.domeos.framework.api.mapper.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.model.deployment.DeployEventDBProto;
import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 */
@Repository
public interface DeployEventMapper {

    @Insert("INSERT INTO " + DeployEventBiz.DEPLOY_EVENT_NAME + " (deployId, operation, eventStatus, statusExpire, content) values" +
            "(#{deployId}, #{operation}, #{eventStatus}, #{statusExpire}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "eid", keyColumn = "eid")
    void createEvent(DeployEventDBProto proto);

    @Select("SELECT * FROM " + DeployEventBiz.DEPLOY_EVENT_NAME + " WHERE eid=#{eid}")
    DeployEventDBProto getEvent(@Param("eid") long eid);

    @Select("SELECT * FROM " + DeployEventBiz.DEPLOY_EVENT_NAME + " WHERE eid=" +
            "(SELECT MAX(eid) FROM " + DeployEventBiz.DEPLOY_EVENT_NAME + " where deployId=#{deployId})")
    DeployEventDBProto gentNewestEvent(@Param("deployId") int deployId);

    @Select("SELECT * FROM " + DeployEventBiz.DEPLOY_EVENT_NAME + " WHERE deployId=#{deployId}")
    List<DeployEventDBProto> getEventByDeployId(@Param("deployId") int deployId);

    @Update("UPDATE " + DeployEventBiz.DEPLOY_EVENT_NAME + " set content=#{content}, eventStatus=#{status}, statusExpire=#{statusExpire} WHERE eid=#{eid}")
    void updateEvent(@Param("eid") long eid, @Param("status") DeployEventStatus status,
                     @Param("statusExpire") long statusExpire, @Param("content") String content);

    @Select("SELECT * FROM " + DeployEventBiz.DEPLOY_EVENT_NAME + " WHERE eventStatus not in ('SUCCESS', 'FAILED')")
    List<DeployEventDBProto> getUnfinishedEvent();

}
