package org.domeos.framework.api.biz.image.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.mapper.domeos.image.BaseImageMapper;
import org.domeos.framework.api.model.image.BaseImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Service("imageBiz")
public class ImageBizImpl extends BaseBizImpl implements ImageBiz {

    @Autowired
    BaseImageMapper baseImageMapper;

    @Override
    public BaseImage getBaseImage(int id) {
        return baseImageMapper.getBaseImage(id);
    }

    @Override
    public List<BaseImage> getBaseImagesByName(String imageName) {
        return baseImageMapper.getBaseImagesByName(imageName);
    }

    @Override
    public List<BaseImage> getBaseImagesByNameAndRegistry(String imageName, String registry) {
        return baseImageMapper.getBaseImagesByNameAndRegistry(imageName, registry);
    }

    @Override
    public List<BaseImage> listBaseImages() {
        return baseImageMapper.listBaseImages();
    }

    @Override
    public int setBaseImage(BaseImage baseImage) {
        return baseImageMapper.setBaseImage(baseImage);
    }

    @Override
    public BaseImage getBaseImageByNameAndTag(String imageName, String imageTag, String registry) {
        return baseImageMapper.getBaseImageByNameAndTagAndRegistry(imageName, imageTag, registry);
    }

    @Override
    public int deleteBuildImage(int id) {
        return baseImageMapper.deleteBuildImage(id);
    }

    @Override
    public int getBaseImagesCount() {
        return baseImageMapper.getBaseImagesCount();
    }

  }