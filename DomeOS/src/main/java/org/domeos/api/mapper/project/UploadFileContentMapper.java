package org.domeos.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.project.UploadFileContent;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2015/11/18.
 */
@Repository
public interface UploadFileContentMapper {
    @Select("SELECT * FROM upload_file_content WHERE md5=#{md5}")
    UploadFileContent getUploadFileContentByMd5(@Param("md5") String md5);

    @Insert("INSERT INTO upload_file_content (name, md5, content) VALUES (#{name}, #{md5}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addUploadFileContent(UploadFileContent content);

    @Delete("DELETE FROM upload_file_content WHERE md5=#{md5}")
    int deleteUploadFileContentByMd5(@Param("md5") String md5);
}
