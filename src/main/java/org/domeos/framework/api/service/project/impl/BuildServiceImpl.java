package org.domeos.framework.api.service.project.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.JobNotFoundException;
import org.domeos.exception.K8sDriverException;
import org.domeos.exception.RSAKeypairException;
import org.domeos.exception.WebHooksException;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.consolemodel.image.ImageTagDetail;
import org.domeos.framework.api.consolemodel.project.BuildHistoryListInfo;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.CodeType;
import org.domeos.framework.api.model.ci.related.*;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.BuildImage;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.SubversionUser;
import org.domeos.framework.api.model.project.related.*;
import org.domeos.framework.api.service.image.impl.PrivateRegistry;
import org.domeos.framework.api.service.project.BuildService;
import org.domeos.framework.api.service.token.TokenService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.coderepo.CodeApiInterface;
import org.domeos.framework.engine.coderepo.GitWebHook;
import org.domeos.framework.engine.coderepo.ReflectFactory;
import org.domeos.framework.engine.coderepo.WebHook;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.k8s.JobWrapper;
import org.domeos.framework.engine.model.JobType;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.RSAKeyPairGenerator;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Created by feiliu206363 on 2015/7/29.
 */
@Service
public class BuildServiceImpl implements BuildService {

    private static Logger logger = LoggerFactory.getLogger(BuildServiceImpl.class);

    @Autowired
    ProjectBiz projectBiz;
    @Autowired
    GlobalBiz globalBiz;
    @Autowired
    OperationHistory operationHistory;
    @Autowired
    TokenService tokenService;
    @Autowired
    CheckAutoDeploy checkAutoDeploy;

    private void checkGetable(int id) {
        AuthUtil.verify(CurrentThreadInfo.getUserId(), id, ResourceType.PROJECT, OperationType.GET);
    }

    public void checkModifiable(int id) {
        AuthUtil.verify(CurrentThreadInfo.getUserId(), id, ResourceType.PROJECT, OperationType.MODIFY);
    }

    public void checkDeletable(int id) {
        AuthUtil.verify(CurrentThreadInfo.getUserId(), id, ResourceType.PROJECT, OperationType.DELETE);
    }

    @Override
    public HttpResponseTemp<?> dockerfilePreview(Project project) {
        if (project == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "input project info is null");
        }
        if (project.getId() > 0) {
            checkGetable(project.getId());
        }

