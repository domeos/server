package org.domeos.framework.api.service.project.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.biz.project.ProjectCollectionBiz;
import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.consolemodel.project.CodeSourceInfo;
import org.domeos.framework.api.consolemodel.project.ProjectCollectionConsole;
import org.domeos.framework.api.consolemodel.project.ProjectConsole;
import org.domeos.framework.api.consolemodel.project.ProjectInfoConsole;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.CodeType;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.ProjectCollection;
import org.domeos.framework.api.model.project.SubversionUser;
import org.domeos.framework.api.model.project.related.AutoBuild;
import org.domeos.framework.api.model.project.related.CodeConfiguration;
import org.domeos.framework.api.model.project.related.CodeManager;
import org.domeos.framework.api.model.project.related.ProjectState;
import org.domeos.framework.api.service.project.ProjectService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.coderepo.CodeApiInterface;
import org.domeos.framework.engine.coderepo.ReflectFactory;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 */
@Service
public class ProjectServiceImpl implements ProjectService {

    private static Logger logger = LoggerFactory.getLogger(ProjectServiceImpl.class);

    @Autowired
    ProjectBiz projectBiz;
    @Autowired
    ProjectCollectionBiz projectCollectionBiz;
    @Autowired
    GlobalBiz globalBiz;
    @Autowired
    OperationHistory operationHistory;
    @Autowired
    CollectionBiz collectionBiz;

    private User getUser() {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        return user;
    }

    @Override
    public HttpResponseTemp<List<ProjectCollectionConsole>> listProjectCollection() {
        User user = getUser();
        Set<ProjectCollection> collectionSet = projectCollectionBiz.getCurrentUserProjectCollectionSet(user.getId());

        List<ProjectCollectionConsoleTask> consoleTasks = new ArrayList<>(collectionSet.size());
        for (ProjectCollection collection : collectionSet) {
            consoleTasks.add(new ProjectCollectionConsoleTask(collection, user.getId()));
        }
        List<ProjectCollectionConsole> result = ClientConfigure.executeCompletionService(consoleTasks);

        Collections.sort(result, new ProjectCollectionConsole.ProjectCollectionListComparator());
        return ResultStat.OK.wrap(result);
    }

    private class ProjectCollectionConsoleTask implements Callable<ProjectCollectionConsole> {
        private ProjectCollection collection;
        private int userId;

        public ProjectCollectionConsoleTask(ProjectCollection collection, int userId) {
            this.collection = collection;
            this.userId = userId;
        }

        @Override
        public ProjectCollectionConsole call() throws Exception {
            if (collection == null) {
                return null;
            }
            String name = AuthUtil.getUserNameById(collection.getCreatorId());
            List<CollectionAuthorityMap> collectionAuthorityMaps = collectionBiz.
                    getAuthoritiesByCollectionIdAndResourceType(collection.getId(), ResourceType.PROJECT_COLLECTION);
            List<CollectionResourceMap> collectionResourceMaps = collectionBiz.
                    getResourcesByCollectionIdAndResourceType(collection.getId(), ResourceType.PROJECT);
            ProjectCollectionConsole tmp = collection.createProjectCollectionList(name);
            if (collectionAuthorityMaps != null) {
                tmp.setMemberCount(collectionAuthorityMaps.size());
            }
            if (collectionResourceMaps != null) {
                tmp.setProjectCount(collectionResourceMaps.size());
            }
            Role role = AuthUtil.getUserRoleInResource(ResourceType.PROJECT_COLLECTION, tmp.getId(), userId);
            if (Role.GUEST.equals(role)) {
                tmp.setRole(Role.REPORTER);
            } else {
                tmp.setRole(role);
            }
            return tmp;
        }
    }

    @Override
    public HttpResponseTemp<ProjectCollectionConsole> addProjectCollection(ProjectCollectionConsole projectCollectionConsole) {
        if (projectCollectionConsole == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_COLLECTION_NOT_LEGAL, "information is null");
        }
        User user = getUser();

