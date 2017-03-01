package org.domeos.framework.api.service.project;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.consolemodel.project.ProjectCollectionConsole;
import org.domeos.framework.api.consolemodel.project.ProjectConsole;
import org.domeos.framework.api.consolemodel.project.ProjectInfoConsole;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.SubversionUser;
import org.domeos.framework.api.model.project.related.CodeConfiguration;

import java.util.List;

/**
 */
public interface ProjectService {
    /**
     * @return
     */
    HttpResponseTemp<List<ProjectCollectionConsole>> listProjectCollection();

    /**
     * @param projectCollection
     * @return
     */
    HttpResponseTemp<ProjectCollectionConsole> addProjectCollection(ProjectCollectionConsole projectCollection);

    /**
     * @param projectCollection
     * @return
     */
    HttpResponseTemp<ProjectCollectionConsole> updateProjectCollection(ProjectCollectionConsole projectCollection);

    /**
     * @param id
     * @return
     */
    HttpResponseTemp<?> deleteProjectCollection(int id);

    /**
     *
     */
    HttpResponseTemp<ProjectCollectionConsole> getProjectCollection(int id);

    /**
     * put project info into database
     *
     *
     * @param collectionId
     * @param project is parameter from front pages
     * @return
     */
    HttpResponseTemp<ProjectConsole> createProject(int collectionId, Project project);

    /**
     * delete project info from database by project id
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> deleteProject(int id);

    /**
     * modify project info in database by id
     *
     *
     * @param project
     * @return
     */
    HttpResponseTemp<ProjectConsole> modifyProject(Project project);

    /**
     * get project info from database by project id
     *
     *
     * @param projectId @return
     */
    HttpResponseTemp<ProjectConsole> getProject(int projectId);

    /**
     * list project info in database
     * this will return latest build info
     *
     * @return
     * @param collectionId
     */
    HttpResponseTemp<List<ProjectInfoConsole>> listProjectInfo(int collectionId);

    /**
     * list gitlab info in database
     *
     * @return
     */
    HttpResponseTemp<?> listCodeSourceInfo();

    HttpResponseTemp<?> listCodeSourceInfo(int gitlabId);

    /**
     * list subversion info in database
     *
     * @return
     */
    HttpResponseTemp<?> listSvnCodeSourceInfo();

    /**
     * put gitlab info into database
     * this is for a user and his specific token info
     *
     * @param gitlabUser
     * @return
     */

    HttpResponseTemp<?> setGitlabInfo(GitlabUser gitlabUser);

    /**
     * put subversion info into database
     * this is for a user and his specific token info
     *
     * @param subversionUser
     * @return
     */
    HttpResponseTemp<?> setSubversionInfo(SubversionUser subversionUser);

    /**
     * get the dockerfile in git
     *
     * @param projectId is the code info of the project
     * @param branch    is git branch
     * @param path
     * @return
     */
    HttpResponseTemp<?> getProjectDockerfile(int projectId, String branch, String path);

    /**
     * get branches of a project in git
     *
     * @param id is the project id in database
     * @return
     */
    HttpResponseTemp<?> getBranches(int id);

    /**
     * get branches of a project in git
     *
     * @param codeConfig is the CodeConfiguration
     * @return
     */
    HttpResponseTemp<?> getBranches(CodeConfiguration codeConfig);

    /**
     * get readme of a project in git
     *
     * @param id     is the project id in database
     * @param branch is git branch
     * @return
     */
    HttpResponseTemp<?> getReadme(int id, String branch);

    /**
     * @param id
     * @return
     */
    HttpResponseTemp<?> getTags(int id);

    /**
     * get tags of a project in git
     *
     * @param codeConfig is the CodeConfiguration
     * @return
     */
    HttpResponseTemp<?> getTags(CodeConfiguration codeConfig);

    /**
     *
     * @param collectionId
     * @return
     */
    HttpResponseTemp<String> getProjectCollectionNameById(int collectionId);

    /**
     *
     * @param id
     * @param newCreatorInfo
     * @return
     */
    HttpResponseTemp<?> changeCreator(int id, CreatorInfo newCreatorInfo);

    /**
     * modify gitlab information
     *
     * @param projectId
     * @param codeInfo
     * @return
     */
    HttpResponseTemp<?> modifyGitlabInfo(int projectId, CodeConfiguration codeInfo);
}
