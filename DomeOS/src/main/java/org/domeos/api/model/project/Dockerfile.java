package org.domeos.api.model.project;

import org.apache.commons.lang3.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/7/30.
 */
public class Dockerfile {
    int id;
    int projectId;
    String baseImageName;
    String baseImageTag;
    String baseImageRegistry;
    String installCmd;
    String codePath;
    String workDir;
    String dockerEnv;
    String compileCmd;
    String dockerCmd;
    String user;
    long createTime;

    public Dockerfile() {}

    public Dockerfile(int projectId, String baseImageName, String baseImageTag, String baseImageRegistry, String installCmd, String codePath, String workDir,
                      String dockerEnv, String compileCmd, String dockerCmd, String user) {
        this.projectId = projectId;
        this.baseImageName = baseImageName;
        this.baseImageTag = baseImageTag;
        this.baseImageRegistry = baseImageRegistry;
        this.installCmd = installCmd;
        this.codePath = codePath;
        this.workDir = workDir;
        this.dockerEnv = dockerEnv;
        this.compileCmd = compileCmd;
        this.dockerCmd = dockerCmd;
        this.user = user;
        this.createTime = System.currentTimeMillis();
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

    public String getBaseImageName() {
        return baseImageName;
    }

    public void setBaseImageName(String baseImageName) {
        this.baseImageName = baseImageName;
    }

    public String getBaseImageTag() {
        return baseImageTag;
    }

    public void setBaseImageTag(String baseImageTag) {
        this.baseImageTag = baseImageTag;
    }

    public String getBaseImageRegistry() {
        return baseImageRegistry;
    }

    public void setBaseImageRegistry(String baseImageRegistry) {
        this.baseImageRegistry = baseImageRegistry;
    }

    public String dockerFrom() {
        String dockerFrom = baseImageName;
        String registry = CommonUtil.domainUrl(baseImageRegistry);
        if (!StringUtils.isBlank(registry)) {
            dockerFrom = registry + "/" + dockerFrom;
        }
        if (!StringUtils.isBlank(baseImageTag)) {
            dockerFrom += ":" +baseImageTag;
        }
        return dockerFrom;
    }

    public String getInstallCmd() {
        return installCmd;
    }

    public void setInstallCmd(String installCmd) {
        this.installCmd = installCmd;
    }

    public String getCodePath() {
        return codePath;
    }

    public void setCodePath(String codePath) {
        this.codePath = codePath;
    }

    public String getWorkDir() {
        return workDir;
    }

    public void setWorkDir(String workDir) {
        this.workDir = workDir;
    }

    public String getDockerEnv() {
        return dockerEnv;
    }

    public void setDockerEnv(String dockerEnv) {
        this.dockerEnv = dockerEnv;
    }

    public String getCompileCmd() {
        return compileCmd;
    }

    public void setCompileCmd(String compileCmd) {
        this.compileCmd = compileCmd;
    }

    public String getDockerCmd() {
        return dockerCmd;
    }

    public void setDockerCmd(String dockerCmd) {
        this.dockerCmd = dockerCmd;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }
}
