package org.domeos.api.mapper.deployment;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.api.model.deployment.VersionDBProto;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 */
@Repository
public interface VersionMapper {

    @Select("SELECT * FROM version WHERE deployId=#{deployId} AND version=#{version}")
    VersionDBProto getVersion(@Param("deployId") long deployId, @Param("version") long version);

    @Select("SELECT * FROM version WHERE deployId=#{deployId} AND version=" +
            "(SELECT MAX(version) FROM version where deployId=#{deployId})")
    VersionDBProto getNewestVersion(@Param("deployId") long deployId);

    @Select("SELECT * FROM version WHERE deployId=#{deployId}")
    List<VersionDBProto> listVersionByDeployId(@Param("deployId") long deployId);

    @Insert("INSERT INTO version (deployId, version, contents) VALUES (#{deployId}, #{version}, #{contents})")
    void createVersion(VersionDBProto versionDBProto);

    /**
     * get max version of a deploy
     * @param deployId deployId
     * @return max version if exist, null(please use Long to accept return value) if not exist
     */
    @Select("SELECT max(version) FROM version WHERE deployId=#{deployId}")
    Long getMaxVersion(@Param("deployId") long deployId);

    @Delete("DELETE FROM version WHERE deployId=#{deployId} AND version=#{version}")
    void deleteVersion(@Param("deployId") long deployId, @Param("version") long version);

    @Delete("DELETE FROM version WHERE vid=#{vid}")
    void deleteVersionById(@Param("vid") long vid);
}
