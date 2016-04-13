package org.domeos.framework.api.mapper.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.engine.mapper.RowMapper;
import org.domeos.framework.engine.model.RowMapperDao;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 */
@Repository
public interface VersionMapper {


    @Insert("INSERT INTO " + VersionBiz.versionTableName +
        " (name, description, state, createTime, removeTime, removed, data, deployId, version) values (" +
        " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}, #{item.removed}, #{data}, #{item.deployId}, #{item.version})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertRow(@Param("item") Version item, @Param("data") String data);

    @Update("update " + VersionBiz.versionTableName + " set state = 'INAVTIVE', removed = 1 where deployId = ${deployId}")
    int disableAllVersion(@Param("deployId") int deployId);

    @Select("select " + RowMapper.basicColumns + " from " + VersionBiz.versionTableName
        + " where deployId = ${deployId} and version=${version} AND removed = 0")
    RowMapperDao getVersion(@Param("deployId") int deployId, @Param("version") long version);

    @Select("select " + RowMapper.basicColumns + " from " + VersionBiz.versionTableName
        + " where deployId = ${deployId} AND removed = 0")
    List<RowMapperDao> getAllVersionByDeployId(@Param("deployId") int deployId);

    @Select("SELECT MAX(version) FROM " + VersionBiz.versionTableName + " WHERE deployId = ${deployId} AND removed = 0")
    Long getMaxVersion(@Param("deployId") int deployId);
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
