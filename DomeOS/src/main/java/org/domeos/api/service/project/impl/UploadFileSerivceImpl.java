package org.domeos.api.service.project.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.project.UploadFileContentMapper;
import org.domeos.api.model.project.UploadFileContent;
import org.domeos.api.service.project.UploadFileService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import static org.domeos.global.Md5.getMd5Str;

/**
 * Created by feiliu206363 on 2015/11/18.
 */
@Service("uploadFileServiceImpl")
public class UploadFileSerivceImpl implements UploadFileService {
    private static Logger logger = LoggerFactory.getLogger(ProjectServiceImpl.class);

    @Autowired
    UploadFileContentMapper uploadFileContentMapper;

    @Override
    public HttpResponseTemp<?> uploadFile(MultipartFile file) {
        Map<String, String> uploadInfo = new HashMap<>();
        try {
            String md5 = saveFile(file);
            uploadInfo.put(file.getOriginalFilename(), md5);
            return ResultStat.OK.wrap(uploadInfo);
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    @Override
    public HttpResponseTemp<?> uploadFiles(MultipartFile[] files) {
        Map<String, String> uploadInfo = new HashMap<>();
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                String md5 = null;
                try {
                    md5 = saveFile(file);
                } catch (Exception e) {
                    return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
                }
                uploadInfo.put(file.getOriginalFilename(), md5);
            }
            return ResultStat.OK.wrap(uploadInfo);
        } else {
            return ResultStat.PARAM_ERROR.wrap(null, "input files is null");
        }
    }

    @Override
    public HttpResponseTemp<?> downloadFile(String md5, String fileName, final HttpServletResponse response) {
        if (StringUtils.isBlank(md5)) {
            return ResultStat.PARAM_ERROR.wrap(null, "md5 is null");
        }
        UploadFileContent content = uploadFileContentMapper.getUploadFileContentByMd5(md5);
        if (content == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such file");
        }
        byte[] data = content.getContent();
        if (StringUtils.isBlank(fileName)) {
           fileName = content.getMd5();
        }
        try {
            fileName = URLEncoder.encode(fileName, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            logger.error("encode download file name error, file name is " + fileName + ", message is " + e.getMessage());
        }
        response.reset();
        response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName + "\"");
        response.addHeader("Content-Length", "" + data.length);
        response.setContentType("application/octet-stream;charset=UTF-8");
        OutputStream outputStream = null;
        try {
            outputStream = new BufferedOutputStream(response.getOutputStream());
            outputStream.write(data);
            outputStream.flush();
            outputStream.close();
        } catch (IOException e) {
            logger.error("download file error, message is " + e.getMessage());
        }

        return ResultStat.OK.wrap(null);
    }

    private String saveFile(MultipartFile file) throws Exception {
        if (file == null) {
            throw new NullPointerException("input file is null");
        }
        String md5 = null;
        try {
            byte[] bytes = new byte[(int) file.getSize()];
            file.getInputStream().read(bytes);
            md5 = getMd5Str(bytes);
            uploadFileContentMapper.addUploadFileContent(new UploadFileContent(file.getOriginalFilename(), md5, bytes));
            return md5;
        } catch (IOException e) {
            logger.error("save upload file error, message is " + e.getMessage());
            throw new Exception(e);
        } catch (NoSuchAlgorithmException e) {
            logger.error("calculate file Md5 error, message is " + e.getMessage());
            throw new Exception(e);
        } catch (DuplicateKeyException e) {
            return md5;
        }
    }
}
