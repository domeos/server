package org.domeos.framework.api.model.project.related;

import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class DockerfileContent {
    private String baseImageName;
    private String baseImageTag;
    private String baseImageRegistry;
    private String installCmd;
    private String codeStoragePath;
    private String compileEnv;
    private String compileCmd;
    private String workDir;
    private String startCmd;
    private String user;

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

    public String getInstallCmd() {
        return installCmd;
    }

    public void setInstallCmd(String installCmd) {
        this.installCmd = installCmd;
    }

    public String getCodeStoragePath() {
        return codeStoragePath;
    }

    public void setCodeStoragePath(String codeStoragePath) {
        this.codeStoragePath = codeStoragePath;
    }

    public String getCompileEnv() {
        return compileEnv;
    }

    public void setCompileEnv(String compileEnv) {
        this.compileEnv = compileEnv;
    }

    public String getCompileCmd() {
        return compileCmd;
    }

    public void setCompileCmd(String compileCmd) {
        this.compileCmd = compileCmd;
    }

    public String getWorkDir() {
        return workDir;
    }

    public void setWorkDir(String workDir) {
        this.workDir = workDir;
    }

    public String getStartCmd() {
        return startCmd;
    }

    public void setStartCmd(String startCmd) {
        this.startCmd = startCmd;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String checkLegality() {
        String error = null;
        if (StringUtils.isBlank(baseImageName)) {
            error = "base image is null";
        } else if (StringUtils.isBlank(codeStoragePath)) {
            error = "code storage path is null";
        } else if (StringUtils.isBlank(startCmd)) {
            error = "start command is null";
        }
        return error;
    }
}