        String error = projectCollectionConsole.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_COLLECTION_NOT_LEGAL, error);
        }

        if (!projectCollectionBiz.checkProjectCollectionName(projectCollectionConsole.getName())) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_COLLECTION_EXISTED);
        }
        projectCollectionConsole.setCreatorInfo(new CreatorInfo().setName(user.getUsername()).setCreatorId(user.getId()));
        ProjectCollection projectCollection = projectCollectionConsole.createProjectCollection();

        projectCollectionBiz.addProjectCollection(projectCollection);
        projectCollectionConsole.setId(projectCollection.getId());
        projectCollectionConsole.setCreateTime(projectCollection.getCreateTime());

        // add to authority
        CollectionAuthorityMap authorityMap = new CollectionAuthorityMap();
        authorityMap.setResourceType(ResourceType.PROJECT_COLLECTION);
        authorityMap.setCollectionId(projectCollection.getId());
        authorityMap.setUserId(user.getId());
        authorityMap.setRole(Role.MASTER);
        authorityMap.setUpdateTime(System.currentTimeMillis());
        collectionBiz.addAuthority(authorityMap);

        OperationRecord record = new OperationRecord(projectCollection.getId(), ResourceType.PROJECT_COLLECTION, OperationType.SET,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(projectCollectionConsole);
    }

    @Override
    public HttpResponseTemp<ProjectCollectionConsole> updateProjectCollection(ProjectCollectionConsole projectCollection) {
        if (projectCollection == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_COLLECTION_NOT_LEGAL, "project collection is null");
        }
        User user = getUser();

        AuthUtil.collectionVerify(user.getId(), projectCollection.getId(), ResourceType.PROJECT_COLLECTION, OperationType.MODIFY, -1);

        String error = projectCollection.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_COLLECTION_NOT_LEGAL, error);
        }

        ProjectCollection collection = projectCollectionBiz.getById(ProjectCollectionBiz.PROJECT_COLLECTION,
                projectCollection.getId(), ProjectCollection.class);
        if (collection == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_COLLECTION_NOT_LEGAL, "no such project collection in database");
        }

        // only description and collectionstate can be changed
        // project name is related with docker image name
        collection.setDescription(projectCollection.getDescription());
        collection.setProjectCollectionState(projectCollection.getProjectCollectionState());
        projectCollectionBiz.updateProjectCollection(collection);

        OperationRecord record = new OperationRecord(projectCollection.getId(), ResourceType.PROJECT_COLLECTION, OperationType.MODIFY,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(projectCollection);
    }

    @Override
    public HttpResponseTemp<?> deleteProjectCollection(int id) {
        User user = getUser();
        AuthUtil.collectionVerify(user.getId(), id, ResourceType.PROJECT_COLLECTION, OperationType.DELETE, -1);

        List<CollectionResourceMap> resourceList = collectionBiz.getResourcesByCollectionIdAndResourceType(id, ResourceType.PROJECT);
        if (resourceList != null) {
            // delete all projects here, but remain docker image in private registry
            for (CollectionResourceMap tmp : resourceList) {
                projectBiz.removeById(GlobalConstant.PROJECT_TABLE_NAME, tmp.getResourceId());
            }
            // delete collection resource map info
            collectionBiz.deleteResourcesByCollectionIdAndResourceType(id, ResourceType.PROJECT);
        }
        projectCollectionBiz.deleteProjectCollection(id);
        collectionBiz.deleteAuthoritiesByCollectionIdAndResourceType(id, ResourceType.PROJECT_COLLECTION);

        OperationRecord record = new OperationRecord(id, ResourceType.PROJECT_COLLECTION, OperationType.DELETE,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return null;
    }

    @Override
    public HttpResponseTemp<ProjectCollectionConsole> getProjectCollection(int id) {
        User user = getUser();
        AuthUtil.collectionVerify(user.getId(), id, ResourceType.PROJECT_COLLECTION, OperationType.GET, -1);

        ProjectCollection collection = projectCollectionBiz.getById(ProjectCollectionBiz.PROJECT_COLLECTION, id, ProjectCollection.class);

        if (collection == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_COLLECTION_NOT_LEGAL, "no such project collection in database");
        }

        String name = AuthUtil.getUserNameById(collection.getCreatorId());
        List<CollectionAuthorityMap> collectionAuthorityMaps = collectionBiz.
                getAuthoritiesByCollectionIdAndResourceType(collection.getId(), ResourceType.PROJECT_COLLECTION);
        List<CollectionResourceMap> collectionResourceMaps = collectionBiz.
                getResourcesByCollectionIdAndResourceType(collection.getId(), ResourceType.PROJECT);
        ProjectCollectionConsole tmp = collection.createProjectCollectionList(name);
        if (collectionAuthorityMaps != null) {
            tmp.setMemberCount(collectionAuthorityMaps.size());
        }
        if (collectionResourceMaps != null) {
            tmp.setProjectCount(collectionResourceMaps.size());
        }
        Role role = AuthUtil.getUserRoleInResource(ResourceType.PROJECT_COLLECTION, tmp.getId(), user.getId());
        if (Role.GUEST.equals(role)) {
            tmp.setRole(Role.REPORTER);
        } else {
            tmp.setRole(role);
        }
        return ResultStat.OK.wrap(tmp);
    }

    @Override
    public HttpResponseTemp<ProjectConsole> createProject(int collectionId, Project project) {
        if (project == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_NOT_LEGAL, "project info is null");
        }
        User user = getUser();
        checkSetable(user.getId(), collectionId);

        String error = project.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_NOT_LEGAL, error);
        }

        String collectionName = projectCollectionBiz.getNameById(ProjectCollectionBiz.PROJECT_COLLECTION, collectionId);

        if (collectionName == null || !collectionName.equals(project.getName().split("/")[0])) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_NOT_LEGAL, "project name must be [collection_name]/[name]");
        }
        if (!projectBiz.checkProjectName(project.getName())) {
            throw ApiException.wrapResultStat(ResultStat.PROJECT_EXISTED);
        }

        project.setCreateTime(System.currentTimeMillis());
        project.setState(ProjectState.active.name());

        setWebHook(project);

        projectBiz.addProject(project);

        CollectionResourceMap resourceMap = new CollectionResourceMap();
        resourceMap.setResourceId(project.getId());
        resourceMap.setCreatorId(user.getId());
        resourceMap.setCollectionId(collectionId);
        resourceMap.setResourceType(ResourceType.PROJECT);
        resourceMap.setUpdateTime(System.currentTimeMillis());
        collectionBiz.addResource(resourceMap);

        OperationRecord record = new OperationRecord(project.getId(), ResourceType.PROJECT, OperationType.SET,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        ProjectConsole projectConsole = new ProjectConsole();
        projectConsole.setCreatorInfo(new CreatorInfo().setCreatorId(user.getId()).setName(user.getUsername()));
        projectConsole.setProject(project);
        return ResultStat.OK.wrap(projectConsole);
    }

    @Override
    public HttpResponseTemp<?> deleteProject(int projectId) {
        User user = getUser();
        checkProjectDeletable(user.getId(), projectId);
        projectBiz.removeById(GlobalConstant.PROJECT_TABLE_NAME, projectId);

        collectionBiz.deleteResourceByResourceIdAndResourceType(projectId, ResourceType.PROJECT);

        OperationRecord record = new OperationRecord(projectId, ResourceType.PROJECT, OperationType.DELETE,
                CurrentThreadInfo.getUserId(), CurrentThreadInfo.getUserName(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<ProjectConsole> modifyProject(Project project) {
        if (project == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_NOT_LEGAL, "project info is null");
        }

        User user = getUser();
        checkProjectModifiable(user.getId(), project.getId());

        String error = project.checkLegality();
        if (!StringUtils.isBlank(error)) {
            return ResultStat.PROJECT_NOT_LEGAL.wrap(null, error);
        }

        projectBiz.updateProjectById(project);
        setWebHook(project);

        OperationRecord record = new OperationRecord(project.getId(), ResourceType.PROJECT, OperationType.MODIFY,
                CurrentThreadInfo.getUserId(), CurrentThreadInfo.getUserName(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(null);
    }

    private void setWebHook(Project project) {
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
    }

    @Override
    public HttpResponseTemp<ProjectConsole> getProject(int projectId) {
        User user = getUser();
        checkProjectGetable(user.getId(), projectId);
        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        ProjectConsole projectConsole = new ProjectConsole();
        projectConsole.setProject(project);
        projectConsole.setCreatorInfo(getProjectcreator(projectId));
        return ResultStat.OK.wrap(projectConsole);
    }

    @Override
    public HttpResponseTemp<List<ProjectInfoConsole>> listProjectInfo(int collectionId) {
        User user = getUser();
        AuthUtil.collectionVerify(user.getId(), collectionId, ResourceType.PROJECT_COLLECTION, OperationType.GET, -1);

        List<CollectionResourceMap> resourceMaps = collectionBiz.getResourcesByCollectionIdAndResourceType(collectionId, ResourceType.PROJECT);
        List<ProjectInfoConsole> projectInfoConsoleInfo = null;
        if (resourceMaps != null) {
            List<Project> projects = projectBiz.getListByCollections(GlobalConstant.PROJECT_TABLE_NAME, resourceMaps, Project.class);
            Set<ProjectInfoConsole> projectListSet;
            if (projects.size() > GlobalConstant.PROJECT_LIST_SIZE) {
                projectListSet = new CopyOnWriteArraySet<>();
                parallzieGenerate(projectListSet, projects);
            } else {
                projectListSet = new HashSet<>();
                orderGenerate(projectListSet, projects);
            }
            projectInfoConsoleInfo = new ArrayList<>(projectListSet);
            Collections.sort(projectInfoConsoleInfo, new ProjectInfoConsole.ProjectListComparator());
        }
        return ResultStat.OK.wrap(projectInfoConsoleInfo);
    }

    private void parallzieGenerate(Set<ProjectInfoConsole> set, List<Project> projects) {
        List<GetProjectInfoConsoleTask> projectInfoConsoleTasks = new LinkedList<>();
        for (Project project : projects) {
            projectInfoConsoleTasks.add(new GetProjectInfoConsoleTask(set, project));
        }
        ClientConfigure.executeCompletionService(projectInfoConsoleTasks);
    }

    private class GetProjectInfoConsoleTask implements Callable<ProjectInfoConsole> {
        private Set<ProjectInfoConsole> set;
        private Project project;

        public GetProjectInfoConsoleTask(Set<ProjectInfoConsole> set, Project project) {
            this.set = set;
            this.project = project;
        }

        @Override
        public ProjectInfoConsole call() throws Exception {
            ProjectInfoConsole projectList = generateProjectInfoConsole(project);
            set.add(projectList);
            return null;
        }
    }

    private void orderGenerate(Set<ProjectInfoConsole> set, List<Project> projects) {
        for (Project project : projects) {
            ProjectInfoConsole projecConsole = generateProjectInfoConsole(project);
            set.add(projecConsole);
        }
    }

    private ProjectInfoConsole generateProjectInfoConsole(Project project) {
        BuildHistory buildHistory = projectBiz.getLatestBuildHistoryByProjectId(project.getId());
        ProjectInfoConsole projectInfoConsole = new ProjectInfoConsole();
        projectInfoConsole.setId(project.getId());
        projectInfoConsole.setName(project.getName());
        if (buildHistory != null) {
            projectInfoConsole.setBuildTime(buildHistory.getCreateTime());
            projectInfoConsole.setBuildStatus(buildHistory.getState());
        }
        if (project.getCodeInfo() != null) {
            projectInfoConsole.setCodeSshUrl(project.getCodeInfo().getCodeSshUrl());
            projectInfoConsole.setCodeManager(project.getCodeInfo().getCodeManager());
            projectInfoConsole.setCodeHttpUrl(project.getCodeInfo().getCodeHttpUrl());
            projectInfoConsole.setNameWithNamespace(project.getCodeInfo().getNameWithNamespace());
        }
        if (project.getExclusiveBuild() != null) {
            projectInfoConsole.setProjectType(project.getExclusiveBuild().getCustomType());
        } else if (project.getCustomDockerfile() != null) {
            projectInfoConsole.setProjectType("dockerfileuserdefined");
        } else if (project.getDockerfileInfo() != null) {
            projectInfoConsole.setProjectType("dockerfileincode");
        } else {
            projectInfoConsole.setProjectType("commonconfig");
        }
        AutoBuild info = project.getAutoBuildInfo();
        if (info != null && (info.getTag() > 0 || info.getBranches().size() > 0)) {
            projectInfoConsole.setAutoBuild(true);
        } else {
            projectInfoConsole.setAutoBuild(false);
        }
        projectInfoConsole.setUserDefineDockerfile(project.isUserDefineDockerfile());
        projectInfoConsole.setCreateTime(project.getCreateTime());
        return projectInfoConsole;
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
    public HttpResponseTemp<?> listCodeSourceInfo(int gitlabId) {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(CodeType.getTypeByName(CodeManager.gitlab), 0);
        if (codeApiInterface == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error, please check code configuration");
        }
        List<CodeSourceInfo> codeSourceInfos = codeApiInterface.listCodeInfo(user.getId(), gitlabId);
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
        GitlabUser oldGitlab = projectBiz.getGitlabInfoByUserIdNameAndGitlabId(gitlab.getUserId(),
                gitlab.getName(), gitlab.getGitlabId());
        if (oldGitlab == null) {
            projectBiz.addGitlabInfo(gitlab);
        } else {
            gitlab.setId(oldGitlab.getId());
            projectBiz.updateGitlabInfo(gitlab);
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
        User user = getUser();
        checkProjectGetable(user.getId(), projectId);

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
        User user = getUser();
        checkProjectGetable(user.getId(), projectId);

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
    public HttpResponseTemp<?> getBranches(CodeConfiguration codeConfig) {

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
        User user = getUser();
        checkProjectGetable(user.getId(), projectId);

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
        User user = getUser();
        checkProjectGetable(user.getId(), projectId);

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

    @Override
    public HttpResponseTemp<?> getTags(CodeConfiguration codeConfig) {

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

    @Override
    public HttpResponseTemp<String> getProjectCollectionNameById(int collectionId) {
        User user = getUser();
        checkGetable(user.getId(), collectionId);
        String name = projectCollectionBiz.getNameById(ProjectCollectionBiz.PROJECT_COLLECTION, collectionId);
        if (StringUtils.isBlank(name)) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such project collection!");
        }
        return ResultStat.OK.wrap(name);
    }

    @Override
    public HttpResponseTemp<?> changeCreator(int id, CreatorInfo newCreatorInfo) {
        User user = getUser();
        if (newCreatorInfo == null || newCreatorInfo.getCreatorId() < 0 || StringUtils.isBlank(newCreatorInfo.getName())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "new creator is null, id and name must be set!");
        }

        CreatorInfo creatorInfo = getProjectcreator(id);
        if (!AuthUtil.isAdmin(user.getId()) && user.getId() != creatorInfo.getCreatorId()) {
            throw new PermitException("You cannot do this, only admin and " + creatorInfo.getName() + " can modify creator");
        }

        String name = AuthUtil.getUserNameById(newCreatorInfo.getCreatorId());
        if (!newCreatorInfo.getName().equals(name)) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "user name not match, no such user in database!");
        }

        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, id, Project.class);
        if (project == null) {
            return ResultStat.OK.wrap(null);
        }
        CodeConfiguration codeConfiguration = project.getCodeInfo();
        if (codeConfiguration != null) {
            // check new creator for gitlab permission
            GitlabUser oldGitlabUser = projectBiz.getGitlabUserById(codeConfiguration.getCodeManagerUserId());
            GitlabUser gitlabUser = projectBiz.getGitlabInfoByUserIdNameAndGitlabId(newCreatorInfo.getCreatorId(),
                    CommonUtil.getNameWithoutSuffix(name), oldGitlabUser.getGitlabId());
            if (gitlabUser == null) {
                throw ApiException.wrapMessage(ResultStat.NO_USER_CORRELATION, "no gitlab information for user: " + name);
            }
            CodeApiInterface codeApiInterface = ReflectFactory.createCodeApiInterface(
                    CodeType.getTypeByName(codeConfiguration.getCodeManager()), gitlabUser.getId());
            if (codeApiInterface == null) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "get code api error");
            }

            if (codeApiInterface.checkProjectPermission(codeConfiguration.getCodeId())) {
                project.getCodeInfo().setCodeManagerUserId(gitlabUser.getId());
                projectBiz.updateProjectById(project);

            } else {
                throw ApiException.wrapMessage(ResultStat.USER_PERMISSION_ERROR, "new user must be master in this gitlab project, check "
                        + codeConfiguration.getCodeHttpUrl());
            }
        }
        // just change creator.
        collectionBiz.updateResourceCreatorByResourceIdAndResourceType(id, ResourceType.PROJECT, newCreatorInfo.getCreatorId());
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> modifyGitlabInfo(int projectId, CodeConfiguration codeInfo) {
        User user = getUser();

        if (codeInfo == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "code info must be set");
        }
        checkProjectModifiable(user.getId(), projectId);

        Project project = projectBiz.getById(GlobalConstant.PROJECT_TABLE_NAME, projectId, Project.class);
        if (project == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such project in database");
        }
        CodeConfiguration oldConfigure = project.getCodeInfo();
        if (oldConfigure == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "this project do not have code info!");
        }
        oldConfigure.setCodeHttpUrl(codeInfo.getCodeHttpUrl());
        oldConfigure.setCodeSshUrl(codeInfo.getCodeSshUrl());
        projectBiz.updateProjectById(project);

        OperationRecord record = new OperationRecord(projectId, ResourceType.PROJECT, OperationType.MODIFY,
                user.getId(), user.getUsername(), "OK", "modify project code info", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return ResultStat.OK.wrap(null);
    }

    private CreatorInfo getProjectcreator(int id) {
        CollectionResourceMap resourceMap = collectionBiz.getResourceByResourceIdAndResourceType(id, ResourceType.PROJECT);
        if (resourceMap == null) {
            throw ApiException.wrapMessage(ResultStat.PROJECT_COLLECTION_NOT_LEGAL, "could not find creator info");
        }

        String name = AuthUtil.getUserNameById(resourceMap.getCreatorId());
        return new CreatorInfo().setCreatorId(resourceMap.getCreatorId()).setName(name);
    }

    private void checkProjectGetable(int userId, int resourceId) {
        AuthUtil.verify(userId, resourceId, ResourceType.PROJECT, OperationType.GET);
    }

    private void checkProjectModifiable(int userId, int resourceId) {
        AuthUtil.verify(userId, resourceId, ResourceType.PROJECT, OperationType.MODIFY);
    }

    private void checkProjectDeletable(int userId, int resourceId) {
        AuthUtil.verify(userId, resourceId, ResourceType.PROJECT, OperationType.DELETE);
    }

    private void checkSetable(int userId, int collectionId) {
        AuthUtil.collectionVerify(userId, collectionId, ResourceType.PROJECT_COLLECTION, OperationType.SET, -1);
    }

    private void checkGetable(int userId, int collectionId) {
        AuthUtil.collectionVerify(userId, collectionId, ResourceType.PROJECT_COLLECTION, OperationType.GET, -1);
    }
}
