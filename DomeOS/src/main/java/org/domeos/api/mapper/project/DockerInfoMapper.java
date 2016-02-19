package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.DockerInfo;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2015/11/26.
 */
@Repository
public interface DockerInfoMapper {
    @Insert("INSERT INTO dockerfile_info (projectId, buildPath, branch, dockerfilePath) VALUES" +
            "(#{projectId}, #{buildPath}, #{branch}, #{dockerfilePath})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addDockerInfo(DockerInfo dockerInfo);

    @Select("SELECT * FROM dockerfile_info WHERE id=#{id}")
    DockerInfo getDockerInfoById(@Param("id") int id);

    @Select("SELECT * FROM dockerfile_info WHERE projectId=#{projectId}")
    DockerInfo getDockerInfoByProjectId(@Param("projectId") int projectId);

    @Update("UPDATE dockerfile_info SET projectId=#{projectId}, buildPath=#{buildPath}, branch=#{branch}, dockerfilePath=#{dockerfilePath} WHERE id=#{id}")
    int updateDockerInfoById(DockerInfo dockerInfo);

    @Update("UPDATE dockerfile_info SET buildPath=#{buildPath}, branch#={branch}, dockerfilePath=#{dockerfilePath} WHERE projectId=#{projectId}")
    int updateDockerInfoByProjectId(DockerInfo dockerInfo);

    @Delete("DELETE FROM dockerfile_info WHERE projectId=#{projectId}")
    int deleteDockerInfoByProjectId(@Param("projectId") int projectId);
}
