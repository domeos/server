package org.domeos.framework.api.mapper.domeos.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;

import java.util.List;

/**
 */
@Mapper
public interface DeploymentMapper {
    @Insert("INSERT INTO " + GlobalConstant.DEPLOY_TABLE_NAME +
            " (name, description, state, createTime, removeTime, removed, data, clusterId) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data}, #{item.clusterId})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertDeploy(@Param("item") Deployment item, @Param("data") String data);


    @Update("update " + GlobalConstant.DEPLOY_TABLE_NAME +
            " set name=#{item.name}, description=#{item.description}, state=#{item.state}, " +
            "data=#{item.data} where id=#{item.id}")
    int updateDeploy(@Param("item") RowMapperDao item);

    @Select("SELECT * FROM " + GlobalConstant.DEPLOY_TABLE_NAME + " WHERE clusterId=#{clusterId} AND removed=0")
    List<RowMapperDao> listDeploymentByClusterId(@Param("clusterId") int clusterId);

    @Select("SELECT * FROM " + GlobalConstant.DEPLOY_TABLE_NAME + " WHERE clusterId=#{clusterId} AND name=#{name} AND removed=0")
    List<RowMapperDao> getDeployment(@Param("clusterId") int clusterId, @Param("name") String name);

    @Select("SELECT * FROM " + GlobalConstant.DEPLOY_TABLE_NAME + " WHERE state in " +
            "('DEPLOYING', 'ABORTING', 'STOPPING', 'UPSCALING', 'DOWNSCALING', 'UPDATING', 'BACKROLLING') AND removed=0")
    List<Deployment> listUnfinishedStatusDeployment();

    @Select("SELECT * FROM " + GlobalConstant.DEPLOY_TABLE_NAME + " WHERE state='RUNNING' and removed=0 ")
    List<Deployment> listRunningDeployment();

    @Update("UPDATE " + GlobalConstant.DEPLOY_TABLE_NAME + " set description = #{description} where id = #{id}")
    void updateDescription(@Param("id") int id, @Param("description") String description);

//
//    @Select("SELECT * FROM version WHERE deployId=#{deployId} AND version=#{version}")
//    VersionDBProto getVersion(@Param("deployId") long deployId, @Param("version") long version);
//
//    @Select("SELECT * FROM version WHERE deployId=#{deployId} AND version=" +
//            "(SELECT MAX(version) FROM version where deployId=#{deployId})")
//    VersionDBProto getNewestVersion(@Param("deployId") long deployId);
//
//    @Select("SELECT * FROM version WHERE deployId=#{deployId}")
//    List<VersionDBProto> listVersionByDeployId(@Param("deployId") long deployId);
//
//    @Insert("INSERT INTO version (deployId, version, contents) VALUES (#{deployId}, #{version}, #{contents})")
//    void createVersion(VersionDBProto versionDBProto);
//
//    /**
//     * get max version of a deploy
//     * @param deployId deployId
//     * @return max version if exist, null(please use Long to accept return value) if not exist
//     */
//    @Select("SELECT max(version) FROM version WHERE deployId=#{deployId}")
//    Long getMaxVersion(@Param("deployId") long deployId);
//
//    @Delete("DELETE FROM version WHERE deployId=#{deployId} AND version=#{version}")
//    void deleteVersion(@Param("deployId") long deployId, @Param("version") long version);
//
//    @Delete("DELETE FROM version WHERE vid=#{vid}")
//    void deleteVersionById(@Param("vid") long vid);
}
