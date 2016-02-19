package org.domeos.api.service.project.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.ci.BuildMapper;
import org.domeos.api.mapper.ci.KubeBuildMapper;
import org.domeos.api.mapper.ci.RSAKeyPairMapper;
import org.domeos.api.mapper.project.*;
import org.domeos.api.mapper.resource.ResourceHistoryMapper;
import org.domeos.api.model.ci.BuildInfo;
import org.domeos.api.model.ci.CodeType;
import org.domeos.api.model.ci.RSAKeyPair;
import org.domeos.api.model.console.git.CodeSourceInfo;
import org.domeos.api.model.console.project.Project;
import org.domeos.api.model.git.Gitlab;
import org.domeos.api.model.git.Subversion;
import org.domeos.api.model.global.Server;
import org.domeos.api.model.project.*;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceHistory;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.model.user.RoleType;
import org.domeos.api.service.ci.impl.UpdateBuildStatusInfo;
import org.domeos.api.service.global.GlobalService;
import org.domeos.api.service.project.ProjectService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.ProjectHookException;
import org.domeos.global.ClientConfigure;
import org.domeos.shiro.AuthUtil;
import org.domeos.util.RSAKeyPairGenerator;
import org.domeos.util.code.CodeApiInterface;
import org.domeos.util.code.ReflectFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 */
@Service("projectService")
public class ProjectServiceImpl implements ProjectService {

    private static Logger logger = LoggerFactory.getLogger(ProjectServiceImpl.class);

    @Autowired
    ProjectBasicMapper projectBasicMapper;
    @Autowired
    CodeConfigMapper codeConfigMapper;
    @Autowired
    AutoBuildMapper autoBuildMapper;
    @Autowired
    DockerfileMapper dockerfileMapper;
    @Autowired
    ConfigFileMapper configFileMapper;
    @Autowired
    EnvConfigMapper envConfigMapper;
    @Autowired
    UploadFileMapper uploadFileMapper;
    @Autowired
    GitlabMapper gitlabMapper;
    @Autowired
    SubversionMapper subversionMapper;
    @Autowired
    RSAKeyPairMapper rsaKeyPairMapper;
    @Autowired
    DockerInfoMapper dockerInfoMapper;
    @Autowired
    UploadFileContentMapper uploadFileContentMapper;
    @Autowired
    BuildMapper buildMapper;
    @Autowired
    ResourceHistoryMapper resourceHistoryMapper;
    @Autowired
    KubeBuildMapper kubeBuildMapper;
    @Autowired
    GlobalService globalService;

    @Override
    public HttpResponseTemp<?> createProject(Project project, long userId) {
        if (project == null) {
            return ResultStat.PROJECT_NOT_LEGAL.wrap(null, "project info is null");
        }

        if (!StringUtils.isBlank(project.checkLegality())) {
            return ResultStat.PROJECT_NOT_LEGAL.wrap(null, project.checkLegality());
        }

        if (projectBasicMapper.getProjectBasicByName(project.getProjectName()) != null) {
            return ResultStat.PROJECT_EXISTED.wrap(null);
        }

        project.setCreateTime(System.currentTimeMillis());
        project.setLastModify(project.getCreateTime());

        ProjectBasic projectBasic = new ProjectBasic();
        projectBasicMapper.addProjectBasic(projectBasic);

        project.setId(projectBasic.getId());
        try {
            setProjectRelatedInfo(project);
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }

        projectBasicMapper.updateProjectBasicById(new ProjectBasic(project));

        Resource resource = new Resource(projectBasic.getId(), ResourceType.PROJECT);
        AuthUtil.setResourceOwnerAndType(resource, userId, project.getType(), project.getProjectName());
        resource.setUpdate_time(new Date());
        resource.setRole(RoleType.MASTER.getRoleName());
        AuthUtil.addResource(resource);

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.PROJECT.getResourceName(), project.getId(),
                OperationType.SET.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return ResultStat.OK.wrap(project);
    }

