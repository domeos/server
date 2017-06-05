package org.domeos.framework.api.mapper.domeos.configuration;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.configuration.Configuration;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
@Mapper
public interface ConfigurationMapper {
    @Insert("INSERT INTO " + GlobalConstant.CONFIGURATION_TABLE_NAME +
            " (name, description, state, createTime, removeTime, removed, data) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int createConfiguration(@Param("item") Configuration item, @Param("data") String data);

    @Update("update " + GlobalConstant.CONFIGURATION_TABLE_NAME +
            " set description=#{item.description}, state=#{item.state}, " +
            "data=#{data} where id = #{item.id}")
    int updateConfiguration(@Param("item") Configuration item, @Param("data") String data);

    @Select("SELECT * FROM " + GlobalConstant.CONFIGURATION_TABLE_NAME + " WHERE name=#{name} AND removed=0")
    RowMapperDao getConfigurationByName(String name);

    @Select("SELECT * FROM " + GlobalConstant.CONFIGURATION_TABLE_NAME + " WHERE id=#{id} AND removed=0")
    RowMapperDao getConfigurationById(int resourceId);
}