        String error = project.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, error);
        }

        if (project.getDockerfileConfig() != null) {
            return ResultStat.OK.wrap(generateDockerfile(project.getDockerfileConfig(), project.getConfFiles()));
        }

        if (project.getExclusiveBuild() != null) {
            return ResultStat.OK.wrap(generateDockerfile(project.getExclusiveBuild(), project.getConfFiles()));
        }

        if (project.getCustomDockerfile() != null) {
            return ResultStat.OK.wrap(project.getCustomDockerfile().getDockerfile());
        }

        if (project.getDockerfileInfo() != null) {
            UserDefinedDockerfile dockerfileInfo = project.getDockerfileInfo();
            CodeConfiguration codeInfo = project.getCodeInfo();
            CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeInfo.getCodeManager()),
                    codeInfo.getCodeManagerUserId());
            if (codeApiInterface == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error");
            }
            String dockerfilePath = dockerfileInfo.getDockerfilePath();
            if (!StringUtils.isBlank(dockerfilePath) && dockerfilePath.startsWith("/")) {
                dockerfilePath = dockerfilePath.substring(1);
            }
            CommitInformation branchOrTagInfo = null;
            if (dockerfileInfo.getTag() != null) {
                branchOrTagInfo = codeApiInterface.getCommitInfo(codeInfo.getCodeId(), dockerfileInfo.getTag());
            } else if (dockerfileInfo.getBranch() != null) {
                branchOrTagInfo = codeApiInterface.getCommitInfo(codeInfo.getCodeId(), dockerfileInfo.getBranch());
            } else {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no branch or tag information");
            }
            byte[] dockerfileStr = null;
            if (branchOrTagInfo != null) {
                dockerfileStr = codeApiInterface.getDockerfile(codeInfo.getCodeId(), branchOrTagInfo.getId(), dockerfilePath);
            }
            if (dockerfileStr == null) {
                throw ApiException.wrapResultStat(ResultStat.DOCKERFILE_NOT_EXIST);
            }
            return ResultStat.OK.wrap(new String(dockerfileStr));
        }

        throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "docker config and docker info both exist");
    }

    @Override
    public String dockerFile(int projectId, int buildId, String secret) {
        String docker = null;
        String buildSecret = projectBiz.getSecretById(buildId);
        if (buildSecret == null || !buildSecret.equals(secret)) {
            return "Forbidden";
        }
        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project != null) {
            if (project.getExclusiveBuild() != null) {
                docker = generateDockerfile(project.getExclusiveBuild(), project.getConfFiles());
            } else if (project.getDockerfileConfig() != null) {
                docker = generateDockerfile(project.getDockerfileConfig(), project.getConfFiles());
            } else if (project.getCustomDockerfile() != null) {
                docker = generateDockerfile(project.getCustomDockerfile());
            }
        }
        return docker;
    }

    @Override
    public String getCompileFile(int projectId, int buildId, String secret) {
        String compilefile = null;
        String buildSecret = projectBiz.getSecretById(buildId);
        if (buildSecret == null || !buildSecret.equals(secret)) {
            return "Forbidden";
        }
        String taskName = projectBiz.getBuildTaskNameById(buildId);
        if (StringUtils.isBlank(taskName)) {
            return "Not start build";
        }
        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project != null) {
            compilefile = generateCompilefile(project.getExclusiveBuild(), taskName);
        }
        return compilefile;
    }

    @Override
    public String getCompileScript(int projectId, int buildId, String secret) {
        String buildSecret = projectBiz.getSecretById(buildId);
        if (buildSecret == null || !buildSecret.equals(secret)) {
            return "Forbidden";
        }
        String taskName = projectBiz.getBuildTaskNameById(buildId);
        if (StringUtils.isBlank(taskName)) {
            return "Not start build";
        }
        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project != null) {
            return generateCompileScript(project.getExclusiveBuild());
        }
        return null;
    }

    @Override
    public HttpResponseTemp<?> dockerfileUsed(int projectId, int buildId) {
        checkGetable(projectId);

        return ResultStat.OK.wrap(projectBiz.getDockerfileByBuildId(buildId));
    }

    @Override
    public HttpResponseTemp<?> startAutoBuild(String webHookStr) {
        if (StringUtils.isBlank(webHookStr)) {
            return ResultStat.OK.wrap(null);
        }
        try {
            WebHook webHook = new GitWebHook(webHookStr);
            List<Project> projects = projectBiz.getAllProjects();
            if (projects == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no project info");
            }
            for (Project project : projects) {
                CodeConfiguration codeConfig = project.getCodeInfo();
                if (codeConfig == null) {
                    continue;
                }
                if (webHook.getProject_id() != codeConfig.getCodeId()) {
                    continue;
                }
                AutoBuild autoBuild = project.getAutoBuildInfo();
                if (autoBuild == null) {
                    continue;
                }
                String imageTag = null;
                if (autoBuild.getTag() == 1 && !StringUtils.isBlank(webHook.getTag())) {
                    imageTag = webHook.getTag();
                }
                if (autoBuild.getBranches() != null) {
                    for (String branch : autoBuild.getBranches()) {
                        if (branch.equals(webHook.getBranch())) {
                            imageTag = webHook.getBranch() + "_" + webHook.getAfter().substring(0, 7);
                            break;
                        }
                    }
                }
                if (StringUtils.isBlank(imageTag)) {
                    continue;
                }

                Registry registry = globalBiz.getRegistry();
                ImageInformation imageInfo = new ImageInformation();
                imageInfo.setImageName(project.getName());
                imageInfo.setImageTag(imageTag);
                imageInfo.setRegistry(registry.registryDomain());

                BuildHistory history = new BuildHistory();
                history.setImageInfo(imageInfo);
                history.setProjectId(project.getId());
                history.setCodeInfo(webHook.generateCodeInfo());
                history.setAutoBuild(1);
                history.setCreateTime(System.currentTimeMillis());
                history.setCommitInfo(webHook.generateCommitInfo());

                sendBuildJob(history, project);
            }
        } catch (WebHooksException e) {
            logger.warn("webhook error, message is " + e.getMessage());
            throw ApiException.wrapMessage(ResultStat.WEBHOOK_ERROR, e.getMessage());
        } catch (RSAKeypairException e) {
            logger.warn("rsa keypair error, message is " + e.getMessage());
            throw ApiException.wrapMessage(ResultStat.RSAKEYPAIR_ERROR, e.getMessage());
        } catch (DaoException e) {
            logger.warn("dao exception, message is " + e.getMessage());
            throw ApiException.wrapUnknownException(e);
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<BuildHistory> startBuild(BuildHistory buildInfo) {
        if (buildInfo == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "build information is null");
        }

        checkGetable(buildInfo.getProjectId());

        if (!StringUtils.isBlank(buildInfo.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, buildInfo.checkLegality());
        }

        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, buildInfo.getProjectId(), Project.class);
        CodeConfiguration codeConfig = project.getCodeInfo();
        CodeApiInterface codeApiInterface = null;
        if (codeConfig != null) {
            // if code config is not null, get git commit info
            codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()),
                    codeConfig.getCodeManagerUserId());
            if (codeApiInterface == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error");
            }
            // get commit info
            CommitInformation commitInfo = null;
            CodeInfomation codeInfo = buildInfo.getCodeInfo();
            if (codeInfo == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "code information not set");
            }
            if (codeInfo.getCodeBranch() != null && !codeInfo.getCodeBranch().isEmpty()) {
                commitInfo = codeApiInterface.getCommitInfo(codeConfig.getCodeId(), codeInfo.getCodeBranch());
            } else if (codeInfo.getCodeTag() != null && !codeInfo.getCodeTag().isEmpty()) {
                commitInfo = codeApiInterface.getCommitInfo(codeConfig.getCodeId(), codeInfo.getCodeTag());
            }
            if (commitInfo == null) {
                throw ApiException.wrapMessage(ResultStat.GITLAB_COMMIT_NOT_FOUND, "cannot found commit info in gitlab, url: " + codeConfig.getCodeSshUrl());
            }
            buildInfo.setCommitInfo(commitInfo);
        }

        buildInfo.setCreateTime(System.currentTimeMillis());
        buildInfo.setAutoBuild(0);
        buildInfo.setState(BuildState.Preparing.name());
        UserInformation userInfo = new UserInformation();
        userInfo.setUserId(CurrentThreadInfo.getUserId());
        userInfo.setUserName(AuthUtil.getUserNameById(CurrentThreadInfo.getUserId()));
        buildInfo.setUserInfo(userInfo);

        Registry registry = globalBiz.getRegistry();
        if (registry == null) {
            throw ApiException.wrapResultStat(ResultStat.REGISTRY_NOT_EXIST);
        }

        ImageInformation imageInfo = buildInfo.getImageInfo();
        if (buildInfo.getImageInfo() == null) {
            imageInfo = new ImageInformation();
        }
        imageInfo.setImageName(project.getName());
        imageInfo.setRegistry(registry.registryDomain());

        if (buildInfo.getCodeInfo() == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "code information must be set");
        }
        if (StringUtils.isBlank(imageInfo.getImageTag())) {
            if (!StringUtils.isBlank(buildInfo.getCodeInfo().getCodeBranch())) {
                if (codeConfig != null && codeConfig.getCodeManager() == CodeManager.subversion) {
                    imageInfo.setImageTag(buildInfo.getCodeInfo().getCodeBranch());
                } else {
                    imageInfo.setImageTag(buildInfo.getCodeInfo().getCodeBranch() + "_" + buildInfo.getCommitInfo().getId().substring(0, 7));
                }
            } else if (!StringUtils.isBlank(buildInfo.getCodeInfo().getCodeTag())) {
                imageInfo.setImageTag(buildInfo.getCodeInfo().getCodeTag());
            }
        }
        buildInfo.setImageInfo(imageInfo);

        try {
            sendBuildJob(buildInfo, project);
        } catch (DaoException e) {
            throw ApiException.wrapUnknownException(e);
        } catch (RSAKeypairException e) {
            logger.warn("rsa keypair error, " + e.getMessage());
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, e.getMessage());
        }

        OperationRecord record = new OperationRecord(buildInfo.getProjectId(), ResourceType.PROJECT, OperationType.BUILD,
                CurrentThreadInfo.getUserId(), userInfo.getUserName(), "JOBSEND", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(buildInfo);
    }

    @Override
    public HttpResponseTemp<?> stopBuild(int buildId) {
        BuildHistory buildHistory = projectBiz.getBuildHistoryById(buildId);
        if (buildHistory == null) {
            throw ApiException.wrapResultStat(ResultStat.BUILD_INFO_NOT_EXIST);
        }
        checkGetable(buildHistory.getProjectId());
        if (buildHistory.getState().equals(BuildState.Fail.name()) || buildHistory.getState().equals(BuildState.Success.name())
                || buildHistory.getState().equals(BuildState.Stopped.name())) {
            throw ApiException.wrapResultStat(ResultStat.BUILD_ALREADY_STOPPED);
        } else {
            JobWrapper jobWrapper;
            try {
                jobWrapper = new JobWrapper().init();
            } catch (Exception e) {
                throw ApiException.wrapUnknownException(e);
            }
            jobWrapper.deleteJob(buildId, JobType.PROJECT);
            buildHistory.setState(BuildState.Stopped.name());
            projectBiz.updateBuildHistory(buildHistory);
        }
        return null;
    }

    @Override
    public HttpResponseTemp<?> setBuildStatus(BuildResult buildResult, String secret) throws DaoException {
        if (buildResult != null) {
            String buildSecret = projectBiz.getSecretById(buildResult.getBuildId());
            if (buildSecret == null || !buildSecret.equals(secret)) {
                throw new PermitException("secret not match");
            }
            BuildHistory buildInfo = projectBiz.getById(GlobalConstant.BUILDHISTORY_TABLE_NAME, buildResult.getBuildId(), BuildHistory.class);
            Registry registry = globalBiz.getRegistry();
            if (registry != null && BuildState.Success.name().equals(buildResult.getStatus())) {
                BaseImage baseImage = new BaseImage(buildInfo.getImageInfo().getImageName(),
                        buildInfo.getImageInfo().getImageTag(), registry.fullRegistry(), null);
//                double imageSize = PrivateRegistry.getImageSize(baseImage, tokenService.getAdminToken(baseImage.getImageName()));
                ImageTagDetail tagDetail = PrivateRegistry.getImageTagDetail(baseImage.getRegistry(), baseImage.getImageName(),
                        baseImage.getImageTag(), tokenService.getAdminToken(baseImage.getImageName()), true);
                if (tagDetail != null) {
                    buildInfo.getImageInfo().setImageSize(tagDetail.getSize());
                    buildInfo.getImageInfo().setCreateTime(tagDetail.getCreateTime());
                }
            }
            buildInfo.setFinishTime(System.currentTimeMillis());
            buildInfo.setState(buildResult.getStatus());

            projectBiz.updateBuildHistory(buildInfo);

            if (BuildState.Success.name().equals(buildInfo.getState())) {
                checkAutoDeploy.checkDeploy(buildInfo.getImageInfo());
            }
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public String downloadRsa(int projectId, int buildId, String secret) {
        String buildSecret = projectBiz.getSecretById(buildId);
        if (buildSecret == null || !buildSecret.equals(secret)) {
            return "Forbidden";
        }

        RSAKeyPair rsaKeyPair = projectBiz.getRSAKeyPairByProjectId(projectId);
        if (rsaKeyPair != null) {
            return rsaKeyPair.getPrivateKey();
        }
        return null;
    }

    @Override
    public HttpResponseTemp<?> uploadLogfile(MultipartFile body, int projectId, int buildId, String secret) {
        if (body == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "upload build log error");
        }
        if (StringUtils.isBlank(secret)) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "secret is empty!");
        }
        String buildSecret = projectBiz.getSecretById(buildId);
        if (!secret.equals(buildSecret)) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "secret param error!");
        }
        try {
            byte[] bytes = new byte[(int) body.getSize()];
            body.getInputStream().read(bytes);
            projectBiz.insertBuildLogById(buildId, bytes);
        } catch (IOException e) {
            logger.error("save upload build log file error, message is " + e.getMessage());
        }
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> downloadLogFile(int projectId, int buildId) {
        checkGetable(projectId);
        String log = projectBiz.getBuildLogById(buildId);
        return ResultStat.OK.wrap(log);
    }

    @Override
    public HttpResponseTemp<?> listBuildInfo(int projectId) {
        checkGetable(projectId);
        try {
            List<BuildHistory> buildInfos = UpdateBuildStatusInfo.updateStatusInfos(projectBiz.getBuildHistoryByProjectId(projectId));
            return ResultStat.OK.wrap(buildInfos);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }

    @Override
    public String downloadUploadFile(int projectId, int buildId, String filename, String secret) {
        if (!secret.equals(projectBiz.getSecretById(buildId))) {
            throw ApiException.wrapResultStat(ResultStat.FORBIDDEN);
        }

        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project.getCustomDockerfile() != null) {
            return project.getCustomDockerfile().contentByName(filename);
        }
        return null;
    }

    private String generateCompilefile(ExclusiveBuild exclusiveBuild, String jobName) {
        StringBuilder script = new StringBuilder();

        if (exclusiveBuild != null) {
            String compileImage = exclusiveBuild.getCompileImage().imageInfo();
            String buildImage = globalBiz.getBuildImage().getName();
            script.append("dockervolume=`docker ps --all | grep ").append(buildImage).append(" | grep ")
                    .append(jobName).append(" | awk '{print $1}' `").append("\n");
            script.append("echo ${dockervolume}").append("\n");
            script.append("mkdir -p ").append(GlobalConstant.BUILD_GENERATE_PATH).append("\n");
            script.append("docker run --rm ");
            String envs = exclusiveBuild.getCompileEnv();
            if (!StringUtils.isBlank(envs)) {
                String[] pair = envs.split(",");
                for (String env : pair) {
                    script.append("-e ").append(env).append(" ");
                }
            }
            String codepath = exclusiveBuild.getCodeStoragePath();
            script.append("-w ").append(codepath);
            script.append(" --volumes-from ${dockervolume} ").append(compileImage).append(" ")
                    .append("sh /code/domeos_created_compile_file.sh\n");
            script.append("cp -r ").append(GlobalConstant.BUILD_GENERATE_PATH).append(" ").
                    append(GlobalConstant.BUILD_CODE_PATH).append(GlobalConstant.BUILD_GENERATE_PATH);
            return script.toString();

        }
        return null;
    }

    private String generateCompileScript(ExclusiveBuild exclusiveBuild) {
        StringBuilder command = new StringBuilder("set -e\n");
        if (!exclusiveBuild.getCodeStoragePath().startsWith(GlobalConstant.BUILD_CODE_PATH)) {
            command.append("cp -r ")
                    .append(GlobalConstant.BUILD_CODE_PATH).append("/* ")
                    .append(exclusiveBuild.getCodeStoragePath())
                    .append(" \n");
            command.append("cd ").append(exclusiveBuild.getCodeStoragePath()).append("\n");
        }
        command.append(exclusiveBuild.getCompileCmd());

        for (String savepath : exclusiveBuild.getCreatedFileStoragePath()) {
            String filename = StringUtils.getFilenameWithSlash(savepath);
            command.append("\n cp -r ").append(savepath).append(" ").append(GlobalConstant.BUILD_GENERATE_PATH).append("/").append(filename);
        }
        return command.toString();
    }

    private String generateDockerfile(CustomDockerfile customDockerfile) {
        if (customDockerfile == null) {
            return null;
        }

        StringBuilder dockerfile = new StringBuilder();
        dockerfile.append(customDockerfile.getDockerfile()).append("\n");
        if (customDockerfile.getUploadFileInfos() != null) {
            String url = null;
            for (UploadFileInfo uploadFileInfo : customDockerfile.getUploadFileInfos()) {
                url = checkDownload(uploadFileInfo.getFilename());
                dockerfile.append("ADD ").append(url).append(" ").append("\n");
            }
        }

        return dockerfile.toString();
    }

    private String generateDockerfile(DockerfileContent info, Map<String, String> configFiles) {
        if (info == null) {
            return null;
        }

        StringBuilder dockerfile = new StringBuilder();
        String dockerFrom = CommonUtil.domainUrl(info.getBaseImageRegistry());
        if (!StringUtils.isBlank(dockerFrom)) {
            dockerFrom += "/";
        }
        dockerFrom += info.getBaseImageName();
        if (!StringUtils.isBlank(info.getBaseImageTag())) {
            dockerFrom += ":" + info.getBaseImageTag();
        }
        if (dockerFrom.startsWith(GlobalConstant.HTTP_PREFIX)) {
            dockerFrom = dockerFrom.substring(7);
        }
        if (dockerFrom.startsWith(GlobalConstant.HTTPS_PREFIX)) {
            dockerFrom = dockerFrom.substring(8);
        }
        dockerfile.append("FROM ").append(dockerFrom).append("\n");
        String env = checkEnv(info.getCompileEnv());
        if (!StringUtils.isBlank(env)) {
            dockerfile.append(env);
        }
        String command1 = checkCommand(info.getInstallCmd());
        if (!StringUtils.isBlank(command1)) {
            dockerfile.append("RUN ").append(command1).append("\n");
        }
        dockerfile.append("COPY . ").append(info.getCodeStoragePath()).append("\n");
        String command2 = checkCommand(info.getCompileCmd());
        if (!StringUtils.isBlank(command2)) {
            dockerfile.append("RUN ").append(command2).append("\n");
        }
        if (!StringUtils.isBlank(info.getUser())) {
            dockerfile.append("USER ").append(info.getUser()).append("\n");
        }
        if (!StringUtils.isBlank(info.getWorkDir())) {
            dockerfile.append("WORKDIR ").append(info.getWorkDir()).append("\n");
        }
        if (configFiles != null && configFiles.size() > 0) {
            dockerfile.append("COPY dockerize /usr/bin/dockerize\n");
        }
        String cmd = info.getStartCmd();
        if (!StringUtils.isBlank(cmd)) {
            dockerfile.append("CMD").append(checkDockerize(configFiles)).append(" ").append(cmd).append("\n");
        }
        return dockerfile.toString();
    }

    private String generateDockerfile(ExclusiveBuild exclusiveBuild, Map<String, String> configFiles) {
        if (exclusiveBuild == null) {
            return null;
        }
        StringBuilder dockerfile = new StringBuilder();
        String dockerFrom = exclusiveBuild.getRunImage().imageInfo();
        dockerfile.append("FROM ").append(dockerFrom).append("\n");
        dockerfile.append("COPY .").append(GlobalConstant.BUILD_GENERATE_PATH).append("/ ")
                .append(exclusiveBuild.getRunFileStoragePath()).append("\n");
        if (!StringUtils.isBlank(exclusiveBuild.getUser())) {
            dockerfile.append("USER ").append(exclusiveBuild.getUser()).append("\n");
        }
        if (!StringUtils.isBlank(exclusiveBuild.getWorkDir())) {
            dockerfile.append("WORKDIR ").append(exclusiveBuild.getWorkDir()).append("\n");
        }
        if (configFiles != null && configFiles.size() > 0) {
            dockerfile.append("COPY dockerize /usr/bin/dockerize\n");
        }
        String cmd = exclusiveBuild.getStartCmd();
        if (!StringUtils.isBlank(cmd)) {
            dockerfile.append("CMD").append(checkDockerize(configFiles)).append(" ").append(cmd).append("\n");
        }
        return dockerfile.toString();
    }

    private String checkDownload(String filename) {
        StringBuilder url = new StringBuilder();
        if (globalBiz.getServer() == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "server not set, please check global configuration");
        }
        url.append(globalBiz.getServer().serverInfo()).append("/api/ci/build/download/{{ default .Env.PROJECT_ID \"UNKNOWN\" }}" +
                "/{{ default .Env.BUILD_ID \"UNKNOWN\" }}/uploadfile?secret={{ default .Env.SECRET \"UNKNOWN\" }}&filename=")
                .append(filename).append(" ").append(filename);
        return url.toString();
    }

    private String checkEnv(String envs) {
        StringBuilder result = new StringBuilder();
        if (!StringUtils.isBlank(envs)) {
            String[] pair = envs.split(",");
            for (String env : pair) {
                String[] info = env.split("=");
                result.append("ENV ").append(info[0]).append(" ").append(info[1]).append("\n");
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

    private String checkDockerize(Map<String, String> configFiles) {
        StringBuilder result = new StringBuilder();
        if (configFiles != null && configFiles.size() > 0) {
            result.append(" dockerize");
            for (Map.Entry<String, String> entry : configFiles.entrySet()) {
                result.append(" -template ").append(entry.getKey()).append(":").append(entry.getValue());
            }
        }
        return result.toString();
    }

    private HttpResponseTemp<Object> sendBuildJob(BuildHistory buildInfo, Project project) throws DaoException, RSAKeypairException {
        BuildImage buildImage = globalBiz.getBuildImage();
        if (buildImage == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "build image not set!");
        }
        Server server = globalBiz.getServer();
        if (server == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "server not set!");
        }

        CodeApiInterface codeApiInterface = null;
        String codeUrl = null;
        String codeType = null;
        String privateKey = null;

        CodeConfiguration codeConfig = project.getCodeInfo();
        if (codeConfig != null) {
            String runnerToken = codeConfig.getRunnersToken();
            if (StringUtils.isBlank(runnerToken)) {
                codeUrl = codeConfig.getCodeSshUrl();
            } else {
                String urls[] = codeConfig.getCodeHttpUrl().split("://");
                codeUrl = urls[0] + "://gitlab-ci-token:" + runnerToken + "@" + urls[1];
            }

            codeType = codeConfig.getCodeManager().name();
            codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()),
                    codeConfig.getCodeManagerUserId());
            if (codeApiInterface == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error");
            }
            if (codeConfig.getCodeManager() == CodeManager.gitlab) {
                privateKey = getGitPrivateKey(codeApiInterface, codeConfig.getCodeId(), project.getId(), project.getName());
                if (StringUtils.isBlank(privateKey)) {
                    throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "put deploy key to git error, please check token");
                }
            } else if (codeConfig.getCodeManager() == CodeManager.subversion) {
                SubversionUser svnInfo = projectBiz.getSubversionInfoById(codeConfig.getCodeId());
                if (svnInfo == null) {
                    throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, "can not get subversion info");
                }
                privateKey = svnInfo.getPassword();
            }
        }

        // save dockerfile for build
        String dockerfileContent = null;
        String buildPath = null;
        String dockerfilePath = null;
        int hasDockerfile = project.isUserDefineDockerfile() ? 1 : 0;
        if (project.isUserDefineDockerfile() && codeConfig != null) {
            UserDefinedDockerfile dockerInfo = project.getDockerfileInfo();
            String ref = null;
            if (buildInfo.getCodeInfo() == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no code info for build");
            }
            if (!StringUtils.isBlank(buildInfo.getCodeInfo().getCodeTag()) && buildInfo.getCommitInfo() != null) {
                ref = buildInfo.getCommitInfo().getId();
            } else if (!StringUtils.isBlank(buildInfo.getCodeInfo().getCodeBranch()) && buildInfo.getCommitInfo() != null) {
                ref = buildInfo.getCommitInfo().getId();
            }
            String path = dockerInfo.getDockerfilePath();
            if (path.startsWith("/")) {
                dockerfilePath = path;
                path = path.substring(1);
            } else {
                dockerfilePath = "/" + path;
            }
            buildPath = dockerInfo.getBuildPath();
            if (!buildPath.startsWith("/")) {
                buildPath = "/" + buildPath;
            }
            if (codeConfig.getCodeManager() == CodeManager.subversion) {
                if (ref != null) {
                    ref = buildInfo.getCodeInfo().getCodeBranch() == null ? "/tags/" + ref : "/branches/" + ref;
                    buildPath = ref + buildPath;
                    dockerfilePath = ref + dockerfilePath;
                }
                buildPath = "/" + project.getName() + buildPath;
                dockerfilePath = "/" + project.getName() + dockerfilePath;
            }

            byte[] content = codeApiInterface.getDockerfile(codeConfig.getCodeId(), ref, path);
            if (content == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "could not find dockerfile in " + dockerInfo.getDockerfilePath());
            }
            dockerfileContent = new String(content);
        } else {
            if (project.getDockerfileConfig() != null) {
                dockerfileContent = generateDockerfile(project.getDockerfileConfig(), project.getConfFiles());
            } else if (project.getExclusiveBuild() != null) {
                dockerfileContent = generateDockerfile(project.getExclusiveBuild(), project.getConfFiles());
            } else if (project.getCustomDockerfile() != null) {
                dockerfileContent = generateDockerfile(project.getCustomDockerfile());
            }
        }
        if (StringUtils.isBlank(dockerfileContent)) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "generate dockerfile error");
        }

        buildInfo.setDockerfileContent(dockerfileContent);
        String secret = UUID.randomUUID().toString();
        buildInfo.setSecret(secret);
        projectBiz.addBuildHistory(buildInfo);

        // send job to kube
        JobWrapper jobWrapper;
        try {
            jobWrapper = new JobWrapper().init();
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }

        String buildType = "SIMPLE";
        if (project.getExclusiveBuild() != null) {
            buildType = project.getExclusiveBuild().getCustomType();
        }
        Registry registry = globalBiz.getRegistry();
        int userAuth = 0;
        if (registry != null && registry.getTokenInfo() != null) {
            userAuth = 1;
        }
        Map<String, String> envMap = generateEnvs(codeType, server.serverInfo(), buildInfo, privateKey, codeUrl, hasDockerfile,
                secret, buildPath, dockerfilePath, buildType, userAuth);
        if (envMap == null || envMap.size() == 0) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no env info for build kube job");
        }


        try {
            String jobName = jobWrapper.sendJob(jobWrapper.generateJob(buildImage.getName(), envMap));
            buildInfo.setTaskName(jobName);
            buildInfo.setState(BuildState.Send.name());
            projectBiz.setTaskNameAndStatus(buildInfo);
        } catch (JobNotFoundException e) {
            projectBiz.removeById(GlobalConstant.BUILDHISTORY_TABLE_NAME, buildInfo.getId());
            throw ApiException.wrapMessage(ResultStat.SEND_JOB_ERROR, "job is null");
        } catch (K8sDriverException e) {
            projectBiz.removeById(GlobalConstant.BUILDHISTORY_TABLE_NAME, buildInfo.getId());
            throw ApiException.wrapMessage(ResultStat.SEND_JOB_ERROR, e.getMessage());
        }
        return null;
    }

    private String getGitPrivateKey(CodeApiInterface codeApiInterface, int codeId, int projectId, String projectName)
            throws RSAKeypairException {
        String privateKey = null;
        ProjectRsakeyMap keyMap = projectBiz.getRSAKeypairMapByProjectId(projectId);
        if (keyMap == null || !codeApiInterface.checkDeployKey(codeId, keyMap.getKeyId())) {
            projectBiz.deleteRSAKeypairMapByProjectId(projectId);
            RSAKeyPair keyPair = RSAKeyPairGenerator.generateKeyPair();
            if (keyPair == null) {
                throw new RSAKeypairException("generate rsa key pair error");
            }
            // codeApiInterface.deleteDeployKeys(codeConfig.getCodeId());
            int keyId = codeApiInterface.setDeployKey(codeId, "DomeOS_" + projectName, keyPair.getPublicKey());
            if (keyId > 0) {
                keyPair.setCreateTime(System.currentTimeMillis());
                projectBiz.insertRowForRsaKeypair(keyPair);
                ProjectRsakeyMap projectRsakeyMap = new ProjectRsakeyMap();
                projectRsakeyMap.setProjectId(projectId);
                projectRsakeyMap.setRsaKeypairId(keyPair.getId());
                projectRsakeyMap.setKeyId(keyId);
                projectRsakeyMap.setCreateTime(System.currentTimeMillis());
                projectRsakeyMap.setState("active");
                projectBiz.addProjectRsaMap(projectRsakeyMap);
                privateKey = keyPair.getPrivateKey().replaceAll("\n", "\\\\n");
            }
        } else {
            RSAKeyPair keyPair = projectBiz.getById(GlobalConstant.RSAKEYPAIR_TABLE_NAME, keyMap.getRsaKeypairId(), RSAKeyPair.class);
            privateKey = keyPair.getPrivateKey().replaceAll("\n", "\\\\n");
        }
        return privateKey;
    }

    private Map<String, String> generateEnvs(String codeType, String server, BuildHistory buildInfo, String privateKey,
                                             String codeUrl, int hasDockerfile, String secret, String buildPath,
                                             String dockerfilePath, String buildType, int useAuth) {
        String commitId = null;
        if (buildInfo.getCommitInfo() != null) {
            commitId = buildInfo.getCommitInfo().getId();
        }

        Map<String, String> retMap = new LinkedHashMap<>();
        retMap.put("SERVER", server);
        retMap.put("BUILD_ID", String.valueOf(buildInfo.getId()));
        retMap.put("IDRSA", privateKey);
        retMap.put("CODE_URL", codeUrl);
        retMap.put("PROJECT_ID", String.valueOf(buildInfo.getProjectId()));
        retMap.put("REGISTRY_URL", buildInfo.getImageInfo().getRegistry());
        retMap.put("IMAGE_NAME", buildInfo.getImageInfo().getImageName());
        retMap.put("IMAGE_TAG", buildInfo.getImageInfo().getImageTag());
        retMap.put("COMMIT_ID", commitId);
        retMap.put("HAS_DOCKERFILE", String.valueOf(hasDockerfile));
        retMap.put("SECRET", secret);
        retMap.put("BUILD_PATH", buildPath);
        retMap.put("DOCKERFILE_PATH", dockerfilePath);
        retMap.put("TYPE", codeType);
        retMap.put("BUILD_TYPE", buildType);
        retMap.put("USE_AUTH", String.valueOf(useAuth));
        return retMap;
    }

    @Override
    public Boolean secretAuthorization(String buildIdStr, String secretStr) {
        if (StringUtils.isBlank(secretStr) || StringUtils.isBlank(secretStr)) {
            return false;
        }
        try {
            int buildId = Integer.valueOf(buildIdStr);
            BuildHistory buildHistory = projectBiz.getBuildHistoryById(buildId);
            String buildState = buildHistory.getState();
            if (buildState.equals(BuildState.Success.name()) || buildState.equals(BuildState.Fail.name())
                    || buildState.equals(BuildState.Success.name())) {
                return false;
            }
            String secret = buildHistory.getSecret();

            if (!StringUtils.isBlank(secret) && secret.equals(secretStr)) {
                return true;
            }

        } catch (NumberFormatException e) {
            return false;
        }
        return false;
    }

    @Override
    public HttpResponseTemp<?> getBuildInfoPageById(int projectId, int page, int count) {
        if (projectId <= 0 || page <= 0 || count <= 0) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "parameters must > 0!");
        }
        checkGetable(projectId);
        int start = (page - 1) * count;
        try {
            List<BuildHistory> buildInfos = UpdateBuildStatusInfo
                    .updateStatusInfos(projectBiz.getBuildHistoryPageByProjectId(projectId, start, count));
            BuildHistoryListInfo buildHistoryListInfo = new BuildHistoryListInfo();
            int total = projectBiz.getBuildHistoryCountsByProjectId(projectId);
            buildHistoryListInfo.setTotal(total);
            buildHistoryListInfo.setBuildHistories(buildInfos);
            Registry privateRegistry = globalBiz.getRegistry();
            if (privateRegistry != null) {
                buildHistoryListInfo.setRegistryUrl(privateRegistry.registryDomain());
                buildHistoryListInfo.setAuthRegistryEnabled(privateRegistry.getTokenInfo() != null);
            }
            return ResultStat.OK.wrap(buildHistoryListInfo);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
    }
}
