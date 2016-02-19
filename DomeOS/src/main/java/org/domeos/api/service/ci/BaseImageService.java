package org.domeos.api.service.ci;

import org.domeos.api.model.ci.BaseImage;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/11/13.
 */
public interface BaseImageService {
    /**
     * get a spacified the base image for docker build
     * @param id is the number of BaseImage in database
     * @return
     */
    HttpResponseTemp<?> getBaseImage(int id);

    /**
     * put a base image into database
     * @param baseImage can be found in api/model/ci/BaseImage
     * @return
     */
    HttpResponseTemp<?> setBaseImage(BaseImage baseImage);

    /**
     * get all base images stored database
     * @return
     */
    HttpResponseTemp<?> listBaseImage();

    /**
     * delete a base image from database by id
     * @param id
     * @return
     */
    HttpResponseTemp<?> deleteBaseImage(int id);
}
