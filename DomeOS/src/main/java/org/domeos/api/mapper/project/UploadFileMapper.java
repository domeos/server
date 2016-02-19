package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.UploadFile;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Repository
public interface UploadFileMapper {
    @Select("SELECT * FROM upload_file WHERE projectId=#{projectId}")
    List<UploadFile> getALLUploadFilesByProjectId(@Param("projectId") int projectId);

    @Insert("INSERT INTO upload_file (projectId, path, md5) VALUES" +
            "(#{projectId}, #{path}, #{md5})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addUploadFile(UploadFile uploadFile);

    @Update("UPDATE upload_file SET path=#{path}, md5=#{md5} WHERE projectId=#{projectId}")
    int updateUploadFile(UploadFile uploadFile);

    @Delete("DELETE FROM upload_file WHERE projectId=#{projectId}")
    int deleteUploadFileByProjectId(@Param("projectId") int projectId);
}
