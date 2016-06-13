package org.domeos.framework.api.biz.image;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.BaseImageCustom;

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

    BaseImageCustom getBaseImageCustomById(int id);

    void setBaseImageCustom(BaseImageCustom baseImageCustom);

    void deleteBaseImageCustomById(int id);

    void updateBaseImageCustomById(BaseImageCustom baseImageCustom);

    List<BaseImageCustom> listBaseImageCustom();

    List<BaseImageCustom> getUnGcBaseImageCustom();

    void updateBaseImageCustomGC(int id, int isGC);

    void updateStatusById(int id, String state);

    String getBuildTaskNameById(int buildId);

    void setBaseImageLogMD5(int imageId, String md5);

    String getBaseImageLogMD5(int imageId);
}
