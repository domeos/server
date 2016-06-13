package org.domeos.framework.api.mapper.global;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2016/1/20.
 */
@Repository
public interface GlobalMapper {
    @Insert("INSERT INTO global (type, value, createTime, lastUpdate) values (" +
            "#{type}, #{value}, #{createTime}, #{lastUpdate})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addGlobalInfo(GlobalInfo globalInfo);

    @Select("SELECT * FROM global WHERE type=#{type}")
    GlobalInfo getGlobalInfoByType(@Param("type") GlobalType globalType);

    @Select("SELECT * FROM global WHERE id=#{id}")
    GlobalInfo getGlobalInfoById(@Param("id") int id);

    @Delete("DELETE FROM global WHERE type=#{type}")
    int deleteGlobalInfoByType(@Param("type") GlobalType globalType);

    @Delete("DELETE FROM global WHERE id=#{id}")
    int deleteGlobalInfoById(@Param("id") int id);

    @Update("UPDATE global SET value=#{value}, lastUpdate=#{lastUpdate} WHERE type=#{type} AND id=#{id}")
    int updateGlobalInfoById(GlobalInfo globalInfo);

    @Update("UPDATE global SET value=#{value}, lastUpdate=#{lastUpdate} WHERE type=#{type}")
    int updateGlobalInfoByType(GlobalInfo globalInfo);
}
