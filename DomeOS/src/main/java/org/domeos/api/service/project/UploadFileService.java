package org.domeos.api.service.project;

import org.domeos.basemodel.HttpResponseTemp;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;

/**
 * Created by feiliu206363 on 2015/11/18.
 */
public interface UploadFileService {
    /**
     * upload config file to database
     *
     * @param file
     * @return
     */
    HttpResponseTemp<?> uploadFile(MultipartFile file);

    /**
     * upload config files to database
     *
     * @param files
     * @return
     */
    HttpResponseTemp<?> uploadFiles(MultipartFile[] files);

    /**
     * download file by md5 in database
     *
     * @param md5
     * @param fileName
     * @param response
     * @return
     */
    HttpResponseTemp<?> downloadFile(String md5, String fileName, final HttpServletResponse response);
}
