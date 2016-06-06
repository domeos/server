package org.domeos.framework.api.model.project;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.model.project.related.*;
import org.domeos.framework.engine.model.RowModelBase;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class Project extends RowModelBase {
    private CodeConfiguration codeInfo;
    private AutoBuild autoBuildInfo;
    private boolean userDefineDockerfile = false;
    private DockerfileContent dockerfileConfig;
    private UserDefinedDockerfile dockerfileInfo;
    private Map<String, String> confFiles;
    private List<EnvSetting> envConfDefault;
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

    public List<EnvSetting> getEnvConfDefault() {
        return envConfDefault;
    }

    public void setEnvConfDefault(List<EnvSetting> envConfDefault) {
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

    public String checkLegality() {
        if (StringUtils.isBlank(getName())) {
            return "project name must be set";
        } else if (!isRegularDockerName(getName())) {
            return "project name must match [a-z0-9]+([._-][a-z0-9]+)*";
        } else if (codeInfo != null && !StringUtils.isBlank(codeInfo.checkLegality())) {
            return codeInfo.checkLegality();
        } else if (codeInfo == null && autoBuildInfo != null) {
            if ((autoBuildInfo.getBranches() != null && autoBuildInfo.getBranches().size() > 0)
                    || autoBuildInfo.getTag() > 0) {
                return "code info is null, cannot set auto build info";
            }
        } else if (dockerfileConfig != null && !StringUtils.isBlank(dockerfileConfig.checkLegality())) {
            return dockerfileConfig.checkLegality();
        } else if (exclusiveBuild != null && !StringUtils.isBlank(exclusiveBuild.checkLegality())) {
            return exclusiveBuild.checkLegality();
        }
        return null;
    }

    public static boolean isRegularDockerName(String name) {
        try {
            Pattern pattern = Pattern.compile("[a-z0-9]+([._-][a-z0-9]+)*");
            String parts[] = name.split("/");
            for (String part : parts) {
                Matcher matcher = pattern.matcher(part);
                if (!matcher.matches()) {
                    return false;
                }
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
