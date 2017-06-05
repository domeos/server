package org.domeos.framework.api.mapper.domeos.project;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.project.GitlabUser;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/17.
 */
@Mapper
public interface GitlabUserMapper {
    @Select("SELECT * FROM gitlab_user WHERE userId=#{userId}")
    List<GitlabUser> getGitlabInfoByUserId(@Param("userId") int userId);

    @Select("SELECT * FROM gitlab_user WHERE gitlabId=#{gitlabId}")
    List<GitlabUser> getGitlabInfoByGitlabId(@Param("gitlabId") int gitlabId);

    @Select("SELECT * FROM gitlab_user WHERE userId=#{userId} and gitlabId=#{gitlabId}")
    List<GitlabUser> getGitlabInfoByUserIdAndGitlabId(@Param("userId") int userId, @Param("gitlabId") int gitlabId);

    @Select("SELECT * FROM gitlab_user WHERE id=#{id}")
    GitlabUser getGitlabInfoById(@Param("id") int id);

    @Select("SELECT * FROM gitlab_user WHERE id=#{id} and name=#{name}")
    GitlabUser getGitlabInfoByName(@Param("id") int id, @Param("name") String name);

    @Select("SELECT * FROM gitlab_user WHERE userId=#{userId} AND name=#{name} AND gitlabId=#{gitlabId}")
    GitlabUser getGitlabInfoByUserIdNameAndGitlabId(@Param("userId") int userId, @Param("name") String name,
                                                    @Param("gitlabId") int gitlabId);

    @Insert("INSERT INTO gitlab_user (userId, name, token, createTime, gitlabId) VALUES (#{userId}, #{name}, #{token}, #{createTime}, #{gitlabId})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addGitlabInfo(GitlabUser gitlab);

    @Update("UPDATE gitlab_user set token = #{token} WHERE id = #{id}")
    int updateGitlabToken(GitlabUser gitlab);

    @Delete("DELETE FROM gitlab_user WHERE id=#{id}")
    int deleteGitlabInfoById(@Param("id") int id);
}
