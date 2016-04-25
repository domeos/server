package org.domeos.framework.api.service.project.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.consolemodel.CreatorDraft;
import org.domeos.framework.api.consolemodel.project.CodeSourceInfo;
import org.domeos.framework.api.consolemodel.project.ProjectCreate;
import org.domeos.framework.api.consolemodel.project.ProjectList;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.CodeType;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.SubversionUser;
import org.domeos.framework.api.model.project.related.AutoBuild;
import org.domeos.framework.api.model.project.related.CodeConfiguration;
import org.domeos.framework.api.model.project.related.CodeManager;
import org.domeos.framework.api.model.project.related.ProjectState;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.project.ProjectService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.coderepo.CodeApiInterface;
import org.domeos.framework.engine.coderepo.ReflectFactory;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

/**
 */
@Service("projectService")
public class ProjectServiceImpl implements ProjectService {

    private static Logger logger = LoggerFactory.getLogger(ProjectServiceImpl.class);

    @Autowired
    ProjectBiz projectBiz;
    @Autowired
    ResourceBiz resourceBiz;
    @Autowired
    GlobalBiz globalBiz;
    @Autowired
    OperationHistory operationHistory;

    @Override
    public HttpResponseTemp<?> createProject(ProjectCreate projectCreate) {
        if (projectCreate == null || projectCreate.getProject() == null || projectCreate.getCreatorDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_NOT_LEGAL, "project info is null");
        }
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }

        Project project = projectCreate.getProject();
        String error = project.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_NOT_LEGAL, error);
        }

        CreatorDraft creatorDraft = projectCreate.getCreatorDraft();
        error = creatorDraft.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.CREATOR_ERROR, error);
        }

        if (!projectBiz.checkProjectName(project.getName())) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_EXISTED);
        }

        project.setCreateTime(System.currentTimeMillis());
        project.setState(ProjectState.active.name());

        if (project.getCodeInfo() != null) {
            CodeConfiguration codeInfo = project.getCodeInfo();
            CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeInfo.getCodeManager()),
                    codeInfo.getCodeManagerUserId());
            if (codeApiInterface == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error, check code configuration");
            }
            if (project.getAutoBuildInfo() != null) {
                AutoBuild info = project.getAutoBuildInfo();
                boolean tagEvents = false;
                boolean pushEvents = false;
                if (info.getTag() > 0) {
                    tagEvents = true;
                }
                if (info.getBranches() != null && info.getBranches().size() > 0) {
                    pushEvents = true;
                }

                Server server = globalBiz.getServer();
                if (server == null) {
                    throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "global server should be set");
                }
                String hookurl = server.serverInfo() + "/api/ci/build/autobuild";
                if (!codeApiInterface.setProjectHook(project.getCodeInfo().getCodeId(), hookurl, pushEvents, tagEvents)) {
                    throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "set project hook error, webhook string is: " + hookurl);
                }
            }
        } else if (project.getAutoBuildInfo() != null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "can not set auto build info");
        }

        projectBiz.addProject(project);

        resourceBiz.addResource(project.getId(), ResourceType.PROJECT, creatorDraft.getCreatorId(), creatorDraft.getCreatorType(), Role.MASTER);

        OperationRecord record = new OperationRecord(project.getId(), ResourceType.PROJECT, OperationType.SET,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(project);
    }

    @Override
    public HttpResponseTemp<?> deleteProject(int id) {
        checkDeletable(id);
        projectBiz.removeById(GlobalConstant.PROJECT_TABLE_NAME, id);

        resourceBiz.deleteResourceByIdAndType(id, ResourceType.PROJECT);

        OperationRecord record = new OperationRecord(id, ResourceType.PROJECT, OperationType.DELETE,
                CurrentThreadInfo.getUserId(), CurrentThreadInfo.getUserName(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> modifyProject(Project project) {
        if (project == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_NOT_LEGAL, "project info is null");
        }

        checkModifiable(project.getId());

        String error = project.checkLegality();
        if (!StringUtils.isBlank(error)) {
            return ResultStat.PROJECT_NOT_LEGAL.wrap(null, error);
        }

        projectBiz.updateProjectById(project);

        OperationRecord record = new OperationRecord(project.getId(), ResourceType.PROJECT, OperationType.MODIFY,
                CurrentThreadInfo.getUserId(), CurrentThreadInfo.getUserName(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<Project> getProject(int id) {
        checkGetable(id);
        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, id, Project.class);
        return ResultStat.OK.wrap(project);
    }

    @Override
    public HttpResponseTemp<?> listProjectInfo() {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }

        List<Resource> resources = AuthUtil.getResourceList(user.getId(), ResourceType.PROJECT);
        List<Project> publicProjects = projectBiz.listAuthoritiedProjects();
        List<Project> privateProjects = projectBiz.getListByReousrce(GlobalConstant.PROJECT_TABLE_NAME, resources, Project.class);

        List<ProjectList> projectListInfo = new LinkedList<>();
        for (Project project : publicProjects) {
            ProjectList projectList = generateProjectList(project);
            projectListInfo.add(projectList);
        }
        for (Project project : privateProjects) {
            if (project.getAuthority() == 0) {
                ProjectList projectList = generateProjectList(project);
                projectListInfo.add(projectList);
            }
        }
        Collections.sort(projectListInfo, new ProjectList.ProjectListComparator());
        return ResultStat.OK.wrap(projectListInfo);
    }

    private ProjectList generateProjectList(Project project) {
        BuildHistory buildHistory = projectBiz.getLatestBuildHistoryByProjectId(project.getId());
        ProjectList projectList = new ProjectList();
        projectList.setId(project.getId());
        projectList.setName(project.getName());
        if (buildHistory != null) {
            projectList.setBuildTime(buildHistory.getCreateTime());
            projectList.setBuildStatus(buildHistory.getState());
        }
        if (project.getCodeInfo() != null) {
            projectList.setCodeSshUrl(project.getCodeInfo().getCodeSshUrl());
            projectList.setCodeManager(project.getCodeInfo().getCodeManager());
            projectList.setCodeHttpUrl(project.getCodeInfo().getCodeHttpUrl());
            projectList.setNameWithNamespace(project.getCodeInfo().getNameWithNamespace());
        }
        projectList.setUserDefineDockerfile(project.isUserDefineDockerfile());
        return projectList;
    }

    @Override
    public HttpResponseTemp<?> listCodeSourceInfo() {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(CodeManager.gitlab), 0);
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error, please check code configuration");
        }
        List<CodeSourceInfo> codeSourceInfos = codeApiInterface.listCodeInfo(user.getId());
        return ResultStat.OK.wrap(codeSourceInfos);
    }

    @Override
    public HttpResponseTemp<?> listSvnCodeSourceInfo() {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(CodeManager.subversion), 0);
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error, please check code configuration");
        }
        List<CodeSourceInfo> codeSourceInfos = codeApiInterface.listCodeInfo(user.getId());
        return ResultStat.OK.wrap(codeSourceInfos);
    }

    @Override
    public HttpResponseTemp<?> setGitlabInfo(GitlabUser gitlab) {
        if (gitlab == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "git lab info is null");
        }
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        gitlab.setUserId(user.getId());
        gitlab.setCreateTime(System.currentTimeMillis());
        GitlabUser oldGitlab = projectBiz.getGitlabInfoByUserIdAndName(gitlab.getUserId(), gitlab.getName());
        if (oldGitlab == null) {
            projectBiz.addGitlabInfo(gitlab);
        } else {
            gitlab.setId(oldGitlab.getId());
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(CodeManager.gitlab), gitlab.getId());
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.GITLAB_GLOBAL_INFO_NOT_EXIST, "get code api error, please check code configuration");
        }
        CodeSourceInfo codeSourceInfo = new CodeSourceInfo(gitlab.getId(), gitlab.getName(), codeApiInterface.getGitlabProjectInfos());

        OperationRecord record = new OperationRecord(gitlab.getId(), ResourceType.GITLAB, OperationType.SET,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(codeSourceInfo);
    }

    @Override
    public HttpResponseTemp<?> setSubversionInfo(SubversionUser subversion) {
        if (subversion == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "svn info is not null");
        }
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        subversion.setUserId(user.getId());
        subversion.setCreateTime(System.currentTimeMillis());
        SubversionUser oldSubversion = projectBiz.getSubversionInfoByUserIdAndSvnPath(user.getId(), subversion.getSvnPath());
        if (oldSubversion == null) {
            projectBiz.addSubversionInfo(subversion);
        } else {
            subversion.setId(oldSubversion.getId());
        }
        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(CodeManager.subversion), subversion.getId());
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error, please check code configuration");
        }
        CodeSourceInfo codeSourceInfo = new CodeSourceInfo(subversion.getId(), subversion.getName(),
                codeApiInterface.getSubversionProjectInfo(subversion.getId()));

        OperationRecord record = new OperationRecord(subversion.getId(), ResourceType.SUBVERSION, OperationType.SET,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(codeSourceInfo);
    }

    @Override
    public HttpResponseTemp<?> getProjectDockerfile(int projectId, String branch, String path) {
        checkGetable(projectId);

        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project == null) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_NOT_EXIST);
        }
        CodeConfiguration codeConfig = project.getCodeInfo();
        if (codeConfig == null) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_CODE_INFO_NOT_EXIST);
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()),
                codeConfig.getCodeManagerUserId());
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error");
        }
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        byte[] dockerfile = codeApiInterface.getDockerfile(codeConfig.getCodeId(), branch, path);
        if (dockerfile == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "dockerfile could not found");
        }
        return ResultStat.OK.wrap(new String(dockerfile));
    }

    @Override
    public HttpResponseTemp<?> getBranches(int projectId) {
        checkGetable(projectId);

        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project == null) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_NOT_EXIST);
        }
        CodeConfiguration codeConfig = project.getCodeInfo();
        if (codeConfig == null) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_CODE_INFO_NOT_EXIST);
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()),
                codeConfig.getCodeManagerUserId());
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error");
        }

        List<String> branches = codeApiInterface.getBranches(codeConfig.getCodeId());
        return ResultStat.OK.wrap(branches);
    }

    @Override
    public HttpResponseTemp<?> getReadme(int projectId, String branch) {
        checkGetable(projectId);

        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project == null) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_NOT_EXIST);
        }
        CodeConfiguration codeConfig = project.getCodeInfo();
        if (codeConfig == null) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_CODE_INFO_NOT_EXIST);
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()),
                codeConfig.getCodeManagerUserId());
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error");
        }

        byte[] readme = codeApiInterface.getReadme(codeConfig.getCodeId(), branch);
        if (readme != null) {
            return ResultStat.OK.wrap(new String(readme));
        } else {
            return ResultStat.OK.wrap(null);
        }
    }

    @Override
    public HttpResponseTemp<?> getTags(int projectId) {
        checkGetable(projectId);

        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project == null) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_NOT_EXIST);
        }
        CodeConfiguration codeConfig = project.getCodeInfo();
        if (codeConfig == null) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_CODE_INFO_NOT_EXIST);
        }

        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(codeConfig.getCodeManager()),
                codeConfig.getCodeManagerUserId());
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error");
        }

        List<String> branches = codeApiInterface.getTags(codeConfig.getCodeId());
        return ResultStat.OK.wrap(branches);
    }

    public void checkGetable(int id) {
        AuthUtil.verify(CurrentThreadInfo.getUserId(), id, ResourceType.PROJECT, OperationType.GET);
    }

    public void checkModifiable(int id) {
        AuthUtil.verify(CurrentThreadInfo.getUserId(), id, ResourceType.PROJECT, OperationType.MODIFY);
    }

    public void checkDeletable(int id) {
        AuthUtil.verify(CurrentThreadInfo.getUserId(), id, ResourceType.PROJECT, OperationType.DELETE);
    }
}
