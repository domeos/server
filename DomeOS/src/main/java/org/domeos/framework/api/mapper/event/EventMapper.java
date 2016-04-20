package org.domeos.framework.api.mapper.event;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.framework.api.model.event.releated.EventDBProto;
import org.domeos.framework.api.model.event.EventKind;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by xupeng on 16-3-28.
 */
@Repository
public interface EventMapper {

    @Insert("INSERT INTO k8s_events (version, clusterId, namespace, eventKind, name, host, content) " +
            "VALUES (#{version}, #{clusterId}, #{namespace}, #{eventKind}, #{name}, #{host}, #{content}) " +
            "ON DUPLICATE KEY UPDATE version=VALUES(version), content=VALUES(content)")
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
}
