package org.domeos.api.mapper.cluster;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.cluster.CiCluster;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
@Repository
public interface KubeCiClusterMapper {
    @Insert("INSERT INTO kube_cluster (type, namespace, host, createTime) VALUES (#{type}, #{namespace}, #{host}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addKubeCluster(CiCluster ciCluster);

    @Select("SELECT * FROM kube_cluster WHERE id =  #{id}")
    CiCluster getKubeClusterById(@Param("id") int id);

    @Select("SELECT * FROM kube_cluster WHERE type = #{type}")
    List<CiCluster> getKubeClustersByType(@Param("type") String type);

    @Update("UPDAET kube_cluster SET type=#{type}, namespace=#{namespace}, host=#{host}, createTime=#{createTime} WHERE id=#{id}")
    int updateKubeClusterById(CiCluster ciCluster);

    @Select("SELECT * FROM kube_cluster")
    List<CiCluster> listKubeCluster();

    @Select("SELECT * FROM kube_cluster WHERE type=#{type} AND namespace=#{namespace} AND host=#{host}")
    CiCluster checkExistance(CiCluster ciCluster);

    @Delete("DELETE FROM kube_cluster WHERE id = #{id}")
    int deleteKubeClusterById(@Param("id") int id);
}
