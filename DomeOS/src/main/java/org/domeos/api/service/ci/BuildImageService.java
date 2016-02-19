package org.domeos.api.service.ci;

import org.domeos.api.model.ci.BuildImage;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/8/26.
 */
public interface BuildImageService {
    /**
     * get build image in database
     * build image is used for ci
     * @return
     */
    HttpResponseTemp<?> getBuildImage();

    /**
     * put build image into database
     * only one build image can be set, we make the docker image ourself and store it in private registry
     * @param buildImage can be found in api/model/ci/BuildImage.java
     * @return
     */
    HttpResponseTemp<?> setBuildImage(BuildImage buildImage);
}
