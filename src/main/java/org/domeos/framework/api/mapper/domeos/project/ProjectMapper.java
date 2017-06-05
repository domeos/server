package org.domeos.framework.api.mapper.domeos.project;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Mapper
public interface ProjectMapper {
    @Select("SELECT COUNT(*) FROM project WHERE name=#{name} AND removed=0")
    Integer checkProjectName(@Param("name") String name);

    @Insert("INSERT INTO " + GlobalConstant.PROJECT_TABLE_NAME +
            " (name, description, state, createTime, removeTime, removed, data, authority) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data}, #{item.authority})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    Integer insertRowForProject(@Param("item") Project item, @Param("data") String data);


    @Select("SELECT authority FROM project WHERE id=#{id} and removed=0")
    Integer getAuthoriy(@Param("id") int id);

    @Select("SELECT * FROM project WHERE authority=1 AND removed=0")
    List<RowMapperDao> getAuthoritiedProjects();

    @Update("UPDATE " + GlobalConstant.PROJECT_TABLE_NAME +
            " SET name=#{item.name}, description=#{item.description}, state=#{item.state}," +
            " data=#{data}, authority=#{item.authority} WHERE id=#{item.id}")
    void updateProject(@Param("item") Project project, @Param("data") String data);


    @Select("SELECT * FROM project WHERE removed=0")
    List<RowMapperDao> getAllProjects();

    @Select("SELECT * FROM " + GlobalConstant.PROJECT_TABLE_NAME + " WHERE removed=0 AND id in (${idList})")
    List<Project> listProjectsByIdList(@Param("idList") String idList);
}
