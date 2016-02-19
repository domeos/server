package org.domeos.api.model.project;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
public class ConfigFile {
    int id;
    int projectId;
    String confFile;
    String targetFile;

    public ConfigFile() {}

    public ConfigFile(int projectId, String confFile, String targetFile) {
        this.projectId = projectId;
        this.confFile = confFile;
        this.targetFile = targetFile;
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

    public String getConfFile() {
        return confFile;
    }

    public void setConfFile(String confFile) {
        this.confFile = confFile;
    }

    public String getTargetFile() {
        return targetFile;
    }

    public void setTargetFile(String targetFile) {
        this.targetFile = targetFile;
    }
}
