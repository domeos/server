package org.domeos.framework.api.mapper.domeos.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.DeployEventDBProto;
import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.domeos.global.GlobalConstant;

import java.util.List;

/**
 */
@Mapper
public interface DeployEventMapper {
    @Insert("INSERT INTO " + DeployEventBiz.DEPLOY_EVENT_NAME + " (deployId, operation, eventStatus, statusExpire, content, startTime) values" +
            "(#{item.deployId}, #{item.operation}, #{item.eventStatus}, #{item.statusExpire}, #{data}, #{item.startTime})")
    @Options(useGeneratedKeys = true, keyProperty = "item.eid", keyColumn = "eid")
    void createEvent(@Param("item") DeployEvent item, @Param("data") String data);

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

    @Select("SELECT * FROM " + DeployEventBiz.DEPLOY_EVENT_NAME + " WHERE eventStatus not in ('SUCCESS', 'FAILED', 'ABORTED')")
    List<DeployEventDBProto> getUnfinishedEvent();

    @Select("SELECT de.* FROM " + DeployEventBiz.DEPLOY_EVENT_NAME  + " de "
            + " JOIN " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME + " crm ON crm.resourceId = de.deployId "
            + " WHERE crm.resourceType = 'DEPLOY' AND crm.collectionId IN ${idList} "
            + " AND de.startTime >= #{startTime}")
    List<DeployEventDBProto> listRecentEventByDeployCollectionIdTime(@Param("idList") String idList, @Param("startTime") long startTime);

    @Select("SELECT de.* FROM " + DeployEventBiz.DEPLOY_EVENT_NAME  + " de "
            + " JOIN " + GlobalConstant.DEPLOY_TABLE_NAME + " d ON d.id = de.deployId "
            + " WHERE de.startTime >= #{startTime}")
    List<DeployEventDBProto> listRecentEventAllDeploymentIncludeRemovedByTime(@Param("startTime") long startTime);
}
