package org.domeos.api.model.ci;

/**
 * Created by feiliu206363 on 2015/11/27.
 */
public class DockerfileContent {
    int id;
    int projectId;
    int buildId;
    String content;

    public DockerfileContent() {}

    public DockerfileContent(int projectId, int buildId, String content) {
        this.projectId = projectId;
        this.buildId = buildId;
        this.content = content;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
