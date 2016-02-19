package org.domeos.api.service.project;

import org.domeos.api.model.console.project.Project;
import org.domeos.api.model.git.Gitlab;
import org.domeos.api.model.git.Subversion;
import org.domeos.basemodel.HttpResponseTemp;

/**
 */
public interface ProjectService {
    /**
     * put project info into database
     *
     * @param project can be found in api/project/Project.java
     * @return
     */
    HttpResponseTemp<?> createProject(Project project, long userId);

    /**
     * delete project info from database by project id
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> deleteProject(int id, long userId);

    /**
     * modify project info in database by id
     *
     * @param project
     * @return
     */
    HttpResponseTemp<?> modifyProject(Project project, long userId);

    /**
     * get project info from database by project id
     *
     * @param id
     * @return
     */
    HttpResponseTemp<Project> getProject(int id, long userId);

    /**
     * list project info in database
     * this will return latest build info
     *
     * @return
     */
    HttpResponseTemp<?> listProjectInfo(long userId);

    /**
     * list gitlab info in database
     *
     * @return
     */
    HttpResponseTemp<?> listCodeSourceInfo(Long userId);

    /**
     * list subversion info in database
     *
     * @return
     */
    HttpResponseTemp<?> listSvnCodeSourceInfo(Long userId);

    /**
     * put gitlab info into database
     * this is for a user and his specific token info
     *
     * @param gitlab can be found in api/model/git/Gitlab.java
     * @return
     */

    HttpResponseTemp<?> setGitlabInfo(Gitlab gitlab, long userId);

    /**
     * put subversion info into database
     * this is for a user and his specific token info
     *
     * @param subversion can be found in api/model/git/Subversion.java
     * @return
     */
    HttpResponseTemp<?> setSubversionInfo(Subversion subversion, long userId);

    /**
     * get the dockerfile in git
     *
     * @param projectId is the code info of the project
     * @param branch is git branch
     * @param path
     * @return
     */
    HttpResponseTemp<?> getProjectDockerfile(int projectId, String branch, String path, long userId);

    /**
     * get branches of a project in git
     *
     * @param id is the project id in database
     * @return
     */
    HttpResponseTemp<?> getBranches(int id, long userId);

    /**
     * get readme of a project in git
     *
     * @param id is the project id in database
     * @param branch is git branch
     * @return
     */
    HttpResponseTemp<?> getReadme(int id, String branch, long userId);
}
