package org.domeos.framework.api.mapper.domeos.global;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/1/20.
 */
@Mapper
public interface GlobalMapper {
    @Insert("INSERT INTO global (type, value, createTime, lastUpdate, description) values (" +
            "#{type}, #{value}, #{createTime}, #{lastUpdate}, #{description})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addGlobalInfo(GlobalInfo globalInfo);

    @Select("SELECT * FROM global WHERE type=#{type}")
    GlobalInfo getGlobalInfoByType(@Param("type") GlobalType globalType);

    @Select("SELECT * FROM global WHERE type=#{type} AND id=#{id}")
    GlobalInfo getGlobalInfoByTypeAndId(@Param("type") GlobalType globalType, @Param("id") int id);

    @Select("SELECT * FROM global WHERE type=#{type}")
    List<GlobalInfo> listGlobalInfoByType(@Param("type") GlobalType globalType);

    @Select("SELECT * FROM global WHERE id=#{id}")
    GlobalInfo getGlobalInfoById(@Param("id") int id);

    @Delete("DELETE FROM global WHERE type=#{type}")
    int deleteGlobalInfoByType(@Param("type") GlobalType globalType);

    @Delete("DELETE FROM global WHERE id=#{id}")
    int deleteGlobalInfoById(@Param("id") int id);

    @Update("UPDATE global SET value=#{value}, lastUpdate=#{lastUpdate}, description=#{description} WHERE type=#{type} AND id=#{id}")
    int updateGlobalInfoById(GlobalInfo globalInfo);

    @Update("UPDATE global SET value=#{value}, lastUpdate=#{lastUpdate} WHERE type=#{type}")
    int updateGlobalInfoByType(GlobalInfo globalInfo);
}
