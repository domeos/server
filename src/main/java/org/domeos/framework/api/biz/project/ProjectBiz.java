package org.domeos.framework.api.biz.project;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.api.model.ci.related.ProjectRsakeyMap;
import org.domeos.framework.api.model.ci.related.RSAKeyPair;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.SubversionUser;

import java.util.List;

/**
 * Created by sparkchen on 16/4/5.
 */
public interface ProjectBiz extends BaseBiz {

    String PROJECTRSAMAP_TABLE_NAME = "project_rsakey_map";

    void insertRowForRsaKeypair(RSAKeyPair item);

    void updateBuildHistory(BuildHistory item);

    boolean checkProjectName(String name);

    Project getProjectByName(String name);

    void addProject(Project project);

    void updateProjectById(Project project);

    List<Project> listAuthoritiedProjects();

    /**
     * Get user's projects by user's id
     * @param userId user's id
     * @return
     */
    List<Project> listProjectsByUserId(int userId);

    /**
     * Get all projects
     * @return
     */
    List<Project> listAllProjects();

    BuildHistory getLatestBuildHistoryByProjectId(int id);

    GitlabUser getGitlabInfoByUserIdNameAndGitlabId(int id, String name, int gitlabId);

    void addGitlabInfo(GitlabUser gitlab);

    void updateGitlabInfo(GitlabUser gitlab);

    SubversionUser getSubversionInfoByUserIdAndSvnPath(int id, String svnPath);

    void addSubversionInfo(SubversionUser subversion);

    String getSecretById(int buildId);

    List<Project> getAllProjects();

    String getDockerfileByBuildId(int buildId);

    SubversionUser getSubversionInfoById(int codeId);

    RSAKeyPair getRSAKeyPairByProjectId(int id);

    ProjectRsakeyMap getRSAKeypairMapByProjectId(int id);

    void deleteRSAKeypairMapByProjectId(int id);

    void addProjectRsaMap(ProjectRsakeyMap projectRsakeyMap);

    void addBuildHistory(BuildHistory buildInfo);

    void setTaskNameAndStatus(BuildHistory buildInfo);

    void insertBuildLogById(int id, byte[] bytes);

    String getBuildLogById(int buildId);

    List<BuildHistory> getBuildHistoryByProjectId(int projectId);

    void setHistoryStatus(int id, BuildState state);

    List<BuildHistory> getUnGCBuildHistory();

    void updateBuildGCInfoById(BuildHistory info);

    List<GitlabUser> getGitlabInfoByUserId(int userId);

    List<GitlabUser> getGitlabInfoByUserIdAndGitlabId(int userId, int gitlabId);

    GitlabUser getGitlabUserById(int id);

    List<GitlabUser> getGitlabUserByGitlabId(int id);

//    RSAKeyPair getRSAKeyPairByKeyId(int deployId);

    String getBuildTaskNameById(int buildId);

    BuildHistory getBuildHistoryById(int buildId);

    Project getProjectByBuildId(int buildId);

    int getBuildHistoryCountsByProjectId(int projectId);

    List<BuildHistory> getBuildHistoryPageByProjectId(int projectId, int start, int count);

    List<BuildHistory> listRecentHistoryByProjectCollectionIdsTime(String idList, long createTime);

    List<BuildHistory> listRecentHistoryAllProjectsIncludeRemovedByTime(long createTime);
}