    @Override
    public HttpResponseTemp<?> deleteProject(int id, long userId) {
        if (!AuthUtil.verify(userId, id, ResourceType.PROJECT, OperationType.DELETE)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        int deploymentId = 0;
        // TODO: decide when to delete the project
        if (deploymentId != 0) {
            return ResultStat.CANNOT_DELETE_PROJECT.wrap(null, "must stop all deployment first");
        }

        projectBasicMapper.deleteProjectBasicById(id);

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.PROJECT.getResourceName(), id,
                OperationType.DELETE.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> modifyProject(Project project, long userId) {
        if (project == null) {
            return ResultStat.PROJECT_NOT_LEGAL.wrap(null, "project info is null");
        }

        if (!AuthUtil.verify(userId, project.getId(), ResourceType.PROJECT, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if (!StringUtils.isBlank(project.checkLegality())) {
            return ResultStat.PROJECT_NOT_LEGAL.wrap(null, project.checkLegality());
        }

        ProjectBasic projectBasic = projectBasicMapper.getProjectBasicByName(project.getProjectName());

        if (projectBasic == null) {
            return ResultStat.PROJECT_NOT_EXIST.wrap(null);
        }

        project.setCreateTime(projectBasic.getCreateTime());
        project.setLastModify(System.currentTimeMillis());
        project.setId(projectBasic.getId());

        deleteProjectRelatedInfo(projectBasic.getId());

        try {
            setProjectRelatedInfo(project);
        } catch (Exception e) {
            return ResultStat.PARAM_ERROR.wrap(null, e.getMessage());
        }

        projectBasicMapper.updateProjectBasicById(new ProjectBasic(project));

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.PROJECT.getResourceName(), project.getId(),
                OperationType.MODIFY.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<Project> getProject(int id, long userId) {
        ProjectBasic projectBasic = projectBasicMapper.getProjectBasicById(id);

        if (projectBasic == null) {
            return ResultStat.PROJECT_NOT_EXIST.wrap(null);
        }

        if (!AuthUtil.verify(userId, projectBasic.getId(), ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        return ResultStat.OK.wrap(getProjectRelatedInfo(projectBasic));
    }

    @Override
    public HttpResponseTemp<?> listProjectInfo(long userId) {
        // a bit ugly now
        List<Resource> resources = AuthUtil.getResourceList(userId, ResourceType.PROJECT);
        List<ProjectBasic> publicProjects = projectBasicMapper.listPublicProjectBasic();

        Set<Integer> projectIdSet = new HashSet<>();
        if (resources != null) {
            for (Resource resource : resources) {
                projectIdSet.add((int) resource.getResource_id());
            }
        }
        if (publicProjects != null) {
            for (ProjectBasic projectBasic : publicProjects) {
                projectIdSet.add(projectBasic.getId());
            }
        }

        List<ProjectListInfo> projectListInfo = new LinkedList<>();

        List<Future<ProjectListInfo>> futures = new LinkedList<>();
        for (int projectId : projectIdSet) {
            Future<ProjectListInfo> future = ClientConfigure.executorService.submit(new ProjectInfoTask(projectId));
            futures.add(future);
        }
        for (Future<ProjectListInfo> future : futures) {
            try {
                ProjectListInfo info = future.get();
                if (info != null) {
                    projectListInfo.add(info);
                }
            } catch (InterruptedException | ExecutionException e) {
                logger.warn("get project list error, message is " + e.getMessage());
            }
        }

        Collections.sort(projectListInfo, new ProjectListInfo.ProjectListInfoComparator());
        return ResultStat.OK.wrap(projectListInfo);
    }

    @Override
    public HttpResponseTemp<?> listCodeSourceInfo(Long userId) {
        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.gitlab.getCodeType(), 0);
        if (codeApiInterface == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "get code api error, please check code configuration");
        }
        List<CodeSourceInfo> codeSourceInfos = codeApiInterface.listCodeInfo(userId.intValue());
        return ResultStat.OK.wrap(codeSourceInfos);
    }

    @Override
    public HttpResponseTemp<?> listSvnCodeSourceInfo(Long userId) {
        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.subversion.getCodeType(), 0);
        if (codeApiInterface == null){
            return ResultStat.PARAM_ERROR.wrap(null, "get code api error, please check code configuration");
        }
        List<CodeSourceInfo> codeSourceInfos = codeApiInterface.listCodeInfo(userId.intValue());
        return ResultStat.OK.wrap(codeSourceInfos);
    }

    @Override
    public HttpResponseTemp<?> setGitlabInfo(Gitlab gitlab, long userId) {
        if (gitlab == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "git lab info is null");
        }

        gitlab.setUserId(new Long(userId).intValue());
        gitlab.setCreateTime(System.currentTimeMillis());
        Gitlab oldGitlab = gitlabMapper.getGitlabInfoByUserIdAndName(new Long(userId).intValue(), gitlab.getName());
        if (oldGitlab == null) {
            gitlabMapper.addGitlabInfo(gitlab);
        } else {
            gitlab.setId(oldGitlab.getId());
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.gitlab.getCodeType(), gitlab.getId());
        if (codeApiInterface == null) {
            return ResultStat.GITLAB_GLOBAL_INFO_NOT_EXIST.wrap(null, "get code api error, please check code configuration");
        }
        CodeSourceInfo codeSourceInfo = new CodeSourceInfo(gitlab.getId(), gitlab.getName(), codeApiInterface.getGitlabProjectInfos());

        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.GITLAB.getResourceName(), gitlab.getId(),
                OperationType.SET.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return ResultStat.OK.wrap(codeSourceInfo);
    }

    @Override
    public HttpResponseTemp<?> setSubversionInfo(Subversion subversion, long userId){
        if (subversion == null){
            return ResultStat.PARAM_ERROR.wrap(null, "svn info is not null");
        }
        subversion.setUserId(new Long(userId).intValue());
        subversion.setCreateTime(System.currentTimeMillis());
        Subversion oldSubversion = subversionMapper.getSubversionInfoByUserIdAndSvnPath(new Long(userId).intValue(), subversion.getSvnPath());
        if(oldSubversion == null){
            subversionMapper.addSubversionInfo(subversion);
        } else{
            subversion.setId(oldSubversion.getId());
        }
        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.subversion.getCodeType(), subversion.getId());
        if (codeApiInterface == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "get code api error, please check code configuration");
        }
        CodeSourceInfo codeSourceInfo = new CodeSourceInfo(subversion.getId(), subversion.getName(), codeApiInterface.getSubversionProjectInfo(subversion.getId()));
        ResourceHistory resourceHistory = new ResourceHistory(ResourceType.SUBVERSION.getResourceName(), subversion.getId(),
                OperationType.SET.getOperation(), userId, System.currentTimeMillis(), "OK");
        resourceHistoryMapper.addResourceHistory(resourceHistory);
        return  ResultStat.OK.wrap(codeSourceInfo);

    }

    @Override
    public HttpResponseTemp<?> getProjectDockerfile(int projectId, String branch, String path, long userId) {
        if (!AuthUtil.verify(userId, projectId, ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        CodeConfig codeConfig = codeConfigMapper.getCodeConfigsByProjectId(projectId);
        if (codeConfig == null) {
            return ResultStat.PROJECT_CODE_INFO_NOT_EXIST.wrap(null);
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()), codeConfig.getUserInfo());
        if (codeApiInterface == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "get code api error");
        }
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        byte[] dockerfile = codeApiInterface.getDockerfile(codeConfig.getCodeId(), branch, path);
        if (dockerfile == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "dockerfile could not found");
        }
        return ResultStat.OK.wrap(new String(dockerfile));
    }

