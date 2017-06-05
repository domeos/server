package org.domeos.framework.api.mapper.domeos.cluster;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.global.GlobalConstant;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Mapper
public interface ClusterMapper {
    @Select("SELECT COUNT(*) FROM " + GlobalConstant.CLUSTER_TABLE_NAME + " WHERE name=#{name} and removed=0")
    int checkClusterName(@Param("name") String name);

    @Insert("INSERT INTO " + GlobalConstant.CLUSTER_TABLE_NAME +
            " (name, description, state, createTime, removeTime, removed, data) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}, #{item.removed}, #{data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertCluster(@Param("item") Cluster item, @Param("data") String data);

    @Update("update " + GlobalConstant.CLUSTER_TABLE_NAME +
            " set name=#{item.name}, description=#{item.description}, state=#{item.state}, " +
            "data=#{data} where id = #{item.id}")
    int updateCluster(@Param("item") Cluster item, @Param("data") String data);

    @Select("SELECT * FROM " + GlobalConstant.CLUSTER_TABLE_NAME + " WHERE removed=0")
    List<Cluster> listAllCluster();
}
