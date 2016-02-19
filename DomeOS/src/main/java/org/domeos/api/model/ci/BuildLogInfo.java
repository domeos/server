package org.domeos.api.model.ci;

/**
 * Created by feiliu206363 on 2015/11/24.
 */
public class BuildLogInfo {
    int id;
    int projectId;
    int buildId;
    String md5;

    public BuildLogInfo() {}

    public BuildLogInfo(int projectId, int buildId, String md5) {
        this.projectId = projectId;
        this.buildId = buildId;
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

    public int getBuildId() {
        return buildId;
    }

    public void setBuildId(int buildId) {
        this.buildId = buildId;
    }

    public String getMd5() {
        return md5;
    }

    public void setMd5(String md5) {
        this.md5 = md5;
    }
}