    @Override
    public HttpResponseTemp<?> getBranches(int projectId, long userId) {
        if (!AuthUtil.verify(userId, projectId, ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        CodeConfig codeConfig = codeConfigMapper.getCodeConfigsByProjectId(projectId);
        if (codeConfig == null) {
            return ResultStat.PROJECT_CODE_INFO_NOT_EXIST.wrap(null);
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()), codeConfig.getUserInfo());
        if (codeApiInterface == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "get code api error");
        }

        List<String> branches = codeApiInterface.getBranches(codeConfig.getCodeId());
        return ResultStat.OK.wrap(branches);
    }

    @Override
    public HttpResponseTemp<?> getReadme(int projectId, String branch, long userId) {
        if (!AuthUtil.verify(userId, projectId, ResourceType.PROJECT, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        CodeConfig codeConfig = codeConfigMapper.getCodeConfigsByProjectId(projectId);
        if (codeConfig == null) {
            return ResultStat.PROJECT_CODE_INFO_NOT_EXIST.wrap(null);
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()), codeConfig.getUserInfo());
        if (codeApiInterface == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "get code api error");
        }

        byte[] readme = codeApiInterface.getReadme(codeConfig.getCodeId(), branch);
        return ResultStat.OK.wrap(new String(readme));
    }

