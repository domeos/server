package org.domeos.framework.api.model.project.related;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class UserDefinedDockerfile {
    String buildPath;
    String branch;
    String dockerfilePath;

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
