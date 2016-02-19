package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.ConfigFile;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Repository
public interface ConfigFileMapper {
    @Select("SELECT * FROM conf_file WHERE projectId=#{projectId}")
    List<ConfigFile> getALLConfigByProjectId(@Param("projectId") int projectId);

    @Insert("INSERT INTO conf_file (projectId, confFile, targetFile) VALUES (" +
            "#{projectId}, #{confFile}, #{targetFile})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addConfFile(ConfigFile configFile);

    @Update("UPDATE conf_file SET confFile=#{confFile}, targetFile=#{targetFile} WHERE projectId=#{projectId}")
    int updateConfigFile(ConfigFile configFile);

    @Delete("DELETE FROM conf_file WHERE projectId=#{projectId}")
    int deleteConfigFileByProjectId(@Param("projectId") int projectId);
}
