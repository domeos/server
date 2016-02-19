package org.domeos.api.service.ci.impl;

import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.domeos.api.mapper.ci.*;
import org.domeos.api.mapper.cluster.KubeCiClusterMapper;
import org.domeos.api.mapper.project.*;
import org.domeos.api.mapper.resource.ResourceHistoryMapper;
import org.domeos.api.model.ci.*;
import org.domeos.api.model.console.project.Project;
import org.domeos.api.model.git.Subversion;
import org.domeos.api.model.global.Registry;
import org.domeos.api.model.global.Server;
import org.domeos.api.model.project.*;
import org.domeos.api.model.resource.ResourceHistory;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.service.ci.BuildService;
import org.domeos.api.service.global.GlobalService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.definitions.v1.EnvVar;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.exception.WebHooksException;
import org.domeos.global.GlobalConstant;
import org.domeos.job.JobWrapper;
import org.domeos.shiro.AuthUtil;
import org.domeos.util.RSAKeyPairGenerator;
import org.domeos.util.code.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.domeos.global.Md5.getMd5Str;

/**
 * Created by feiliu206363 on 2015/7/29.
 */
@Service("buildService")
public class BuildServiceImpl implements BuildService {

    private static Logger logger = org.apache.log4j.Logger.getLogger(BuildServiceImpl.class);

    @Autowired
    CodeConfigMapper codeConfigMapper;
    @Autowired
    BuildMapper buildMapper;
    @Autowired
    DockerfileMapper dockerfileMapper;
    @Autowired
    DockerInfoMapper dockerInfoMapper;
    @Autowired
    ConfigFileMapper configFileMapper;
    @Autowired
    UploadFileMapper uploadFileMapper;
    @Autowired
    ProjectBasicMapper projectBasicMapper;
    @Autowired
    SubversionMapper subversionMapper;
    @Autowired
    UploadFileContentMapper uploadFileContentMapper;
    @Autowired
    RSAKeyPairMapper rsaKeyPairMapper;
    @Autowired
    BuildLogInfoMapper buildLogInfoMapper;
    @Autowired
    DockerfileContentMapper dockerfileContentMapper;
    @Autowired
    GlobalService globalService;
    @Autowired
    ResourceHistoryMapper resourceHistoryMapper;
    @Autowired
    BuildSecretMapper buildSecretMapper;
    @Autowired
    KubeBuildMapper kubeBuildMapper;
    @Autowired
    AutoBuildMapper autoBuildMapper;
    @Autowired
    KubeCiClusterMapper kubeCiClusterMapper;

    @Override
    public HttpResponseTemp<?> dockerfilePreview(Project project, long userId) {
        if (project == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "input project info is null");
        }

