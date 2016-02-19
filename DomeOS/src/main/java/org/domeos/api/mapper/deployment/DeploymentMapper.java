package org.domeos.api.mapper.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.deployment.Deployment;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 */
@Repository
public interface DeploymentMapper {

    @Select({"<script>",
            "SELECT *",
            "FROM deployment",
            "WHERE deployId IN",
            "<foreach item='item' index='index' collection='deployIds'",
            "open='(' separator=',' close=')'>",
            "#{item}",
            "</foreach>",
            "</script>"})
    List<Deployment> listDeploy(@Param("deployIds") List<Long> deployIds);

    @Select("SELECT * FROM deployment WHERE deployName=#{deployName}")
    Deployment getDeployByName(@Param("deployName") String deployName);

    @Select("SELECT * FROM deployment WHERE deployId=#{deployId}")
    Deployment getDeploy(@Param("deployId") long deployId);

    @Delete("DELETE FROM deployment WHERE deployName=#{deployName}")
    void deleteDeployByName(@Param("deployName") String deployName);

    @Delete("DELETE FROM deployment WHERE deployId=#{deployId}")
    void deleteDeploy(@Param("deployId") long deployId);

    @Select("SELECT deployId FROM deployment WHERE deployName=#{deployName}")
    Long getIdByName(@Param("deployName") String deployName);

    @Insert("INSERT INTO deployment (deployName, createTime, namespace, clusterName, hostEnv, defaultReplicas, " +
            "stateful, scalable) VALUES " +
            "(#{deployName}, #{createTime}, #{namespace}, #{clusterName}, #{hostEnv}, #{defaultReplicas}, " +
            "#{stateful}, #{scalable})")
    @Options(useGeneratedKeys = true, keyProperty = "deployId", keyColumn = "deployId")
    void createDeploy(Deployment deployment);

    @Update("UPDATE deployment SET defaultReplicas=#{defaultReplicas} WHERE deployId=#{deployId}")
    void updateDefaultReplicas(@Param("deployId") long deployId, @Param("defaultReplicas") int replicas);

}
