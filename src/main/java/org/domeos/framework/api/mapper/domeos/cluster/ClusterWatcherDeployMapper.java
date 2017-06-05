package org.domeos.framework.api.mapper.domeos.cluster;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.cluster.related.ClusterWatcherDeployMap;
import org.domeos.global.GlobalConstant;

/**
 * Created by feiliu206363 on 2016/12/28.
 */
@Mapper
public interface ClusterWatcherDeployMapper {
    @Insert("INSERT INTO " + GlobalConstant.CLUSTERWATHCERDEPLOYMAP_TABLE_NAME +
            " (clusterId, deployId, updateTime) VALUES (" +
            " #{item.clusterId}, #{item.deployId}, #{item.updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int setClusterWacherDeployMap(@Param("item") ClusterWatcherDeployMap item);

    @Select("SELECT COUNT(*) FROM " + GlobalConstant.CLUSTERWATHCERDEPLOYMAP_TABLE_NAME + " WHERE clusterId=#{clusterId}")
    int getWatcherDeployMapByClusterId(@Param("clusterId") int clusterId);

    @Delete("DELETE FROM " + GlobalConstant.CLUSTERWATHCERDEPLOYMAP_TABLE_NAME + " WHERE deployId=#{deployId}")
    void deleteClusterWatchDeployMapByDeployId(@Param("deployId") int deployId);

    @Select("SELECT * FROM " + GlobalConstant.CLUSTERWATHCERDEPLOYMAP_TABLE_NAME + " WHERE clusterId=#{clusterId}")
    ClusterWatcherDeployMap getDeployIdByClusterId(@Param("clusterId") int clusterId);
}
