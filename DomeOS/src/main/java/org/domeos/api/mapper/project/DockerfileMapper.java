package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.Dockerfile;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/7/30.
 */
@Repository
public interface DockerfileMapper {
    @Select("SELECT * FROM dockerfile WHERE projectId=#{projectId}")
    Dockerfile getDockerfileByProjectBasicId(@Param("projectId") int projectId);

    @Insert("INSERT INTO dockerfile (projectId, baseImageName, baseImageTag, baseImageRegistry, installCmd, codePath, workDir, dockerEnv, compileCmd, dockerCmd, user, createTime)" +
            "VALUES (#{projectId}, #{baseImageName}, #{baseImageTag}, #{baseImageRegistry}, #{installCmd}, #{codePath}, #{workDir}, #{dockerEnv}, #{compileCmd}, #{dockerCmd}, #{user}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addDockerfile(Dockerfile dockerfile);

    @Update("UPDATE dockerfile SET projectId=#{projectId}, baseImageName=#{baseImageName}, baseImageTag=#{baseImageTag}," +
            "baseImageRegistry=#{baseImageRegistry}, installCmd=#{installCmd}, codePath=#{codePath}, workDir=#{workDir}," +
            "dockerEnv=#{dockerEnv}, compileCmd=#{compileCmd}, dockerCmd=#{dpckerCmd}, user=#{user} WHERE id=#{id}")
    int updateDockerfile(Dockerfile dockerfile);

    @Delete("DELETE From dockerfile WHERE id=#{id}")
    int deleteDockerfile(int id);

    @Delete("DELETE from dockerfile WHERE projectId=#{projectId}")
    int deleteDockerfileByProjectId(@Param("projectId") int projectId);

    @Select("SELECT * FROM dockerfile WHERE procjectId=#{projectId}")
    List<Dockerfile> listDockerfilesByProjectName(int projectId);
}
