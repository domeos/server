package org.domeos.framework.api.mapper.cluster;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.stereotype.Repository;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Repository
public interface ClusterMapper {

    @Select("SELECT COUNT(*) FROM cluster WHERE name=${name} and removed=0")
    int checkClusterName(@Param("name") String name);

    @Insert("INSERT INTO " + GlobalConstant.clusterTableName +
        " (name, description, state, createTime, removeTime, removed, data) values (" +
        " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}, #{item.removed}, #{data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertCluster( @Param("item") Cluster item, @Param("data") String data);

    @Update("update " + GlobalConstant.clusterTableName +
        " set name=#{item.name}, description=#{item.description}, state=#{item.state}, " +
        "data=#{data} where id = ${item.id}")
    int updateCluster( @Param("item") Cluster item, @Param("data") String data);

}
