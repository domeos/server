package org.domeos.framework.api.model.project.related;

import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class UserDefinedDockerfile {
    String buildPath;
    String branch;
    String tag;
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

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getDockerfilePath() {
        return dockerfilePath;
    }

    public void setDockerfilePath(String dockerfilePath) {
        this.dockerfilePath = dockerfilePath;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(buildPath)) {
            setBuildPath("/");
        } else if (StringUtils.isBlank(dockerfilePath)) {
            return "dockerfile path is blank";
        }
        return null;
    }
}