    private void setProjectRelatedInfo(Project project) throws Exception {
        CodeApiInterface codeApiInterface = null;
        if (project.getCodeInfo() != null) {
            Project.CodeInfo codeInfo = project.getCodeInfo();
            codeConfigMapper.addCodeConfig(new CodeConfig(project.getId(), codeInfo.getCodeManager(), codeInfo.getCodeSource(),
                    codeInfo.getCodeHttpUrl(), codeInfo.getCodeSshUrl(), codeInfo.getCodeId(), codeInfo.getUserInfo()));

            codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeInfo.getCodeManager()), codeInfo.getUserInfo());
            if (codeApiInterface == null) {
                throw new Exception("get code api error, check code configuration");
            }
            // for gitlab
            // add deploy key to gitlab, check first
            if(codeInfo.getCodeManager().equals("gitlab")) {
                RSAKeyPair rsaKeyPair = rsaKeyPairMapper.getRSAKeyPairByProjectId(project.getId());
                if (rsaKeyPair == null || !codeApiInterface.checkDeployKey(project.getCodeInfo().getCodeId(), rsaKeyPair.getKeyId())) {
                    RSAKeyPair keyPair = codeApiInterface.getDeployKey(codeInfo.getCodeId());
                    if(keyPair != null) {
                        keyPair.setId(0);
                    }
                    else {
                        rsaKeyPairMapper.deleteRSAKeyPairByProjectId(project.getId());
                        // add deploy key to gitlab
                        keyPair = RSAKeyPairGenerator.generateKeyPair();
                        if (keyPair == null) {
                            throw new Exception("generate rsa key pair error");
                        }
                        int keyId = codeApiInterface.setDeployKey(project.getCodeInfo().getCodeId(), "DomeOS", keyPair.getPublicKey());

                        if (keyId > 0) {
                            keyPair.setKeyId(keyId);
                        } else {
                            throw new Exception("put deploy key to git error, please check token");
                        }
                    }
                    keyPair.setProjectId(project.getId());
                    rsaKeyPairMapper.addRSAKeyPair(keyPair);
                }
            }
        } else if (project.getAutoBuildInfo() != null) {
            throw new Exception("can not set auto build info");
        }

        if (project.getAutoBuildInfo() != null) {
            Project.AutoBuildInfo info = project.getAutoBuildInfo();
            boolean tagEvents = false;
            boolean pushEvents = false;
            if (info.getTag() > 0) {
                autoBuildMapper.addAutoBuildInfo(new AutoBuild(project.getId(), null, 1));
                tagEvents = true;
            }
            if (info.getBranches() != null && info.getBranches().size() > 0) {
                for (String branch : info.getBranches()) {
                    autoBuildMapper.addAutoBuildInfo(new AutoBuild(project.getId(), branch, 0));
                }
                pushEvents = true;
            }

            Server server = globalService.getServer();
            if (server == null) {
                throw new Exception("global server should be set");
            }
            String hookurl = server.serverInfo() + "/api/ci/build/autobuild";
            if (!codeApiInterface.setProjectHook(project.getCodeInfo().getCodeId(), hookurl, pushEvents, tagEvents)) {
                throw new ProjectHookException("set project hook error");
            }
        }

        if (project.getDockerfileConfig() != null) {
            Project.DockerfileConfig config = project.getDockerfileConfig();
            dockerfileMapper.addDockerfile(new Dockerfile(project.getId(), config.getBaseImageName(), config.getBaseImageTag(),
                    config.getBaseImageRegistry(), config.getInstallCmd(), config.getCodeStoragePath(), config.getWorkDir(),
                    config.getCompileEnv(), config.getCompileCmd(), config.getStartCmd(), config.getUser()));
        } else if (project.getDockerfileInfo() != null) {
            Project.DockerfileInfo info = project.getDockerfileInfo();
            DockerInfo dockerInfo = dockerInfoMapper.getDockerInfoByProjectId(project.getId());
            if (dockerInfo != null) {
                dockerInfoMapper.updateDockerInfoByProjectId(new DockerInfo(project.getId(), info.getBuildPath(), info.getBranch(), info.getDockerfilePath()));
            } else {
                dockerInfoMapper.addDockerInfo(new DockerInfo(project.getId(), info.getBuildPath(), info.getBranch(), info.getDockerfilePath()));
            }
        } else {
            throw new Exception("no docker file info or docker file config found");
        }

        if (project.getConfFiles() != null) {
            for (Map.Entry<String, String> entry : project.getConfFiles().entrySet()) {
                configFileMapper.addConfFile(new ConfigFile(project.getId(), entry.getKey(), entry.getValue()));
            }
        }

        if (project.getEnvConfDefault() != null) {
            for (Project.EnvSetting envSetting : project.getEnvConfDefault()) {
                envConfigMapper.addEnvConfig(new EnvConfig(project.getId(), envSetting.getKey(), envSetting.getValue(), envSetting.getDescription()));
            }
        }

        if (project.getUploadFile() != null) {
            for (Map.Entry<String, String> uploadFile : project.getUploadFile().entrySet()) {
                UploadFileContent content = uploadFileContentMapper.getUploadFileContentByMd5(uploadFile.getValue());
                if (content != null) {
                    uploadFileMapper.addUploadFile(new UploadFile(project.getId(), uploadFile.getKey(), uploadFile.getValue()));
                } else {
                    throw new Exception("upload file not exist");
                }
            }
        }
    }

    private void deleteProjectRelatedInfo(int basicId) {
        codeConfigMapper.deleteCodeConfigByProjectId(basicId);
        autoBuildMapper.deleteAutoBuildByProjectId(basicId);
        dockerfileMapper.deleteDockerfileByProjectId(basicId);
        dockerInfoMapper.deleteDockerInfoByProjectId(basicId);
        configFileMapper.deleteConfigFileByProjectId(basicId);
        envConfigMapper.deleteEnvConfigByProjectId(basicId);
        uploadFileMapper.deleteUploadFileByProjectId(basicId);
    }

    private Project getProjectRelatedInfo(ProjectBasic projectBasic) {
        int basicId = projectBasic.getId();
        CodeConfig codeConfig = codeConfigMapper.getCodeConfigsByProjectId(basicId);
        List<AutoBuild> autoBuilds = autoBuildMapper.getAutoBuildByProjectId(basicId);
        Dockerfile dockerfile = dockerfileMapper.getDockerfileByProjectBasicId(basicId);
        DockerInfo dockerInfo = dockerInfoMapper.getDockerInfoByProjectId(basicId);
        List<ConfigFile> configFiles = configFileMapper.getALLConfigByProjectId(basicId);
        List<EnvConfig> envConfigs = envConfigMapper.getALLEnvConfigsByProjectId(basicId);
        List<UploadFile> uploadFiles = uploadFileMapper.getALLUploadFilesByProjectId(basicId);

        return new Project(projectBasic, codeConfig, autoBuilds, dockerfile, dockerInfo, configFiles, envConfigs, uploadFiles);
    }

    public class ProjectInfoTask implements Callable<ProjectListInfo> {
        int projectId;

        public ProjectInfoTask(int projectId) {
            this.projectId = projectId;
        }

        @Override
        public ProjectListInfo call() throws Exception {
            ProjectListInfo listInfo = new ProjectListInfo();
            ProjectBasic projectBasic = projectBasicMapper.getProjectBasicById(projectId);
            if (projectBasic == null) {
                return null;
            }
            listInfo.setId(projectId);
            listInfo.setProjectName(projectBasic.getName());
            listInfo.setCreateTime(projectBasic.getCreateTime());

            BuildInfo buildInfo = buildMapper.getLatestBuildInfo(projectId);
            if (buildInfo != null) {
                try {
                    buildInfo = UpdateBuildStatusInfo.updateBuildInfo(buildInfo);
                } catch (Exception e) {
                    throw new Exception(e.getMessage());
                }
                listInfo.setBuildStatus(buildInfo.getStatus().name());
                listInfo.setBuildTime(buildInfo.getCreateTime());
            }

            CodeConfig codeConfig = codeConfigMapper.getCodeConfigsByProjectId(projectId);
            if (codeConfig != null) {
                listInfo.setCodeManager(codeConfig.getCodeManager());
                listInfo.setCodeSource(codeConfig.getCodeSource());
                listInfo.setCodeSshUrl(codeConfig.getCodeSshUrl());
                listInfo.setCodeHttpUrl(codeConfig.getCodeHttpUrl());
            }
            return listInfo;
        }
    }
}
