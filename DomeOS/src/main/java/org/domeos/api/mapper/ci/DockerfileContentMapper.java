package org.domeos.api.mapper.ci;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.ci.DockerfileContent;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2015/11/27.
 */
@Repository
public interface DockerfileContentMapper {
    @Insert("INSERT into dockerfile_content (projectId, buildId, content) VALUES (#{projectId}, #{buildId}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addDockerfileContent(DockerfileContent content);

    @Select("SELECT * FROM dockerfile_content WHERE id=#{id}")
    DockerfileContent getDockerfileContentById(@Param("id") int id);

    @Select("SELECT * FROM dockerfile_content WHERE buildId=#{buildId}")
    DockerfileContent getDockerfileContentByBuildId(@Param("buildId") int buildId);

    @Update("UPDATE dockerfile_content SET content=#{content} WHERE projectId=#{projectId} and buildId=#{buildId}")
    int updateDockerfileContent(DockerfileContent content);
}
