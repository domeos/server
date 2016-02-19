package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.EnvConfig;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Repository
public interface EnvConfigMapper {
    @Select("SELECT * FROM env_conf WHERE projectId=#{projectId}")
    List<EnvConfig> getALLEnvConfigsByProjectId(@Param("projectId") int projectId);

    @Insert("INSERT INTO env_conf (projectId, envKey, envValue, description) VALUES (" +
            "#{projectId}, #{envKey}, #{envValue}, #{description})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addEnvConfig(EnvConfig envConfig);

    @Update("UPDATE env_conf SET envKey=#{envKey}, envValue=#{envValue}, description=#{description} WHERE projectId=#{projectId}")
    int updateEnvConfig(EnvConfig envConfig);

    @Delete("DELETE FROM env_conf WHERE projectId=#{projectId}")
    int deleteEnvConfigByProjectId(@Param("projectId") int projectId);
}
