package org.domeos.framework.api.mapper.domeos.configuration;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.configuration.ConfigurationDeployMap;
import org.domeos.global.GlobalConstant;

import java.util.List;

/**
 * Created by feiliu206363 on 2017/1/20.
 */
@Mapper
public interface ConfigurationDeployMapper {
    @Insert("INSERT INTO " + GlobalConstant.CONFIGURATION_DEPLOY_MAP_TABLE_NAME + " (configurationId, deployId, versionId, createTime) values (" +
            " #{item.configurationId}, #{item.deployId}, #{item.versionId}, #{item.createTime})")
    void addConfigurationVersionMount(@Param("item") ConfigurationDeployMap configurationDeployMap);

    @Delete("DELETE FROM " + GlobalConstant.CONFIGURATION_DEPLOY_MAP_TABLE_NAME + " WHERE deployId=#{deployId}")
    void removeConfigurationVersionMapByDeployId(@Param("deployId") int deployId);

    @Delete("DELETE FROM " + GlobalConstant.CONFIGURATION_DEPLOY_MAP_TABLE_NAME + " WHERE versionId=#{versionId}")
    void removeConfigurationVersionMapByVersionId(@Param("versionId") int versionId);

    @Select("SELECT * FROM " + GlobalConstant.CONFIGURATION_DEPLOY_MAP_TABLE_NAME + " WHERE configurationId=#{configurationId}")
    List<ConfigurationDeployMap> getMapsByConfigurationId(@Param("configurationId") int configureId);
}
