package org.domeos.framework.api.model.project.related;

import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2016/9/23.
 */
public class UploadFileInfo {
    private String filename;
    private String content;

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(filename)) {
            return "file name is null";
        }

        if (StringUtils.isBlank(content)) {
            return "content of " + filename + " is null";
        }

        return null;
    }
}
