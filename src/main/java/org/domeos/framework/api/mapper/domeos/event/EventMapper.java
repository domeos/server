package org.domeos.framework.api.mapper.domeos.event;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.api.model.event.releated.EventDBProto;

import java.util.List;

/**
 * Created by xupeng on 16-3-28.
 */
@Mapper
public interface EventMapper {
    @Insert("INSERT INTO k8s_events (version, clusterId, namespace, eventKind, deployId, name, host, content) " +
            "VALUES (#{version}, #{clusterId}, #{namespace}, #{eventKind}, #{deployId}, #{name}, #{host}, #{content})")
    void createEvent(EventDBProto proto);

    // get by max id
    // 根据前面insert on duplicate key update的策略,这样可能在事件重复出现的时候可能会拿不到最新的version,不过无所谓,
    // 结果是把一些事件再重复插入一遍
    @Select("SELECT version FROM k8s_events WHERE id = (SELECT MAX(id) FROM k8s_events WHERE clusterId = #{clusterId})")
    String getNewestResourceVersion(@Param("clusterId") int clusterId);

    @Select("SELECT * FROM k8s_events WHERE host = #{host}")
    List<EventDBProto> getEventsByHost(@Param("host") String host);

    @Select("SELECT * FROM k8s_events WHERE clusterId = #{clusterId} AND namespace = #{namespace}")
    List<EventDBProto> getEventsByNamespace(@Param("clusterId") int clusterId,
                                            @Param("namespace") String namespace);

    @Select("SELECT * FROM k8s_events WHERE clusterId = #{clusterId} AND namespace = #{namespace} AND eventKind = #{kind}")
    List<EventDBProto> getEventsByKindAndNamespace(@Param("clusterId") int clusterId,
                                                   @Param("namespace") String namespace,
                                                   @Param("kind") EventKind kind);

    @Select("SELECT * FROM k8s_events WHERE clusterId = #{clusterId} AND name LIKE 'dmo-${deployName}-v%'")
    List<EventDBProto> getEventsByDeployName(@Param("clusterId") int clusterId,
                                             @Param("deployName") String deployName);

    @Select("SELECT * FROM k8s_events WHERE clusterId = #{clusterId} AND deployId = #{deployId} ORDER BY id DESC LIMIT 40")
    List<EventDBProto> getEventsByDeployId(@Param("clusterId") int clusterId,
                                           @Param("deployId") int deployId);

    @Delete("DELETE FROM k8s_events WHERE deployId = #{deployId} AND clusterId = #{clusterId} ")
    void clearDeployEvents(@Param("clusterId") int clusterId,
                           @Param("deployId") int deployId);

    // DELETE from k8s_events WHERE clusterId = 5 AND deployId = 76 AND id <= (select * from
    //     (select id from k8s_events WHERE clusterId = 5 AND deployId = 76 ORDER BY id DESC limit 200, 1) as t);
    @Delete("DELETE from k8s_events WHERE clusterId = #{clusterId} AND deployId = #{deployId} AND id <= " +
            "(select * from (select id from k8s_events WHERE clusterId = #{clusterId} AND deployId = #{deployId} " +
            "ORDER BY id DESC limit #{remaining}, 1) as t)")
    long deleteOldDeployEvents(@Param("clusterId") int clusterId,
                               @Param("deployId") int deployId,
                               @Param("remaining") int remaining);

}
