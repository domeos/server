package org.domeos.framework.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.project.GitlabUser;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/17.
 */
@Repository
public interface GitlabUserMapper {
    @Select("SELECT * FROM gitlab_user WHERE userId=#{userId}")
    List<GitlabUser> getGitlabInfoByUserId(@Param("userId") int userId);

    @Select("SELECT * FROM gitlab_user WHERE id=#{id}")
    GitlabUser getGitlabInfoById(@Param("id") int id);

    @Select("SELECT * FROM gitlab_user WHERE id=#{id} and name=#{name}")
    GitlabUser getGitlabInfoByName(@Param("id") int id, @Param("name") String name);

    @Select("SELECT * FROM gitlab_user WHERE userId=#{userId} AND name=#{name}")
    GitlabUser getGitlabInfoByUserIdAndName(@Param("userId") int userId, @Param("name") String name);

    @Insert("INSERT INTO gitlab_user (userId, name, token, createTime) VALUES (#{userId}, #{name}, #{token}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addGitlabInfo(GitlabUser gitlab);

    @Delete("DELETE FROM gitlab_user WHERE id=#{id}")
    int deleteGitlabInfoById(@Param("id") int id);
}
