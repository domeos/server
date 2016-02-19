package org.domeos.api.model.deployment;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
public class FilePath {
    int id;
    int projectId;
    String path;
    int type;

    public FilePath() {}

    public FilePath(int projectId, String path, int type) {
        this.projectId = projectId;
        this .path = path;
        this.type = type;
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

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }
}
