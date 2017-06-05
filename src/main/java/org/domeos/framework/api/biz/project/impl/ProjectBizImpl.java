package org.domeos.framework.api.biz.project.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.biz.project.ProjectCollectionBiz;
import org.domeos.framework.api.mapper.domeos.collection.CollectionResourceMapMapper;
import org.domeos.framework.api.mapper.domeos.project.*;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.api.model.ci.related.ProjectRsakeyMap;
import org.domeos.framework.api.model.ci.related.RSAKeyPair;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.ProjectCollection;
import org.domeos.framework.api.model.project.SubversionUser;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;
import java.util.Set;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Service("projectBiz")
public class ProjectBizImpl extends BaseBizImpl implements ProjectBiz {
    @Autowired
    ProjectMapper projectMapper;
    @Autowired
    BuildHistoryMapper buildHistoryMapper;
    @Autowired
    GitlabUserMapper gitlabUserMapper;
    @Autowired
    SubversionUserMapper subversionUserMapper;
    @Autowired
    ProjectRsakeyMapMapper projectRsakeyMapMapper;
    @Autowired
    ProjectCollectionBiz projectCollectionBiz;
    @Autowired
    CollectionResourceMapMapper collectionResourceMapMapper;

    @Override
    public void insertRowForRsaKeypair(RSAKeyPair item) {
        projectRsakeyMapMapper.insertRsaKeypair(item, item.toString());
    }

    @Override
    public void updateBuildHistory(BuildHistory item) {
        buildHistoryMapper.updateBuildHistory(new RowMapperDao(item));
    }

    @Override
    public boolean checkProjectName(String name) {
        // true for check pass, false for check fail
        int count = projectMapper.checkProjectName(name);
        return count == 0;
    }

    @Override
    public Project getProjectByName(String name) {
        return this.getByName(GlobalConstant.PROJECT_TABLE_NAME, name, Project.class);
    }

    @Override
    public void addProject(Project project) {
        projectMapper.insertRowForProject(project, project.toString());
    }

    @Override
    public void updateProjectById(Project project) {
        projectMapper.updateProject(project, project.toString());
    }

    @Override
    public List<Project> listAuthoritiedProjects() {
        List<RowMapperDao> data = projectMapper.getAuthoritiedProjects();
        if (data == null) {
            return null;
        }
        List<Project> projects = new LinkedList<>();
        for (RowMapperDao tmp : data) {
            Project project = checkResult(tmp, Project.class);
            projects.add(project);
        }
        return projects;
    }

    @Override
    public List<Project> listProjectsByUserId(int userId) {
        Set<ProjectCollection> collectionSet = projectCollectionBiz.getCurrentUserProjectCollectionSet(userId);
        StringBuilder collectionIds = new StringBuilder("(");
        for (ProjectCollection collection : collectionSet) {
            if (collectionIds.length() != 1) {
                collectionIds.append(",");
            }
            collectionIds.append(collection.getId());
        }
        collectionIds.append(")");
        List<CollectionResourceMap> mapList = collectionResourceMapMapper.getResourcesByIdList(ResourceType.PROJECT, collectionIds.toString());

        StringBuilder projectIds = new StringBuilder();
        for (CollectionResourceMap map : mapList) {
            if (projectIds.length() != 0) {
                projectIds.append(",");
            }
            projectIds.append(map.getResourceId());
        }

        return projectMapper.listProjectsByIdList(projectIds.toString());
    }

    @Override
    public List<Project> listAllProjects() {
        List<RowMapperDao> data = projectMapper.getAllProjects();
        if (data == null) {
            return null;
        }
        List<Project> projects = new LinkedList<>();
        for (RowMapperDao tmp : data) {
            Project project = checkResult(tmp, Project.class);
            projects.add(project);
        }
        return projects;
    }

    @Override
    public BuildHistory getLatestBuildHistoryByProjectId(int projectId) {
        return buildHistoryMapper.getLatestBuildInfo(projectId);
    }

