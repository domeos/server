package org.domeos.framework.api.mapper.image;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.image.BaseImageCustom;
import org.domeos.framework.engine.mapper.RowMapper;
import org.domeos.framework.engine.model.RowMapperDao;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/7.
 */
@Repository
public interface BaseImageCustomMapper {

    @Select("SELECT * FROM base_image_custom WHERE isGC=0 AND removed=0")
    List<BaseImageCustom> getUnGcBaseImageCustom();

    @Update("UPDATE base_image_custom SET isGC=#{isGC} WHERE id=#{id}")
    void updateBaseImageCustomGC(@Param("id") int id, @Param("isGC") int isGC);

    @Update("UPDATE base_image_custom SET state=#{state} WHERE id=#{id}")
    void updateStateById(@Param("id") int id, @Param("state") String state);

    @Insert("INSERT INTO base_image_custom (name, description, state, createTime, removeTime, removed, data, isGC) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data}, #{item.isGC})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertRow(@Param("item") BaseImageCustom item, @Param("data") String data);

    @Update("UPDATE base_image_custom SET name=#{item.name}, description=#{item.description}, state=#{item.state}," +
            " data=#{data}, isGC=#{item.isGC} WHERE id = #{item.id}")
    void updateRow(@Param("item") BaseImageCustom item, @Param("data") String data);

    @Update("UPDATE base_image_custom SET logMD5=#{logMD5} WHERE id=#{id}")
    void setBaseImageLogMD5(@Param("id")int imageId, @Param("logMD5")String md5);

    @Select("SELECT logMD5 from base_image_custom WHERE id=#{id} AND removed=0")
    String getBaseImageLogMD5(@Param("id")int imageId);

    @Select("SELECT " + RowMapper.BASIC_COLUMNS + "  FROM base_image_custom WHERE removed=0 ORDER BY id DESC")
    List<RowMapperDao> listBaseImageCustom();
}
