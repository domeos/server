package org.domeos.framework.api.service.project;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.project.ProjectCreate;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.SubversionUser;

/**
 */
public interface ProjectService {
    /**
     * put project info into database
     *
     * @param projectCreate is parameter from front pages
     * @return
     */
    HttpResponseTemp<?> createProject(ProjectCreate projectCreate);

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
     * @param project
     * @return
     */
    HttpResponseTemp<?> modifyProject(Project project);

    /**
     * get project info from database by project id
     *
     * @param id
     * @return
     */
    HttpResponseTemp<Project> getProject(int id);

    /**
     * list project info in database
     * this will return latest build info
     *
     * @return
     */
    HttpResponseTemp<?> listProjectInfo();

    /**
     * list gitlab info in database
     *
     * @return
     */
    HttpResponseTemp<?> listCodeSourceInfo();

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
     * get readme of a project in git
     *
     * @param id     is the project id in database
     * @param branch is git branch
     * @return
     */
    HttpResponseTemp<?> getReadme(int id, String branch);

    /**
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> getTags(int id);
}
