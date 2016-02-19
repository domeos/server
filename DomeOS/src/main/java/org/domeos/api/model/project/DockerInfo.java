package org.domeos.api.model.project;

/**
 * Created by feiliu206363 on 2015/11/26.
 */
public class DockerInfo {
    int id;
    int projectId;
    String buildPath;
    String branch;
    String dockerfilePath;

    public DockerInfo() {}

    public DockerInfo(int projectId, String buildPath, String branch, String dockerfilePath) {
        this.projectId = projectId;
        this.buildPath = buildPath;
        this.branch = branch;
        this.dockerfilePath = dockerfilePath;
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

    public String getBuildPath() {
        return buildPath;
    }

    public void setBuildPath(String buildPath) {
        this.buildPath = buildPath;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public String getDockerfilePath() {
        return dockerfilePath;
    }

    public void setDockerfilePath(String dockerfilePath) {
        this.dockerfilePath = dockerfilePath;
    }
}
