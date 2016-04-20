package org.domeos.framework.api.biz.file;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.engine.exception.DaoException;

/**
 * Created by baokangwang on 2016/4/6.
 */
public interface FileContentBiz extends BaseBiz {

    String FILE_CONTENT_TABLE_NAME = "file_content";

    void insertFileContent(String name, String md5, byte[] content) throws DaoException;

    byte[] getContentByMd5(String md5);
}