        if (!AuthUtil.verify(userId, project.getId(), ResourceType.PROJECT, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if (project.getDockerfileConfig() != null && project.getDockerfileInfo() == null) {
            if (!StringUtils.isBlank(project.getDockerfileConfig().checkLegality())) {
                return ResultStat.PARAM_ERROR.wrap(null, project.getDockerfileConfig().checkLegality());
            }
            Project.DockerfileConfig config = project.getDockerfileConfig();
            if (config == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "docker file config is null");
            }
            Dockerfile dockerfile = new Dockerfile(0, config.getBaseImageName(), config.getBaseImageTag(),
                    config.getBaseImageRegistry(), config.getInstallCmd(), config.getCodeStoragePath(),
                    config.getWorkDir(), config.getCompileEnv(), config.getCompileCmd(), config.getStartCmd(),
                    config.getUser());
            List<ConfigFile> configFiles = new LinkedList<>();
            if (project.getConfFiles() != null) {
                for (Map.Entry<String, String> entry : project.getConfFiles().entrySet()) {
                    configFiles.add(new ConfigFile(0, entry.getKey(), entry.getValue()));
                }
            }
            List<UploadFile> uploadFiles = new LinkedList<>();
            if (project.getUploadFile() != null) {
                for (Map.Entry<String, String> entry : project.getUploadFile().entrySet()) {
                    UploadFileContent content = uploadFileContentMapper.getUploadFileContentByMd5(entry.getValue());
                    if (content == null) {
                        return ResultStat.PARAM_ERROR.wrap(null, "upload file not exist");
                    }
                    uploadFiles.add(new UploadFile(0, entry.getKey(), entry.getValue()));
                }
            }

            try {
                String dockerfileStr = generateDockerfile(dockerfile, configFiles, uploadFiles);
                return ResultStat.OK.wrap(dockerfileStr);
            } catch (Exception e) {
                return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
            }
        } else if (project.getDockerfileConfig() == null && project.getDockerfileInfo() != null) {
            Project.DockerfileInfo dockerfileInfo = project.getDockerfileInfo();
            Project.CodeInfo codeInfo = project.getCodeInfo();
            if (codeInfo == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "code info is null");
            }
            CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeInfo.getCodeManager()), codeInfo.getUserInfo());
            if (codeApiInterface == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "get code api error");
            }
            String dockerfilePath = dockerfileInfo.getDockerfilePath();
            if (!StringUtils.isBlank(dockerfilePath) && dockerfilePath.startsWith("/")) {
                dockerfilePath = dockerfilePath.substring(1);
            }
            byte[] dockerfileStr = codeApiInterface.getDockerfile(codeInfo.getCodeId(), dockerfileInfo.getBranch(), dockerfilePath);
            if (dockerfileStr == null) {
                return ResultStat.DOCKERFILE_NOT_EXIST.wrap(null);
            }
            return ResultStat.OK.wrap(new String(dockerfileStr));
        } else {
            return ResultStat.PARAM_ERROR.wrap(null, "docker config and docker info both exist");
        }
    }

    @Override
    public String dockerFile(int projectId, int buildId, String secret) {
        String docker = null;
        BuildSecret buildSecret = buildSecretMapper.getBuildSecretByBuildId(buildId);
        if (buildSecret == null || !buildSecret.getSecret().equals(secret)) {
            return "Forbidden";
        }
        try {
            Dockerfile dockerfile = dockerfileMapper.getDockerfileByProjectBasicId(projectId);
            List<ConfigFile> configFiles = configFileMapper.getALLConfigByProjectId(projectId);
            List<UploadFile> uploadFiles = uploadFileMapper.getALLUploadFilesByProjectId(projectId);
            docker = generateDockerfile(dockerfile, configFiles, uploadFiles);
        } catch (Exception e) {
            logger.warn(e.getMessage());
        }
        return docker;
    }

    @Override
    public HttpResponseTemp<?> dockerfileUsed(int projectId, int buildId, long userId) {
        if (!AuthUtil.verify(userId, projectId, ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        try {
            DockerfileContent content = dockerfileContentMapper.getDockerfileContentByBuildId(buildId);
            if (content.getProjectId() != projectId) {
                return ResultStat.BUILD_INFO_NOT_MATCH.wrap(null);
            }
            String dockerfile = content.getContent();
            return ResultStat.OK.wrap(dockerfile);
        } catch (Exception e) {
            return ResultStat.BUILD_INFO_NOT_EXIST.wrap(null);
        }
    }

    @Override
    public HttpResponseTemp<?> startAutoBuild(String webHookStr) {
        if (!StringUtils.isBlank(webHookStr)) {
            try {
                WebHook webHook = new GitWebHook(webHookStr);

                List<ProjectBasic> projectBasics = projectBasicMapper.listProjectBasic();
                if (projectBasics == null) {
                    return ResultStat.PARAM_ERROR.wrap(null, "no project info");
                }
                for (ProjectBasic projectBasic : projectBasics) {
                    CodeConfig codeConfig = codeConfigMapper.getCodeConfigsByProjectId(projectBasic.getId());
                    if (codeConfig == null) {
                        continue;
                    }
                    if (webHook.getProject_id() != codeConfig.getCodeId()) {
                        continue;
                    }
                    List<AutoBuild> autoBuilds = autoBuildMapper.getAutoBuildByProjectId(projectBasic.getId());
                    if (autoBuilds == null) {
                        continue;
                    }
                    String imageTag = null;
                    for (AutoBuild autoBuild : autoBuilds) {
                        if (autoBuild.getTag() == 1 && !StringUtils.isBlank(webHook.getTag())) {
                            imageTag = webHook.getTag();
                        }
                        if (!StringUtils.isBlank(autoBuild.getBranch()) && autoBuild.getBranch().equals(webHook.getBranch())) {
                            imageTag = webHook.getBranch() + "_" + webHook.getAfter().substring(0, 7);
                        }
                    }
                    if (StringUtils.isBlank(imageTag)) {
                        continue;
                    }
                    Registry registry = globalService.getRegistry();
                    BuildInfo buildInfo = new BuildInfo(projectBasic.getId(), webHook.getBranch(), webHook.getTag(),
                            projectBasic.getName(), imageTag, 0, registry.registryDomain(), webHook.getRepositoryName(),
                            webHook.getAfter(), webHook.getCommitMessage(), 0, webHook.getUser_name(), webHook.getUser_email(),
                            webHook.getCommitTimestamp(), webHook.getCommitAuthorName(), webHook.getCommitAuthorEmail(),
                            BuildInfo.StatusType.Preparing, null, 0, null, 1, System.currentTimeMillis(), 0);

                    CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()), codeConfig.getUserInfo());
                    if (codeApiInterface == null) {
                        return ResultStat.PARAM_ERROR.wrap(null, "get code api error");
                    }
                    HttpResponseTemp<?> result = sendBuildJob(buildInfo, codeApiInterface, codeConfig, projectBasic);
                    if (result != null) {
                        return result;
                    }
                }
            } catch (WebHooksException e) {
                logger.warn("webhook error, message is " + e.getMessage());
                return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
            }
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> startBuild(BuildInfo buildInfo, long userId, String userName) {
        if (buildInfo == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "build information is null");
        }

        if (!AuthUtil.verify(userId, buildInfo.getProjectId(), ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if (!StringUtils.isBlank(buildInfo.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, buildInfo.checkLegality());
        }

        CodeConfig codeConfig = codeConfigMapper.getCodeConfigsByProjectId(buildInfo.getProjectId());
        CodeApiInterface codeApiInterface = null;
        if (codeConfig != null) {
            // if code config is not null, get git commit info
            codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()), codeConfig.getUserInfo());
            if (codeApiInterface == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "get code api error");
            }
            // get commit info
            GitlabApiWrapper.CommitInfo commitInfo = null;
            if (!StringUtils.isBlank(buildInfo.getCodeBranch())) {
                commitInfo = codeApiInterface.getBranchCommitInfo(codeConfig.getCodeId(), buildInfo.getCodeBranch());
            } else if (!StringUtils.isBlank(buildInfo.getCodeTag())) {
                commitInfo = codeApiInterface.getTagCommitInfo(codeConfig.getCodeId(), buildInfo.getCodeTag());
            }
            if (commitInfo == null) {
                return ResultStat.GITLAB_COMMIT_NOT_FOUND.wrap(null, "cannot found commit info in gitlab, url: " + codeConfig.getCodeSshUrl());
            }
            setCommitInfo(buildInfo, commitInfo);
        }

        buildInfo.setCreateTime(System.currentTimeMillis());
        buildInfo.setAutoBuild(0);
        buildInfo.setStatus(BuildInfo.StatusType.Preparing);
        buildInfo.setUserId(userId);
        buildInfo.setUserName(userName);

        ProjectBasic projectBasic = projectBasicMapper.getProjectBasicById(buildInfo.getProjectId());
        if (projectBasic == null) {
            return ResultStat.PROJECT_NOT_EXIST.wrap(null);
        }

        Registry registry = globalService.getRegistry();
        if (registry == null) {
            return ResultStat.REGISTRY_NOT_EXIST.wrap(null);
        }
        buildInfo.setImageName(projectBasic.getName());
        buildInfo.setRegistry(registry.registryDomain());
        if (StringUtils.isBlank(buildInfo.getImageTag())) {
            if (!StringUtils.isBlank(buildInfo.getCodeBranch())) {
                if (!StringUtils.isBlank(buildInfo.getCmtId())) {
                    buildInfo.setImageTag(buildInfo.getCodeBranch() + "_" + buildInfo.getCmtId().substring(0, 7));
                } else {
                    buildInfo.setImageTag(buildInfo.getCodeBranch() + "_" + RandomStringUtils.randomAlphanumeric(7));
                }
            } else if (!StringUtils.isBlank(buildInfo.getCodeTag())) {
                buildInfo.setImageTag(buildInfo.getCodeTag());
            }
        }

        HttpResponseTemp<?> result = sendBuildJob(buildInfo, codeApiInterface, codeConfig, projectBasic);
        if (result != null) {
            return result;
        }

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.PROJECT.getResourceName(), buildInfo.getProjectId(),
                OperationType.BUILD.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return ResultStat.OK.wrap(buildInfo);
    }

    @Override
    public HttpResponseTemp<?> setBuildStatus(BuildStatus buildStatus, String secret) {
        if (buildStatus != null) {
            BuildSecret buildSecret = buildSecretMapper.getBuildSecretByBuildId(buildStatus.getBuildId());
            if (buildSecret == null || !buildSecret.getSecret().equals(secret)) {
                return ResultStat.FORBIDDEN.wrap(null);
            }
            BuildInfo buildInfo = buildMapper.getBuildInfoById(buildStatus.getBuildId());
            Registry registry = globalService.getRegistry();
            if (registry != null && BuildInfo.StatusType.Success.name().equals(buildStatus.getStatus())) {
                BaseImage baseImage = new BaseImage(buildInfo.getImageName(), buildInfo.getImageTag(), registry.fullRegistry(), null);
                double imageSize = PrivateRegistry.getImageSize(baseImage);
                if (imageSize > 0) {
                    buildStatus.setImageSize(imageSize);
                }
            }
            buildStatus.setFinishTime(System.currentTimeMillis());
            buildMapper.updateBuildStatusById(buildStatus);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public String downloadRsa(int projectId, int buildId, String secret) {
        BuildSecret buildSecret = buildSecretMapper.getBuildSecretByBuildId(buildId);
        if (buildSecret == null || !buildSecret.getSecret().equals(secret)) {
            return "Forbidden";
        }

        RSAKeyPair rsaKeyPair = rsaKeyPairMapper.getRSAKeyPairByProjectId(projectId);
        if (rsaKeyPair != null) {
            return rsaKeyPair.getPrivateKey();
        }
        return null;
    }

    @Override
    public HttpResponseTemp<?> uploadLogfile(MultipartFile body, int projectId, int buildId, String secret) {
        if (body == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "upload build log error");
        }

        String md5 = saveFile(body);
        if (StringUtils.isBlank(md5)) {
            logger.warn("save build log error, project id " + projectId + ", build id " + buildId + ", secret " + secret);
            return ResultStat.SERVER_INTERNAL_ERROR.wrap(null, "save build log file error");
        }

        BuildLogInfo buildLogInfo = new BuildLogInfo(projectId, buildId, md5);
        BuildLogInfo oldInfo = buildLogInfoMapper.getBuildLogInfoByBuildId(buildId);
        if (oldInfo != null) {
            buildLogInfo.setId(oldInfo.getId());
            buildLogInfoMapper.updateBuildStatusById(buildLogInfo);
        } else {
            buildLogInfoMapper.addBuildLogInfo(buildLogInfo);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> downloadLogFile(int projectId, int buildId, long userId) {
        if (!AuthUtil.verify(userId, projectId, ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        BuildLogInfo buildLogInfo = buildLogInfoMapper.getBuildLogInfoByBuildId(buildId);
        if (buildLogInfo == null) {
            return ResultStat.OK.wrap(null);
        }
        if (buildLogInfo.getProjectId() != projectId) {
            return ResultStat.BUILD_INFO_NOT_MATCH.wrap(null);
        }
        UploadFileContent content = uploadFileContentMapper.getUploadFileContentByMd5(buildLogInfo.getMd5());
        if (content == null) {
            return ResultStat.OK.wrap(null);
        }
        byte[] file = content.getContent();
        return ResultStat.OK.wrap(new String(file));
    }

    @Override
    public HttpResponseTemp<?> listBuildInfo(int projectId, long userId) {
        if (!AuthUtil.verify(userId, projectId, ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        try {
            List<BuildInfo> buildInfos = UpdateBuildStatusInfo.updateStatusInfos(buildMapper.getBuildInfoByProjectId(projectId));
            return ResultStat.OK.wrap(buildInfos);
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }
    }

    public String generateDockerfile(Dockerfile info, List<ConfigFile> configFiles, List<UploadFile> uploadFiles) throws Exception {
        StringBuilder dockerfile = new StringBuilder();
        if (info != null) {
            String dockerFrom = info.dockerFrom();
            if (dockerFrom != null) {
                if (dockerFrom.startsWith(GlobalConstant.HTTP_PREFIX)) {
                    dockerFrom = dockerFrom.substring(7);
                }
                if (dockerFrom.startsWith(GlobalConstant.HTTPS_PREFIX)) {
                    dockerFrom = dockerFrom.substring(8);
                }
            }
            dockerfile.append("From ").append(dockerFrom).append("\n");
            String env = checkEnv(info.getDockerEnv());
            if (!StringUtils.isBlank(env)) {
                dockerfile.append(env).append("\n");
            }
            String command1 = checkCommand(info.getInstallCmd());
            if (!StringUtils.isBlank(command1)) {
                dockerfile.append("RUN ").append(command1).append("\n");
            }
            dockerfile.append("COPY . ").append(info.getCodePath()).append("\n");
            if (configFiles != null && configFiles.size() > 0) {
                dockerfile.append("COPY dockerize /usr/bin/dockerize\n");
            }
            dockerfile.append("WORKDIR ").append(info.getCodePath()).append("\n");
            String command2 = checkCommand(info.getCompileCmd());
            if (!StringUtils.isBlank(command2)) {
                dockerfile.append("RUN ").append(command2).append("\n");
            }
            if (!StringUtils.isBlank(info.getWorkDir())) {
                dockerfile.append("WORKDIR ").append(info.getWorkDir()).append("\n");
            }
            if (uploadFiles != null && uploadFiles.size() > 0) {
                Server server = globalService.getServer();
                if (server == null) {
                    throw new Exception("server info should be set");
                }
                for (UploadFile uploadFile : uploadFiles) {
                    dockerfile.append("RUN curl --connect-timeout 10 -o ").append(server.serverInfo())
                            .append("/api/project/download/file?md5=")
                            .append(uploadFile.getMd5()).append(" ").append(uploadFile.getPath()).append("\n");
                }
            }
            String cmd = info.getDockerCmd();
            if (!StringUtils.isBlank(cmd)) {
                dockerfile.append("CMD");
                if (configFiles != null && configFiles.size() > 0) {
                    dockerfile.append(" dockerize");
                    for (ConfigFile configFile : configFiles) {
                        dockerfile.append(" -template ").append(configFile.getConfFile()).append(":").append(configFile.getTargetFile());
                    }
                }
                dockerfile.append(" ").append(cmd).append("\n");
            }
        }
        return dockerfile.toString();
    }

    private String checkEnv(String envs) {
        StringBuilder result = new StringBuilder();
        if (!StringUtils.isBlank(envs)) {
            String[] pair = envs.split(",");
            for (String env : pair) {
                String[] info = env.split("=");
                result.append("ENV ").append(info[0]).append(" ").append(info[1]);
            }
        }
        return result.toString();
    }

    private String checkCommand(String command) {
        StringBuilder result = new StringBuilder();
        if (!StringUtils.isBlank(command)) {
            if (command.startsWith("RUN ")) {
                result.append(command);
            } else {
                String[] ss = command.split("\n");
                for (String tmp : ss) {
                    if (result.length() > 0) {
                        result.append(" && ");
                    }
                    result.append(tmp);
                }
            }
        }
        return result.toString();
    }

    private String saveFile(MultipartFile file) {
        String md5 = null;
        try {
            byte[] bytes = new byte[(int) file.getSize()];
            file.getInputStream().read(bytes);
            md5 = getMd5Str(bytes);
            uploadFileContentMapper.addUploadFileContent(new UploadFileContent(file.getOriginalFilename(), md5, bytes));
            return md5;
        } catch (IOException e) {
            logger.error("save upload build log file error, message is " + e.getMessage());
        } catch (NoSuchAlgorithmException e) {
            logger.error("calculate file Md5 error, message is " + e.getMessage());
        } catch (DuplicateKeyException e) {
            return md5;
        }
        return null;
    }

    private void setCommitInfo(BuildInfo buildInfo, GitlabApiWrapper.CommitInfo commitInfo) {
        if (buildInfo != null && commitInfo != null) {
            buildInfo.setCmtName(commitInfo.getName());
            buildInfo.setCmtId(commitInfo.getId());
            buildInfo.setCmtAuthoredDate(commitInfo.getAuthoredDate());
            buildInfo.setCmtAuthorName(commitInfo.getAuthorName());
            buildInfo.setCmtAuthorEmail(commitInfo.getAuthorEmail());
            buildInfo.setCmtCommittedDate(commitInfo.getCommittedDate());
            buildInfo.setCmtCommitterName(commitInfo.getCommitterName());
            buildInfo.setCmtCommitterEmail(commitInfo.getCommitterEmail());
            buildInfo.setCmtMessage(commitInfo.getMessage());
        }
    }


    private HttpResponseTemp<Object> sendBuildJob(BuildInfo buildInfo, CodeApiInterface codeApiInterface, CodeConfig codeConfig, ProjectBasic projectBasic) {
        BuildImage buildImage = globalService.getBuildImage();
        if (buildImage == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "build image not set!");
        }
        Server server = globalService.getServer();
        if (server == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "server not set!");
        }
        String privateKey = null;
        String codeUrl = null;
        String codeType = null;
        if (codeApiInterface != null && codeConfig != null) {
            codeType = codeConfig.getCodeManager();
            codeUrl = codeConfig.getCodeSshUrl();
            if(CodeType.gitlab.name().equalsIgnoreCase(codeType)) {
                RSAKeyPair rsaKeyPair = rsaKeyPairMapper.getRSAKeyPairByProjectId(buildInfo.getProjectId());
                if (rsaKeyPair == null || !codeApiInterface.checkDeployKey(codeConfig.getCodeId(), rsaKeyPair.getKeyId())) {
                    RSAKeyPair keyPair = codeApiInterface.getDeployKey(codeConfig.getCodeId());
                    if(keyPair != null) {
                        keyPair.setId(0);
                    }
                    else {
                        rsaKeyPairMapper.deleteRSAKeyPairByProjectId(buildInfo.getProjectId());
                        // add deploy key to gitlab
                        keyPair = RSAKeyPairGenerator.generateKeyPair();
                        if (keyPair == null) {
                            return ResultStat.SERVER_INTERNAL_ERROR.wrap(null, "generate rsa key pair error");
                        }
                        int keyId = codeApiInterface.setDeployKey(codeConfig.getCodeId(), "DomeOS", keyPair.getPublicKey());
                        if (keyId > 0) {
                            keyPair.setKeyId(keyId);
                        } else {
                            return ResultStat.PARAM_ERROR.wrap(null, "put deploy key to git error, please check token");
                        }
                        keyPair.setProjectId(buildInfo.getProjectId());
                        rsaKeyPairMapper.addRSAKeyPair(keyPair);
                        rsaKeyPair = keyPair;
                        privateKey = rsaKeyPair.getPrivateKey().replaceAll("\n", "\\\\n");
                    }
                } else {
                    privateKey = rsaKeyPair.getPrivateKey().replaceAll("\n", "\\\\n");
                }
            } else if(CodeType.subversion.name().equalsIgnoreCase(codeType)) {
                Subversion svnInfo = subversionMapper.getSubversionInfoById(codeConfig.getCodeId());
                if(svnInfo == null) {
                    return ResultStat.SERVER_INTERNAL_ERROR.wrap(null, "can not get subversion info");
                }
                privateKey = svnInfo.getPassword();
            }
        }

        // save dockerfile for build
        String dockerfileContent;
        int hasDockerfile;
        String buildPath = null;
        String dockerfilePath = null;
        if (projectBasic.getDockerfile() > 0 && codeApiInterface != null && codeConfig != null) {
            DockerInfo dockerInfo = dockerInfoMapper.getDockerInfoByProjectId(buildInfo.getProjectId());
            String ref = null;
            if (!StringUtils.isBlank(buildInfo.getCodeTag())) {
                ref = buildInfo.getCodeTag();
            } else if (!StringUtils.isBlank(buildInfo.getCodeBranch())) {
                ref = buildInfo.getCodeBranch();
            }
            String path = dockerInfo.getDockerfilePath();
            if (path.startsWith("/")) {
                dockerfilePath = path;
                path = path.substring(1);
            } else {
                dockerfilePath = "/" + path;
            }
            if (dockerfilePath.endsWith("/Dockerfile")) {
                dockerfilePath = dockerfilePath.substring(0, dockerfilePath.length() - 11);
            }
            buildPath = dockerInfo.getBuildPath();
            if (!buildPath.startsWith("/")) {
                buildPath = "/" + buildPath;
            }
            if(CodeType.subversion.name().equalsIgnoreCase(codeType)) {
                if (ref != null) {
                    ref = buildInfo.getCodeBranch() == null ? "/tags/" + ref : "/branches/" + ref;
                    buildPath = ref + buildPath;
                    dockerfilePath = ref + dockerfilePath;
                }
                buildPath = "/" + projectBasic.getName() + buildPath;
                dockerfilePath = "/" + projectBasic.getName() + dockerfilePath;
            }
            byte[] content = codeApiInterface.getDockerfile(codeConfig.getCodeId(), ref, path);
            if (content == null) {
                return ResultStat.PARAM_ERROR.wrap(null, "could not find dockerfile in " + dockerInfo.getDockerfilePath());
            }
            dockerfileContent = new String(content);
            hasDockerfile = 1;
        } else {
            Dockerfile dockerfile = dockerfileMapper.getDockerfileByProjectBasicId(buildInfo.getProjectId());
            List<ConfigFile> configFiles = configFileMapper.getALLConfigByProjectId(buildInfo.getProjectId());
            List<UploadFile> uploadFiles = uploadFileMapper.getALLUploadFilesByProjectId(buildInfo.getProjectId());
            try {
                dockerfileContent = generateDockerfile(dockerfile, configFiles, uploadFiles);
            } catch (Exception e) {
                return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
            }
            hasDockerfile = 0;
        }
        if (StringUtils.isBlank(dockerfileContent)) {
            return ResultStat.PARAM_ERROR.wrap(null, "generate dockerfile error");
        }

        buildMapper.addBuildInfo(buildInfo);
        dockerfileContentMapper.addDockerfileContent(new DockerfileContent(buildInfo.getProjectId(), buildInfo.getId(), dockerfileContent));

        String secret = UUID.randomUUID().toString();
        buildSecretMapper.addBuildSecret(new BuildSecret(buildInfo.getId(), secret));

        // send job to kube
        JobWrapper jobWrapper;
        try {
            jobWrapper = new JobWrapper().init();
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }

        EnvVar[] envVars = generateEnvs(codeType, server.serverInfo(), buildInfo, privateKey, codeUrl, hasDockerfile,
                secret, buildPath, dockerfilePath);
        if (envVars == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "no env info for build kube job");
        }
        Job job = jobWrapper.sendJob(jobWrapper.generateJob(buildImage.getName(), envVars));
        kubeBuildMapper.addKubeBuild(new KubeBuild(buildInfo.getId(), job.getMetadata().getName(), KubeBuild.KubeBuildStatus.SEND.getStatus()));
        return null;
    }

    public EnvVar[] generateEnvs(String codeType, String server, BuildInfo buildInfo, String privateKey,
                                 String codeUrl, int hasDockerfile, String secret, String buildPath, String dockerfilePath) {
        return new EnvVar[]{
                new EnvVar().putName("SERVER").putValue(server),
                new EnvVar().putName("BUILD_ID").putValue(String.valueOf(buildInfo.getId())),
                new EnvVar().putName("IDRSA").putValue(privateKey),
                new EnvVar().putName("CODE_URL").putValue(codeUrl),
                new EnvVar().putName("PROJECT_ID").putValue(String.valueOf(buildInfo.getProjectId())),
                new EnvVar().putName("IMAGE_NAME").putValue(buildInfo.getImageName()),
                new EnvVar().putName("IMAGE_TAG").putValue(buildInfo.getImageTag()),
                new EnvVar().putName("COMMIT_ID").putValue(buildInfo.getCmtId()),
                new EnvVar().putName("REGISTRY_URL").putValue(buildInfo.getRegistry()),
                new EnvVar().putName("HAS_DOCKERFILE").putValue(String.valueOf(hasDockerfile)),
                new EnvVar().putName("SECRET").putValue(secret),
                new EnvVar().putName("BUILD_PATH").putValue(buildPath),
                new EnvVar().putName("DOCKERFILE_PATH").putValue(dockerfilePath),
                new EnvVar().putName("TYPE").putValue(codeType)
        };
    }
}
