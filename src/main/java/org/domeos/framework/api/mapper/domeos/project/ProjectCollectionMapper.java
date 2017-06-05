package org.domeos.framework.api.mapper.domeos.project;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.biz.project.ProjectCollectionBiz;
import org.domeos.framework.api.model.project.ProjectCollection;
import org.domeos.framework.engine.model.RowMapperDao;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/9/22.
 */
@Mapper
public interface ProjectCollectionMapper {
    @Insert("INSERT INTO " + ProjectCollectionBiz.PROJECT_COLLECTION +
            " (name, description, state, createTime, removeTime, removed, data, projectCollectionState) VALUES (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data}, #{item.projectCollectionState})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int addProjectCollection(@Param("item") ProjectCollection item, @Param("data") String data);

    @Update("UPDATE " + ProjectCollectionBiz.PROJECT_COLLECTION +
            " SET name=#{item.name}, description=#{item.description}, state=#{item.state}," +
            " data=#{data}, projectCollectionState=#{item.projectCollectionState} WHERE id=#{item.id}")
    void updateProjectCollection(@Param("item") ProjectCollection project, @Param("data") String data);

    @Select("SELECT * FROM " + ProjectCollectionBiz.PROJECT_COLLECTION + " WHERE removed=0")
    List<ProjectCollection> getAllProjectCollection();

    @Select("SELECT * FROM " + ProjectCollectionBiz.PROJECT_COLLECTION + " WHERE projectCollectionState=#{collection_state} AND removed=0")
    List<RowMapperDao> getPublicProjectCollection(@Param("collection_state") ProjectCollection.ProjectCollectionState state);

    @Select("SELECT * FROM " + ProjectCollectionBiz.PROJECT_COLLECTION + " WHERE name=#{name} AND removed=0 LIMIT 1")
    RowMapperDao getProjectCollectionByName(@Param("name") String name);

    @Select("SELECT COUNT(*) FROM " + ProjectCollectionBiz.PROJECT_COLLECTION + " WHERE name=#{name} AND removed=0")
    int checkProjectCollectionName(@Param("name") String name);

    @Select("SELECT projectCollectionState FROM " + ProjectCollectionBiz.PROJECT_COLLECTION + " WHERE id=#{id} and removed=0")
    ProjectCollection.ProjectCollectionState getAuthoriy(@Param("id") int id);

}
