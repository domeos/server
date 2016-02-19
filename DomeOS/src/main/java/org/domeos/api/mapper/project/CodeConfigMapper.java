package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.CodeConfig;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2015/11/16.
 */
@Repository
public interface CodeConfigMapper {
    @Select("SELECT * FROM code_config WHERE projectId=#{projectId}")
    CodeConfig getCodeConfigsByProjectId(@Param("projectId") int projectId);

    @Insert("INSERT INTO code_config (projectId, codeManager, codeSource, codeSshUrl, codeHttpUrl, codeId, userInfo) VALUES (" +
            "#{projectId}, #{codeManager}, #{codeSource}, #{codeSshUrl}, #{codeHttpUrl}, #{codeId}, #{userInfo})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addCodeConfig(CodeConfig codeConfig);

    @Update("UPDATE code_config SET codeManager=#{codeManager}, codeSource=#{codeSource}, codeSshUrl=#{codeSshUrl}, codeHttpUrl=#{codeHttpUrl}, codeId=#{codeId}, userInfo=#{userInfo} WHERE projectId=#{projectId}")
    int updateCodeConfig(CodeConfig codeConfig);

    @Delete("DELETE FROM code_config WHERE projectId=#{projectId}")
    int deleteCodeConfigByProjectId(@Param("projectId") int id);
}
