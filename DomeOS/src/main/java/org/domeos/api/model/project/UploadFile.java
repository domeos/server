package org.domeos.api.model.project;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
public class UploadFile {
    int id;
    int projectId;
    String path;
    String md5;

    public UploadFile() {}

    public UploadFile(int projectId, String path, String md5) {
        this.projectId = projectId;
        this.path = path;
        this.md5 = md5;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getMd5() {
        return md5;
    }

    public void setMd5(String md5) {
        this.md5 = md5;
    }
}
