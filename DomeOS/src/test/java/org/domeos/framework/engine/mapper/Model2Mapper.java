package org.domeos.framework.engine.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;
import org.domeos.framework.engine.model.RowMapperDao;
import org.springframework.stereotype.Repository;

/**
 * Created by sparkchen on 16/4/5.
 */
@Repository
public interface Model2Mapper  {

    @Insert("INSERT INTO ${tableName} (name, description, state, createTime, removeTime, removed, data, column1) values (" +
        " '${item.name}', '${item.description}', '${item.state}', ${item.createTime}, ${item.removeTime}, ${item.removed}, '${item.data}', ${column1})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertRow( @Param("tableName")String tableName, @Param("item") RowMapperDao item, @Param("column1") int column1);

    @Update("update ${tableName} set name=${item.name}, description=${item.description}, state=${item.state}, data=${item.data}, column1=${column1} where id = ${item.id}")
    int updateRow( @Param("tableName")String tableName, @Param("item") RowMapperDao item, @Param("column1") int column1);

}
