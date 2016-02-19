package org.domeos.api.service.ci;

import org.domeos.api.model.ci.BuildInfo;
import org.domeos.api.model.ci.BuildStatus;
import org.domeos.api.model.console.project.Project;
import org.domeos.basemodel.HttpResponseTemp;
import org.springframework.web.multipart.MultipartFile;

/**
 * Created by feiliu206363 on 2015/7/28.
 */
public interface BuildService {
    /**
     * preview the docker file before a project created
     *
     * @param project can be found in api/model/project/Project.java
     * @return
     */
    HttpResponseTemp<?> dockerfilePreview(Project project, long userId);

    /**
     * get the dockerfile of a project
     * generate the newest everytime and store it in database
     *
     * @param projectId is the id of a project in database
     * @param secret
     * @return
     */
    String dockerFile(int projectId, int buildId, String secret);

    /**
     * get the dockerfile that generate the docker image
     *
     * @param projectId is the id of a project in database
     * @param buildId is the id of a build in database
     * @return
     */
    HttpResponseTemp<?> dockerfileUsed(int projectId, int buildId, long userId);

    /**
     * build a docker image automatic started by git webhook
     *
     * @param webhookStr is the post request body of the git webhook
     * @return
     */
    HttpResponseTemp<?> startAutoBuild(String webhookStr);

    /**
     * build a docker image started by user
     *
     * @param buildInfo can be found in api/ci/BuildInfo.java
     * @return
     */
    HttpResponseTemp<?> startBuild(BuildInfo buildInfo, long userId, String userName);

    /**
     * build status set by kubernetes
     * docker container will send the build status back to server
     *
     * @param buildStatus can be found in api/ci/BuildStatus.java
     * @param secret
     * @return
     */
    HttpResponseTemp<?> setBuildStatus(BuildStatus buildStatus, String secret);

    /**
     * download rsa secret key for build
     *
     * @param projectId is the project id in database
     * @param buildId is the build id in database
     * @param secret
     * @return
     */
    String downloadRsa(int projectId, int buildId, String secret);

    /**
     * build log of a specific build
     * docker logs will be stored in database
     *
     * @param body is a file of docker logs
     * @param projectId is the project id in database of this build
     * @param buildId the build id in database
     * @return
     */
    HttpResponseTemp<?> uploadLogfile(MultipartFile body, int projectId, int buildId, String secret);

    /**
     * user can download the docker log to see what happened in build
     *
     * @param projectId is the project id in database of this build
     * @param buildId the build id in database
     * @return
     */
    HttpResponseTemp<?> downloadLogFile(int projectId, int buildId, long userId);

    /**
     * get all build infos of a project in database
     *
     * @param projectId is the project id in database of builds
     * @return
     */
    HttpResponseTemp<?> listBuildInfo(int projectId, long userId);
}
