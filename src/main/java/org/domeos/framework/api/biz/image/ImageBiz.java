package org.domeos.framework.api.biz.image;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.image.BaseImage;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
public interface ImageBiz extends BaseBiz {

    String BASEIMAGECUNSTOM_TABLE_NAME = "base_image_custom";

    BaseImage getBaseImage(int id);

    List<BaseImage> getBaseImagesByName(String imageName);

    List<BaseImage> getBaseImagesByNameAndRegistry(String imageName, String registry);

    List<BaseImage> listBaseImages();

    int setBaseImage(BaseImage baseImage);

    BaseImage getBaseImageByNameAndTag(String imageName, String imageTag, String registry);

    int deleteBuildImage(int id);

    int getBaseImagesCount();
}
