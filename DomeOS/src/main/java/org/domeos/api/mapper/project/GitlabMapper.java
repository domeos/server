package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.git.Gitlab;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/17.
 */
@Repository
public interface GitlabMapper {
    @Select("SELECT * FROM gitlab_info WHERE userId=#{userId}")
    List<Gitlab> getGitlabInfoByUserId(@Param("userId") int userId);

    @Select("SELECT * FROM gitlab_info WHERE id=#{id}")
    Gitlab getGitlabInfoById(@Param("id") int id);

    @Select("SELECT * FROM gitlab_info WHERE id=#{id} and name=#{name}")
    Gitlab getGitlabInfoByName(@Param("id") int id, @Param("name") String name);

    @Select("SELECT * FROM gitlab_info WHERE userId=#{userId} AND name=#{name}")
    Gitlab getGitlabInfoByUserIdAndName(@Param("userId") int userId, @Param("name") String name);

    @Insert("INSERT INTO gitlab_info (userId, name, token, createTime) VALUES (#{userId}, #{name}, #{token}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addGitlabInfo(Gitlab gitlab);

    @Delete("DELETE FROM gitlab_info WHERE id=#{id}")
    int deleteGitlabInfoById(@Param("id") int id);

    @Update("UPDATE git_lab SET userId=#{userId}, name=#{name}, token=#{token} WHERE id=#{id}")
    int updateGitlabInfoById(Gitlab gitlab);
}
