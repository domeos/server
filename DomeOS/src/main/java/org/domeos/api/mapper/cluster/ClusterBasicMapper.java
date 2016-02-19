package org.domeos.api.mapper.cluster;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.cluster.ClusterBasic;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
@Repository
public interface ClusterBasicMapper {
    @Select("SELECT * FROM cluster_basic WHERE id=#{id}")
    ClusterBasic getClusterBasicById(@Param("id") int id);

    @Select("SELECT * FROM cluster_basic WHERE name=#{name}")
    ClusterBasic getClusterBasicByName(@Param("name") String name);

    @Insert("INSERT INTO cluster_basic (name, api, tag, ownerName, ownerType, domain, dns, etcd, logConfig, createTime)" +
            "VALUES (#{name}, #{api}, #{tag}, #{ownerName}, #{ownerType}, #{domain}, #{dns}, #{etcd}, #{logConfig}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addClusterBasic(ClusterBasic clusterBasic);

    @Update("UPDATE cluster_basic SET name=#{name}, api=#{api}, tag=#{tag}, ownerName=#{ownerName},ownerType=#{ownerType}," +
            "domain=#{domain}, logConfig=#{logConfig}, dns=#{dns}, etcd=#{etcd} WHERE id=#{id}")
    int updateClusterBasicById(ClusterBasic clusterBasic);

    @Select("SELECT * FROM cluster_basic")
    List<ClusterBasic> listClusterBasic();

    @Delete("DELETE FROM cluster_basic WHERE id = #{id}")
    int deleteClusterBasicById(@Param("id") int id);
}
