package org.domeos.framework.api.mapper.domeos.base;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.engine.model.RowMapperDao;

import java.util.List;

/**
 * Created by sparkchen on 16/4/5.
 */
@Mapper
public interface RowMapper extends ISimpleMapper {

    String BASIC_COLUMNS = " id, name,  description, state, createTime, removeTime, removed, data ";

    @Select("select" + BASIC_COLUMNS + " from ${tableName} where id=#{id}")
    RowMapperDao getById(@Param("tableName") String tableName, @Param("id") int id);

    @Select("select" + BASIC_COLUMNS + " from ${tableName} where name=#{name} and removed=0 limit 1")
    RowMapperDao getByName(@Param("tableName") String tableName, @Param("name") String name);

    @Select("select" + BASIC_COLUMNS + " from ${tableName} where removed = 0")
    List<RowMapperDao> getList(@Param("tableName") String tableName);

    @Select("select" + BASIC_COLUMNS + " from ${tableName} where name=#{name} and removed = 0")
    List<RowMapperDao> getListByName(@Param("tableName") String tableName, @Param("name") String name);

    @Select("select" + BASIC_COLUMNS + " from ${tableName} where id in ${idList} and removed = 0")
    List<RowMapperDao> getByIdList(@Param("tableName") String tableName, @Param("idList") String idList);

    @Update("update ${tableName} set removed = 1, removeTime=#{removeTime} where id = #{id}")
    int removeRowById(@Param("tableName") String tableName, @Param("id") int id, @Param("removeTime") long removeTime);

    @Update("update ${tableName} set state=#{state} where id = #{id}")
    int updateState(@Param("tableName") String tableName, @Param("state") String state, @Param("id") int id);

    @Select("select state from ${tableName} where id=#{id}")
    String getStateById(@Param("tableName") String tableName, @Param("id") int id);

    @Select("select name from ${tableName} where id=#{id}")
    String getNameById(@Param("tableName") String tableName, @Param("id") int id);

    @Select("select" + BASIC_COLUMNS + " from ${tableName} where id in ${idList}")
    List<RowMapperDao> getListIncludeRemovedByIdList(@Param("tableName") String tableName, @Param("idList") String idList);


    /*************************/
    @Insert("INSERT INTO ${tableName} (name, description, state, createTime, removeTime, removed, data) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}, #{item.removed}, #{item.data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertRow(@Param("tableName") String tableName, @Param("item") RowMapperDao item);

    @Update("update ${tableName} set name=#{item.name}, description=#{item.description}, state=#{item.state}, " +
            "data=#{item.data} where id=#{item.id}")
    int updateRow(@Param("tableName") String tableName, @Param("item") RowMapperDao item);

}
