package org.domeos.framework.api.model.project.related;

import org.domeos.util.StringUtils;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/9/23.
 */
public class CustomDockerfile {
    private String dockerfile;
    private List<UploadFileInfo> uploadFileInfos;

    public String getDockerfile() {
        return dockerfile;
    }

    public void setDockerfile(String dockerfile) {
        this.dockerfile = dockerfile;
    }

    public List<UploadFileInfo> getUploadFileInfos() {
        return uploadFileInfos;
    }

    public void setUploadFileInfos(List<UploadFileInfo> uploadFileInfos) {
        this.uploadFileInfos = uploadFileInfos;
    }

    public String contentByName(String filename) {
        if (uploadFileInfos != null) {
            for (UploadFileInfo uploadFileInfo : uploadFileInfos) {
                if (uploadFileInfo.getFilename().equals(filename)) {
                    return uploadFileInfo.getContent();
                }
            }
        }
        return null;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(dockerfile)) {
            return "dockerfile context is null!";
        }
        String error;
        if (uploadFileInfos != null) {
            for (UploadFileInfo uploadFileInfo : uploadFileInfos) {
                error = uploadFileInfo.checkLegality();
                if (!StringUtils.isBlank(error)) {
                    return error;
                }
            }
        }
        return null;
    }
}
