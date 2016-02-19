package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.ProjectBasic;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/11.
 */
@Repository
public interface ProjectBasicMapper {
    @Select("SELECT * FROM project_basic WHERE name=#{name}")
    List<ProjectBasic> getALLProjectBasicsByName(@Param("name") String name);

    @Select("SELECT * FROM project_basic WHERE name=#{name} AND status=1")
    ProjectBasic getProjectBasicByName(@Param("name") String name);

    @Select("SELECT * FROM project_basic WHERE id=#{id}")
    ProjectBasic getProjectBasicById(@Param("id") int id);

    @Select("SELECT id FROM project_basic WHERE name=#{name} AND status=1")
    int getProjectBasicIdByName(@Param("name") String name);

    @Insert("INSERT INTO project_basic (name, type, description, stateless, dockerfile, createTime, lastModify, authority, status) VALUES (" +
            "#{name}, #{type}, #{description}, #{stateless}, #{dockerfile}, #{createTime}, #{lastModify}, #{authority}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addProjectBasic(ProjectBasic projectBasic);

    @Update("UPDATE project_basic SET status=0 WHERE id=#{projectId}")
    int deleteProjectBasicById(@Param("projectId") int projectId);

    @Update("UPDATE project_basic SET name=#{name}, type=#{type}, description=#{description}, stateless=#{stateless}, dockerfile=#{dockerfile}," +
            "createTime=#{createTime}, lastModify=#{lastModify}, authority=#{authority}, status=#{status} WHERE id=#{id}")
    int updateProjectBasicById(ProjectBasic projectBasic);

    @Select("SELECT * FROM project_basic WHERE status=1")
    List<ProjectBasic> listProjectBasic();

    @Select("SELECT id FROM project_basic WHERE status=1 and authority = 1")
    List<ProjectBasic> listPublicProjectBasic();

    @Select("SELECT authority FROM project_basic WHERE status=1 and id=#{id}")
    int getProjectAuthorityById(@Param("id") long id);
}
