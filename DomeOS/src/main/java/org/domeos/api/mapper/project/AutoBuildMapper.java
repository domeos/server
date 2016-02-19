package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.AutoBuild;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/16.
 */
@Repository
public interface AutoBuildMapper {
    @Insert("INSERT INTO auto_build (projectId, branch, tag) values (" +
            "#{projectId}, #{branch}, #{tag})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addAutoBuildInfo(AutoBuild autoBuild);

    @Select("SELECT * FROM auto_build WHERE projectId=#{id}")
    List<AutoBuild> getAutoBuildByProjectId(@Param("id")int projectId);

    @Delete("DELETE FROM auto_build WHERE projectId=#{projectId}")
    int deleteAutoBuildByProjectId(@Param("projectId") int projectId);
}
