package org.domeos.api.mapper.cluster;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.cluster.ClusterLog;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2015/12/28.
 */
@Repository
public interface ClusterLogMapper {
    @Select("SELECT * FROM cluster_log WHERE id=#{id}")
    ClusterLog getClusterLogById(@Param("id") int id);

    @Select("SELECT * FROM cluster_log WHERE clusterId=#{clusterId}")
    ClusterLog getClusterLogByClusterId(@Param("clusterId") int clusterId);

    @Insert("INSERT INTO cluster_log (clusterId, kafka, zookeeper, imageName, imageTag)" +
            "VALUES (#{clusterId}, #{kafka}, #{zookeeper}, #{imageName}, #{imageTag})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addClusterLog(ClusterLog clusterLog);

    @Update("UPDATE cluster_log SET kafka=#{kafka}, zookeeper=#{zookeeper}, imageName=#{imageName}, imageTag=#{imageTag} WHERE id=#{id}")
    int updateClusterLogById(ClusterLog clusterLog);

    @Delete("DELETE FROM cluster_log WHERE clusterId=#{clusterId}")
    int deleteClusterLogByClusterId(@Param("clusterId") int clusterId);
}