    @Override
    public GitlabUser getGitlabInfoByUserIdNameAndGitlabId(int id, String name, int gitlabId) {
        return gitlabUserMapper.getGitlabInfoByUserIdNameAndGitlabId(id, name, gitlabId);
    }

    @Override
    public void addGitlabInfo(GitlabUser gitlab) {
        gitlabUserMapper.addGitlabInfo(gitlab);
    }

    @Override
    public void updateGitlabInfo(GitlabUser gitlab) {
        gitlabUserMapper.updateGitlabToken(gitlab);
    }

    @Override
    public SubversionUser getSubversionInfoByUserIdAndSvnPath(int id, String svnPath) {
        return subversionUserMapper.getSubversionInfoByUserIdAndSvnPath(id, svnPath);
    }

    @Override
    public void addSubversionInfo(SubversionUser subversion) {
        subversionUserMapper.addSubversionInfo(subversion);
    }

    @Override
    public String getSecretById(int buildId) {
        return buildHistoryMapper.getSecretById(buildId);
    }

    @Override
    public List<Project> getAllProjects() {
        List<RowMapperDao> data = projectMapper.getAllProjects();
        List<Project> projects = new LinkedList<>();
        if (data != null) {
            for (RowMapperDao tmp : data) {
                Project project = checkResult(tmp, Project.class);
                projects.add(project);
            }
        }
        return projects;
    }

    @Override
    public String getDockerfileByBuildId(int buildId) {
        return buildHistoryMapper.getDockerfileContentById(buildId);
    }

    @Override
    public SubversionUser getSubversionInfoById(int codeId) {
        return subversionUserMapper.getSubversionInfoById(codeId);
    }

    @Override
    public RSAKeyPair getRSAKeyPairByProjectId(int id) {
        ProjectRsakeyMap projectRsakeyMap = projectRsakeyMapMapper.getRSAKeypairMapByProjectId(id);
        if (projectRsakeyMap != null) {
            return getById(GlobalConstant.RSAKEYPAIR_TABLE_NAME, id, RSAKeyPair.class);
        }
        return null;
    }

    @Override
    public ProjectRsakeyMap getRSAKeypairMapByProjectId(int id) {
        return projectRsakeyMapMapper.getRSAKeypairMapByProjectId(id);
    }

    @Override
    public void deleteRSAKeypairMapByProjectId(int id) {
        projectRsakeyMapMapper.deleteRSAKeypairMapByProjectId(id);
    }

    @Override
    public void addProjectRsaMap(ProjectRsakeyMap projectRsakeyMap) {
        projectRsakeyMapMapper.addProjectRsaMap(projectRsakeyMap);
    }

    @Override
    public void addBuildHistory(BuildHistory buildInfo) {
        buildHistoryMapper.insertRow(buildInfo, buildInfo.toString());
    }

    @Override
    public void setTaskNameAndStatus(BuildHistory buildInfo) {
        buildHistoryMapper.addTaskNameAndStatus(buildInfo, buildInfo.toString());
    }

    @Override
    public void insertBuildLogById(int id, byte[] bytes) {
        buildHistoryMapper.insertLogById(id, bytes);
    }

    @Override
    public String getBuildLogById(int buildId) {
        return buildHistoryMapper.getLogById(buildId);
    }

    @Override
    public List<BuildHistory> getBuildHistoryByProjectId(int projectId) {
        List<RowMapperDao> data = buildHistoryMapper.getBuildHistoryByProjectId(projectId);
        if (data == null) {
            return null;
        }
        List<BuildHistory> histories = new LinkedList<>();
        for (RowMapperDao tmp : data) {
            BuildHistory history = checkResult(tmp, BuildHistory.class);
            histories.add(history);
        }
        return histories;
    }

    @Override
    public void setHistoryStatus(int id, BuildState state) {
        buildHistoryMapper.setHistoryStatus(id, state);
    }

