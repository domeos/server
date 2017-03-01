package org.domeos.framework.api.model.image.related;

/**
 * Created by baokangwang on 2016/4/6.
 */
public class FileInfo {

    private boolean dockerfile;
    private String fileName;
    private String filePath;
    private String content;
    private String md5;

    public FileInfo() {
    }

    public FileInfo(boolean dockerfile, String fileName, String filePath, String content) {
        this.dockerfile = dockerfile;
        this.fileName = fileName;
        this.filePath = filePath;
        this.content = content;
    }

    public boolean isDockerfile() {
        return dockerfile;
    }

    public void setDockerfile(boolean dockerfile) {
        this.dockerfile = dockerfile;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMd5() {
        return md5;
    }

    public void setMd5(String md5) {
        this.md5 = md5;
    }

    public String toJson() {
        StringBuilder json = new StringBuilder();
        json.append("{\"fileName\":\"").append(fileName).append("\", ").append("\"filePath\":\"").append(filePath).append("\", ")
                .append("\"md5\":\"").append(md5).append("\"}");
        return json.toString();
    }
}
