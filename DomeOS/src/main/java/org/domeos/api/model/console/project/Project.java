package org.domeos.api.model.console.project;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.ci.CodeType;
import org.domeos.api.model.project.*;
import org.domeos.api.model.user.ResourceOwnerType;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 */
public final class Project {
    int id;
    String projectName;
    ResourceOwnerType type;
    String description;
    CodeInfo codeInfo;
    AutoBuildInfo autoBuildInfo;
    int stateless = 1;
    int authority; // 0 for private and 1 for public
    DockerfileConfig dockerfileConfig;
    DockerfileInfo dockerfileInfo;
    Map<String, String> confFiles; // conf files, pairs of template file name real file name with absolute path
    List<EnvSetting> envConfDefault; // ENVs need to be set and their default envValue, used to modify project conf
    Map<String, String> uploadFile;
    long createTime;
    long lastModify;

    public Project() {
    }

    public Project(ProjectBasic projectBasic, CodeConfig codeConfig, List<AutoBuild> autoBuilds, Dockerfile dockerfile,
                   DockerInfo dockerInfo, List<ConfigFile> configFiles, List<EnvConfig> envConfigs, List<UploadFile> uploadFiles) {
        this.id = projectBasic.getId();
        this.projectName = projectBasic.getName();
        this.type = projectBasic.getType();
        this.description = projectBasic.getDescription();
        this.stateless = projectBasic.getStateless();
        this.createTime = projectBasic.getCreateTime();
        this.lastModify = projectBasic.getLastModify();
        this.authority = projectBasic.getAuthority();

        if (codeConfig != null) {
            this.codeInfo = new CodeInfo(codeConfig.getId(), codeConfig.getCodeManager(), codeConfig.getCodeSource(), codeConfig.getCodeSshUrl(), codeConfig.getCodeHttpUrl(), codeConfig.getCodeId(), codeConfig.getUserInfo());
        }

        if (autoBuilds != null && autoBuilds.size() > 0) {
            List<String> branches = new LinkedList<>();
            int tag = 0;
            for (AutoBuild autoBuild : autoBuilds) {
                if (autoBuild.getTag() > 0) {
                    tag = 1;
                }
                if (!StringUtils.isBlank(autoBuild.getBranch())) {
                    branches.add(autoBuild.getBranch());
                }
            }
            this.autoBuildInfo = new AutoBuildInfo(tag, branches);
        }

        if (dockerfile != null) {
            this.dockerfileConfig = new DockerfileConfig(dockerfile.getId(), dockerfile.getBaseImageName(), dockerfile.getBaseImageTag(),
                    dockerfile.getBaseImageRegistry(), dockerfile.getInstallCmd(), dockerfile.getCodePath(), dockerfile.getDockerEnv(),
                    dockerfile.getCompileCmd(), dockerfile.getWorkDir(), dockerfile.getDockerCmd(), dockerfile.getUser());
        }

        if (dockerInfo != null) {
            this.dockerfileInfo = new DockerfileInfo(dockerInfo.getId(), dockerInfo.getBuildPath(), null, dockerInfo.getDockerfilePath());
        }

        if (configFiles != null && configFiles.size() > 0) {
            this.confFiles = new HashMap<>();
            for (ConfigFile configFile : configFiles) {
                this.confFiles.put(configFile.getConfFile(), configFile.getTargetFile());
            }
        }

        if (envConfigs != null && envConfigs.size() > 0) {
            this.envConfDefault = new LinkedList<>();
            for (EnvConfig envConfig : envConfigs) {
                this.envConfDefault.add(new EnvSetting(envConfig.getId(), envConfig.getEnvKey(), envConfig.getEnvValue(), envConfig.getDescription()));
            }
        }

        if (uploadFiles != null && uploadFiles.size() > 0) {
            this.uploadFile = new HashMap<>();
            for (UploadFile uploadFile : uploadFiles) {
                this.uploadFile.put(uploadFile.getPath(), uploadFile.getMd5());
            }
        }
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public ResourceOwnerType getType() {
        return type;
    }

    public void setType(ResourceOwnerType type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CodeInfo getCodeInfo() {
        return codeInfo;
    }

    public void setCodeInfo(CodeInfo codeInfo) {
        this.codeInfo = codeInfo;
    }

    public AutoBuildInfo getAutoBuildInfo() {
        return autoBuildInfo;
    }

    public void setAutoBuildInfo(AutoBuildInfo autoBuildInfo) {
        this.autoBuildInfo = autoBuildInfo;
    }

    public int getStateless() {
        return stateless;
    }

    public void setStateless(int stateless) {
        this.stateless = stateless;
    }

    public int getAuthority() {
        return authority;
    }

    public void setAuthority(int authority) {
        this.authority = authority;
    }

    public DockerfileConfig getDockerfileConfig() {
        return dockerfileConfig;
    }

    public void setDockerfileConfig(DockerfileConfig dockerfileConfig) {
        this.dockerfileConfig = dockerfileConfig;
    }

    public DockerfileInfo getDockerfileInfo() {
        return dockerfileInfo;
    }

    public void setDockerfileInfo(DockerfileInfo dockerfileInfo) {
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

    public Map<String, String> getUploadFile() {
        return uploadFile;
    }

    public void setUploadFile(Map<String, String> uploadFile) {
        this.uploadFile = uploadFile;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getLastModify() {
        return lastModify;
    }

    public void setLastModify(long lastModify) {
        this.lastModify = lastModify;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(projectName)) {
            return "project name is blank";
        } else if (!isRegularDockerName(projectName)) {
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
        } else if (type == null) {
            return "resource owner type must be set";
        }
        return null;
    }

    public static class DockerfileConfig {
        int id;
        String baseImageName;
        String baseImageTag;
        String baseImageRegistry;
        String installCmd;
        String codeStoragePath;
        String compileEnv;
        String compileCmd;
        String workDir;
        String startCmd;
        String user;

        public DockerfileConfig() {
        }

        public DockerfileConfig(int id, String baseImageName, String baseImageTag, String baseImageRegistry, String installCmd, String codeStoragePath, String compileEnv, String compileCmd, String workDir, String startCmd, String user) {
            this.id = id;
            this.baseImageName = baseImageName;
            this.baseImageTag = baseImageTag;
            this.baseImageRegistry = baseImageRegistry;
            this.installCmd = installCmd;
            this.codeStoragePath = codeStoragePath;
            this.compileEnv = compileEnv;
            this.compileCmd = compileCmd;
            this.workDir = workDir;
            this.startCmd = startCmd;
            this.user = user;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
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

    public static class DockerfileInfo {
        int id;
        String buildPath;
        String branch;
        String dockerfilePath;

        public DockerfileInfo() {
        }

        public DockerfileInfo(int id, String buildPath, String branch, String dockerfilePath) {
            this.id = id;
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

        public String getBuildPath() {
            return buildPath;
        }

        public String getBranch() {
            return branch;
        }

        public void setBranch(String branch) {
            this.branch = branch;
        }

        public void setBuildPath(String buildPath) {
            this.buildPath = buildPath;
        }

        public String getDockerfilePath() {
            return dockerfilePath;
        }

        public void setDockerfilePath(String dockerfilePath) {
            this.dockerfilePath = dockerfilePath;
        }
    }

    public static class CodeInfo {
        int id;
        String codeManager;
        String codeSource;
        String codeSshUrl;
        String codeHttpUrl;
        int codeId;
        int userInfo;

        public CodeInfo() {
        }

        public CodeInfo(int id, String codeManager, String codeSource, String codeSshUrl, String codeHttpUrl, int codeId, int userInfo) {
            this.id = id;
            this.codeManager = codeManager;
            this.codeSource = codeSource;
            this.codeSshUrl = codeSshUrl;
            this.codeHttpUrl = codeHttpUrl;
            this.codeId = codeId;
            this.userInfo = userInfo;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getCodeManager() {
            return codeManager;
        }

        public void setCodeManager(String codeManager) {
            this.codeManager = codeManager;
        }

        public String getCodeSource() {
            return codeSource;
        }

        public void setCodeSource(String codeSource) {
            this.codeSource = codeSource;
        }

        public String getCodeSshUrl() {
            return codeSshUrl;
        }

        public void setCodeSshUrl(String codeSshUrl) {
            this.codeSshUrl = codeSshUrl;
        }

        public String getCodeHttpUrl() {
            return codeHttpUrl;
        }

        public void setCodeHttpUrl(String codeHttpUrl) {
            this.codeHttpUrl = codeHttpUrl;
        }

        public int getCodeId() {
            return codeId;
        }

        public void setCodeId(int codeId) {
            this.codeId = codeId;
        }

        public int getUserInfo() {
            return userInfo;
        }

        public void setUserInfo(int userInfo) {
            this.userInfo = userInfo;
        }

        public String checkLegality() {
            if (StringUtils.isBlank(codeManager) || (!CodeType.isSupported(codeManager))) {
                return "code manager error";
            } else if (StringUtils.isBlank(codeSshUrl) || StringUtils.isBlank(codeHttpUrl)) {
                return "code url is null";
            } else if (userInfo <= 0) {
                return "user info error";
            } else {
                return null;
            }
        }
    }

    public static class AutoBuildInfo {
        int tag;
        List<String> branches;

        public AutoBuildInfo() {
        }

        public AutoBuildInfo(int tag, List<String> branches) {
            this.tag = tag;
            this.branches = branches;
        }

        public int getTag() {
            return tag;
        }

        public void setTag(int tag) {
            this.tag = tag;
        }

        public List<String> getBranches() {
            return branches;
        }

        public void setBranches(List<String> branches) {
            this.branches = branches;
        }
    }

    public static class EnvSetting {
        int id;
        String key;
        String value;
        String description;

        public EnvSetting() {
        }

        public EnvSetting(int id, String key, String value, String description) {
            this.id = id;
            this.key = key;
            this.value = value;
            this.description = description;
        }

        public int getId() {
            return id;
        }

        public void setId(int id) {
            this.id = id;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class ProjectComparator implements Comparator<Project> {
        @Override
        public int compare(Project t1, Project t2) {
            if (t2.getLastModify() - t1.getLastModify() > 0) {
                return 1;
            } else if (t2.getLastModify() - t1.getLastModify() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
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
