package org.domeos.api.service.global;

import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/12/16.
 */
public interface DockerImageService {
    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getDockerImages(Long userId);

    /**
     *
     * @param projectName
     * @param registry
     *@param userId  @return
     */
    HttpResponseTemp<?> getDockerImageInfoByProjectName(String projectName, String registry, Long userId);

    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getAllDockerImages(Long userId);

    /**
     *
     * @param name
     * @param registry
     *@param userId  @return
     */
    HttpResponseTemp<?> getDockerImageDetail(String name, String registry, Long userId);
}
