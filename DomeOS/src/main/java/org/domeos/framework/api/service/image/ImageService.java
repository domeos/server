package org.domeos.framework.api.service.image;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.BuildImage;

/**
 * Created by baokangwang on 2016/4/6.
 */
public interface ImageService {

    /**
     * get a specified base image for docker build
     * @param id is the number of BaseImage in database
     * @return
     */
    HttpResponseTemp<?> getBaseImage(int id);

    /**
     * put a base image into database
     * @param baseImage can be found in framework/api/model/image/BaseImage
     * @return
     */
    HttpResponseTemp<?> setBaseImage(BaseImage baseImage);

    /**
     * get all base images stored in database
     * @return
     */
    HttpResponseTemp<?> listBaseImage();

    /**
     * delete a base image from database by id
     * @param id
     * @return
     */
    HttpResponseTemp<?> deleteBaseImage(int id);

    /**
     * get build image in database
     * build image is used for ci
     * @return
     */
    HttpResponseTemp<?> getBuildImage();

    /**
     * put build image into database
     * only one build image can be set, we make the docker image ourself and store it in private registry
     * @param buildImage can be found in framework/api/model/image/BuildImage
     * @return
     */
    HttpResponseTemp<?> setBuildImage(BuildImage buildImage);

    /**
     *
     * @return
     */
    HttpResponseTemp<?> getDockerImages();

    /**
     *
     * @param projectName
     * @param registry
     * @return
     */
    HttpResponseTemp<?> getDockerImageDetailByProjectName(String projectName, String registry);

    /**
     *
     * @return
     */
    HttpResponseTemp<?> getAllDockerImages();

    /**
     *
     * @param name
     * @param registry
     * @return
     */
    HttpResponseTemp<?> getDockerImageDetail(String name, String registry);
}
