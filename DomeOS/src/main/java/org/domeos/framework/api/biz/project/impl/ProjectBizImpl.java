package org.domeos.framework.api.biz.project.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.mapper.project.*;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.api.model.ci.related.ProjectRsakeyMap;
import org.domeos.framework.api.model.ci.related.RSAKeyPair;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.SubversionUser;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

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
    public boolean isAuthorited(int resourceId) {
        Integer authority = projectMapper.getAuthoriy(resourceId);
        return authority != null && authority > 0;
    }

    @Override
    public Project getProjectByName(String name) {
        return this.getByName(GlobalConstant.projectTableName, name, Project.class);
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
    public BuildHistory getLatestBuildHistoryByProjectId(int projectId) {
        return buildHistoryMapper.getLatestBuildInfo(projectId);
    }

    @Override
    public GitlabUser getGitlabInfoByUserIdAndName(int id, String name) {
        return gitlabUserMapper.getGitlabInfoByUserIdAndName(id, name);
    }

    @Override
    public void addGitlabInfo(GitlabUser gitlab) {
        gitlabUserMapper.addGitlabInfo(gitlab);
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
            return getById(GlobalConstant.rsaKeypairTableName, id, RSAKeyPair.class);
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
    public void setTaskNameAndStatus(int id, String name, BuildState send) {
        buildHistoryMapper.addTaskNameAndStatus(id, name, send);
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
        return null;
    }

    @Override
    public void updateBuildGCInfoById(BuildHistory info) {

    }

    @Override
    public List<GitlabUser> getGitlabInfoByUserId(int userId) {
        return gitlabUserMapper.getGitlabInfoByUserId(userId);
    }

    @Override
    public GitlabUser getGitlabIserById(int id) {
        return gitlabUserMapper.getGitlabInfoById(id);
    }

    @Override
    public RSAKeyPair getRSAKeyPairByKeyId(int deployId) {

        return null;
    }

    @Override
    public String getBuildTaskNameById(int buildId) {
        return buildHistoryMapper.getBuildTaskNameById(buildId);
    }
}