    @Override
    public List<BuildHistory> getUnGCBuildHistory() {
        List<RowMapperDao> data = buildHistoryMapper.getAllHistory();
        if (data == null) {
            return null;
        }
        List<BuildHistory> buildHistories = new LinkedList<>();
        for (RowMapperDao tmp : data) {
            BuildHistory buildHistory = checkResult(tmp, BuildHistory.class);
            if (buildHistory.getIsGC() == 0) {
                if (buildHistory.getTaskName() == null) {
                    buildHistory.setTaskName(buildHistoryMapper.getBuildTaskNameById(buildHistory.getId()));
                }
                buildHistories.add(buildHistory);
            }
        }
        return buildHistories;
    }

    @Override
    public void updateBuildGCInfoById(BuildHistory info) {
        buildHistoryMapper.updateBuildHistory(new RowMapperDao(info));
    }

    @Override
    public List<GitlabUser> getGitlabInfoByUserId(int userId) {
        return gitlabUserMapper.getGitlabInfoByUserId(userId);
    }

    @Override
    public List<GitlabUser> getGitlabInfoByUserIdAndGitlabId(int userId, int gitlabId) {
        return gitlabUserMapper.getGitlabInfoByUserIdAndGitlabId(userId, gitlabId);
    }

    @Override
    public GitlabUser getGitlabUserById(int id) {
        return gitlabUserMapper.getGitlabInfoById(id);
    }

    @Override
    public List<GitlabUser> getGitlabUserByGitlabId(int gitlabId) {
        return gitlabUserMapper.getGitlabInfoByGitlabId(gitlabId);
    }

//    @Override
//    public RSAKeyPair getRSAKeyPairByKeyId(int deployId) {
//
//        return null;
//    }

    @Override
    public String getBuildTaskNameById(int buildId) {
        return buildHistoryMapper.getBuildTaskNameById(buildId);
    }

    @Override
    public BuildHistory getBuildHistoryById(int buildId) {
        return getById(GlobalConstant.BUILDHISTORY_TABLE_NAME, buildId, BuildHistory.class);
    }

    @Override
    public Project getProjectByBuildId(int buildId) {
        BuildHistory buildHistory = getById(GlobalConstant.BUILDHISTORY_TABLE_NAME, buildId, BuildHistory.class);
        if (buildHistory != null) {
            return getById(GlobalConstant.PROJECT_TABLE_NAME, buildHistory.getProjectId(), Project.class);
        }
        return null;
    }

    @Override
    public int getBuildHistoryCountsByProjectId(int projectId) {
        return buildHistoryMapper.getCountsByProjectId(projectId);
    }

    @Override
    public List<BuildHistory> getBuildHistoryPageByProjectId(int projectId, int start, int count) {
        List<RowMapperDao> data = buildHistoryMapper.getPageByProjectId(projectId, start, count);
        if (data == null) {
            return null;
        }
        List<BuildHistory> histories = new LinkedList<>();
        for (RowMapperDao tmp : data) {
            BuildHistory history = checkResult(tmp, BuildHistory.class);
            histories.add(history);
        }
        return histories;
    }

    @Override
    public List<BuildHistory> listRecentHistoryByProjectCollectionIdsTime(String idList, long createTime) {
        List<RowMapperDao> data = buildHistoryMapper.listRecentHistoryByProjectCollectionIdsTime(idList, createTime);
        if (data == null) {
            return null;
        }
        List<BuildHistory> histories = new LinkedList<>();
        for (RowMapperDao tmp : data) {
            BuildHistory history = checkResult(tmp, BuildHistory.class);
            histories.add(history);
        }
        return histories;
    }

    @Override
    public List<BuildHistory> listRecentHistoryAllProjectsIncludeRemovedByTime(long createTime) {
        List<RowMapperDao> data = buildHistoryMapper.listRecentHistoryAllProjectsIncludeRemovedByTime(createTime);
        if (data == null) {
            return null;
        }
        List<BuildHistory> histories = new LinkedList<>();
        for (RowMapperDao tmp : data) {
            BuildHistory history = checkResult(tmp, BuildHistory.class);
            histories.add(history);
        }
        return histories;
    }
}
