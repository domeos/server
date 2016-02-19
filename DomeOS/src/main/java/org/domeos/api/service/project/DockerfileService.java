package org.domeos.api.service.project;

import org.domeos.api.model.project.Dockerfile;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
public interface DockerfileService {
    /**
     * create dockerfile info
     *
     * @param dockerfile
     * @param projectName
     * @return
     */
    HttpResponseTemp<?> createDockerfile(Dockerfile dockerfile, String projectName);

    /**
     * modify dockerfile info by id in database
     *
     * @param dockerfile
     * @return
     */
    HttpResponseTemp<?> modifyDockerfile(Dockerfile dockerfile);

    /**
     * delete dockerfile in database by id
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> deleteDockerfile(int id);

    /**
     * get dockerfile info in database by projectId
     *
     * @param projectId
     * @return
     */
    HttpResponseTemp<?> getDockerfile(int projectId);
}
