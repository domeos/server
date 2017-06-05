package org.domeos.framework.api.mapper.domeos.global;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.global.GitConfig;
import org.domeos.global.GlobalConstant;

import java.util.List;

/**
 * Created by junwuguo on 2017/4/1 0001.
 */
@Mapper
public interface GitConfigMapper {

    @Select("SELECT * FROM " + GlobalConstant.GITCONFIG_TABLE_NAME + " WHERE removed=0")
    List<GitConfig> listAllGitConfigs();

    @Select("SELECT * FROM " + GlobalConstant.GITCONFIG_TABLE_NAME + " WHERE id=#{id}")
    GitConfig getGitConfigById(@Param("id") int id);

    @Update("UPDATE " + GlobalConstant.GITCONFIG_TABLE_NAME +
            " SET id=#{id}, type=#{type}, description=#{description}," +
            " url=#{url}, createTime=#{createTime}, lastUpdate=#{lastUpdate}," +
            " removeTime=#{removeTime}, removed=#{removed} WHERE id=#{id}")
    int updateGitConfig(GitConfig gitConfig);

    @Insert("INSERT INTO " + GlobalConstant.GITCONFIG_TABLE_NAME +
            " (type, url, description, createTime, lastUpdate, removeTime, removed) values (" +
            "#{type}, #{url}, #{description}, #{createTime}, #{lastUpdate}, #{removeTime}, #{removed})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addGitConfig(GitConfig gitConfig);
}
