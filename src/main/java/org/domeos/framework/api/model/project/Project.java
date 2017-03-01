package org.domeos.framework.api.model.project;

import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.model.project.related.*;
import org.domeos.framework.engine.model.RowModelBase;
import org.domeos.util.StringUtils;

import java.util.List;
import java.util.Map;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class Project extends RowModelBase {
    private CodeConfiguration codeInfo;  // gitlab configuration
    private AutoBuild autoBuildInfo;
    private boolean userDefineDockerfile = false;
    private DockerfileContent dockerfileConfig;
    private CustomDockerfile customDockerfile;
    private UserDefinedDockerfile dockerfileInfo;
    private Map<String, String> confFiles;
    private List<EnvDraft> envConfDefault;
    private ExclusiveBuild exclusiveBuild;
    private int authority;

    public CodeConfiguration getCodeInfo() {
        return codeInfo;
    }

    public void setCodeInfo(CodeConfiguration codeInfo) {
        this.codeInfo = codeInfo;
    }

    public AutoBuild getAutoBuildInfo() {
        return autoBuildInfo;
    }

    public void setAutoBuildInfo(AutoBuild autoBuildInfo) {
        this.autoBuildInfo = autoBuildInfo;
    }

    public boolean isUserDefineDockerfile() {
        return userDefineDockerfile;
    }

    public void setUserDefineDockerfile(boolean userDefineDockerfile) {
        this.userDefineDockerfile = userDefineDockerfile;
    }

    public DockerfileContent getDockerfileConfig() {
        return dockerfileConfig;
    }

    public void setDockerfileConfig(DockerfileContent dockerfileConfig) {
        this.dockerfileConfig = dockerfileConfig;
    }

    public CustomDockerfile getCustomDockerfile() {
        return customDockerfile;
    }

    public void setCustomDockerfile(CustomDockerfile customDockerfile) {
        this.customDockerfile = customDockerfile;
    }

    public UserDefinedDockerfile getDockerfileInfo() {
        return dockerfileInfo;
    }

    public void setDockerfileInfo(UserDefinedDockerfile dockerfileInfo) {
        this.dockerfileInfo = dockerfileInfo;
    }

    public Map<String, String> getConfFiles() {
        return confFiles;
    }

    public void setConfFiles(Map<String, String> confFiles) {
        this.confFiles = confFiles;
    }

    public List<EnvDraft> getEnvConfDefault() {
        return envConfDefault;
    }

    public void setEnvConfDefault(List<EnvDraft> envConfDefault) {
        this.envConfDefault = envConfDefault;
    }

    public int getAuthority() {
        return authority;
    }

    public void setAuthority(int authority) {
        this.authority = authority;
    }

    public ExclusiveBuild getExclusiveBuild() {
        return exclusiveBuild;
    }

    public void setExclusiveBuild(ExclusiveBuild exclusiveBuild) {
        this.exclusiveBuild = exclusiveBuild;
    }

    //for old mysql info to use privilegeBuild
    public void setPrivilegeBuild(ExclusiveBuild privilegeBuild) {
        this.exclusiveBuild = privilegeBuild;
    }

    public String dockerfilePathInCodeManager() {
        if (dockerfileInfo == null) {
            return null;
        }
        String path = dockerfileInfo.getDockerfilePath();
        if (path.startsWith("/")) {
            return path.substring(1);
        }
        return path;
    }

    public String dockerfilePath(String ref) {
        if (dockerfileInfo == null || codeInfo == null) {
            return null;
        }
        String dockerfilePath = dockerfileInfo.getDockerfilePath();
        if (!dockerfilePath.startsWith("/")) {
            dockerfilePath = "/" + dockerfilePath;
        }

        if (CodeManager.subversion.equals(codeInfo.getCodeManager())) {
            dockerfilePath = "/" + getName() + ref + dockerfilePath;
        }
        return dockerfilePath;
    }

    public String buildPath(String ref) {
        String buildPath = dockerfileInfo.getBuildPath();
        if (!buildPath.startsWith("/")) {
            buildPath = "/" + buildPath;
        }

        if (CodeManager.subversion.equals(codeInfo.getCodeManager())) {
            buildPath = "/" + getName() + ref + buildPath;
        }
        return buildPath;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(getName())) {
            return "project name must be set";
        }
        if (!isRegularDockerName(getName())) {
            return "project name must match [a-z0-9]+([._-][a-z0-9]+)*";
        }
        if (codeInfo != null && !StringUtils.isBlank(codeInfo.checkLegality())) {
            return codeInfo.checkLegality();
        }
        if (dockerfileInfo != null && !StringUtils.isBlank(dockerfileInfo.checkLegality())) {
            return dockerfileInfo.checkLegality();
        }
        if (autoBuildInfo != null) {
            if (codeInfo == null) {
                return "code info is null, cannot set auto build info";
            }
            if ((autoBuildInfo.getBranches() == null || autoBuildInfo.getBranches().isEmpty())
                    && autoBuildInfo.getTag() <= 0) {
                return "Auto build info is null, cannot set auto build info";
            }
        }
        if (dockerfileConfig != null && !StringUtils.isBlank(dockerfileConfig.checkLegality())) {
            return dockerfileConfig.checkLegality();
        }
        if (customDockerfile != null) {
            if (!StringUtils.isBlank(customDockerfile.checkLegality())) {
                return customDockerfile.checkLegality();
            }
        }
        if (exclusiveBuild != null && !StringUtils.isBlank(exclusiveBuild.checkLegality())) {
            return exclusiveBuild.checkLegality();
        }
        if (envConfDefault != null && !envConfDefault.isEmpty()) {
            String error;
            for (EnvDraft draft : envConfDefault) {
                error = draft.checkLegality();
                if (!StringUtils.isBlank(error)) {
                    return error;
                }
            }
        }
        return null;
    }

    public static boolean isRegularDockerName(String name) {
        try {
            String parts[] = name.split("/");
            for (String part : parts) {
                if (!StringUtils.checkImageNamePattern(part)) {
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
