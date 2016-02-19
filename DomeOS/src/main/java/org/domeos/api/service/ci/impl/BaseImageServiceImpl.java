package org.domeos.api.service.ci.impl;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.domeos.api.mapper.ci.BaseImageMapper;
import org.domeos.api.model.ci.BaseImage;
import org.domeos.api.service.ci.BaseImageService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Iterator;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/13.
 */
@Service("baseImageService")
public class BaseImageServiceImpl implements BaseImageService {
    private static Logger logger = org.apache.log4j.Logger.getLogger(BaseImageServiceImpl.class);
    @Autowired
    BaseImageMapper baseImageMapper;

    @Override
    public HttpResponseTemp<?> getBaseImage(int id) {
        BaseImage baseImage = baseImageMapper.getBaseImage(id);
        if (baseImage == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "image not exist in registry");
        }
        long createTime = PrivateRegistry.getCreateTime(baseImage);
        if (createTime <= 0) {
            logger.error("image not exist in registry");
            return ResultStat.PARAM_ERROR.wrap(null, "image not exist in registry");
        }
        baseImage.setCreateTime(createTime);
        return ResultStat.OK.wrap(baseImage);
    }

    @Override
    public HttpResponseTemp<?> setBaseImage(BaseImage baseImage) {
        if (baseImage == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "base image info is null");
        }
        if (!StringUtils.isBlank(baseImage.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, baseImage.checkLegality());
        }

        BaseImage tmp = baseImageMapper.getBaseImageByNameAndTag(baseImage.getImageName(), baseImage.getImageTag());
        if (tmp != null) {
            return ResultStat.BASE_IMAGE_ALREADY_EXIST.wrap(null);
        }

        long createTime = PrivateRegistry.getCreateTime(baseImage);
        if (createTime <= 0) {
            return ResultStat.PARAM_ERROR.wrap(null, "no such image in registry");
        } else {
            baseImageMapper.setBaseImage(baseImage);
            baseImage.setCreateTime(PrivateRegistry.getCreateTime(baseImage));
            return ResultStat.OK.wrap(baseImage);
        }
    }

    @Override
    public HttpResponseTemp<?> listBaseImage() {
        List<BaseImage> baseImages = baseImageMapper.listBaseImages();
        Iterator<BaseImage> iterator = baseImages.iterator();
        while (iterator.hasNext()) {
            BaseImage image = iterator.next();
            long createTime = PrivateRegistry.getCreateTime(image);
            if (createTime <= 0) {
                iterator.remove();
                logger.warn("base image not exist in registry, image: " + image.toString());
            } else {
                image.setCreateTime(createTime);
            }
        }
        return ResultStat.OK.wrap(baseImages);
    }

    @Override
    public HttpResponseTemp<?> deleteBaseImage(int id) {
        baseImageMapper.deleteBuildImage(id);
        return ResultStat.OK.wrap(null);
    }
}
