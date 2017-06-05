package org.domeos.framework.api.biz.file.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.file.FileContentBiz;
import org.domeos.framework.api.mapper.domeos.file.FileContentMapper;
import org.domeos.framework.api.model.file.FileContent;
import org.domeos.framework.engine.exception.DaoException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Service("fileContentBiz")
public class FileContentBizImpl extends BaseBizImpl implements FileContentBiz {

    @Autowired
    FileContentMapper fileContentMapper;

    @Override
    public void insertFileContent(String name, String md5, byte[] content) throws DaoException {

        FileContent fileContent = new FileContent(md5, content);
        fileContent.setName(name);
        fileContent.setState("active");
        fileContentMapper.insertFileContent(fileContent);
    }

    @Override
    public byte[] getContentByMd5(String md5) {
        List<FileContent> fileContents = fileContentMapper.getContentByMd5(md5);
        if (fileContents == null || fileContents.size() == 0) {
            return null;
        }
        return fileContents.get(0).getContent();
    }
}