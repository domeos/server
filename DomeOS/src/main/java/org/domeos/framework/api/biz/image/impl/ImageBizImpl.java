package org.domeos.framework.api.biz.image.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.mapper.image.BaseImageCustomMapper;
import org.domeos.framework.api.mapper.image.BaseImageMapper;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.BaseImageCustom;
import org.domeos.framework.engine.model.RowMapperDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Service("imageBiz")
public class ImageBizImpl extends BaseBizImpl implements ImageBiz {

    @Autowired
    BaseImageMapper baseImageMapper;

    @Autowired
    BaseImageCustomMapper baseImageCustomMapper;

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
    public BaseImageCustom getBaseImageCustomById(int id) {
        return this.getById(ImageBiz.BASEIMAGECUNSTOM_TABLE_NAME, id, BaseImageCustom.class);
    }

    @Override
    public void setBaseImageCustom(BaseImageCustom baseImageCustom) {
        baseImageCustomMapper.insertRow(baseImageCustom, baseImageCustom.toString());
    }

    @Override
    public void deleteBaseImageCustomById(int id) {
        this.removeById(ImageBiz.BASEIMAGECUNSTOM_TABLE_NAME, id);
    }

    @Override
    public void updateBaseImageCustomById(BaseImageCustom baseImageCustom) {
        baseImageCustomMapper.updateRow(baseImageCustom, baseImageCustom.toString());
    }

    @Override
    public List<BaseImageCustom> listBaseImageCustom() {
        List<RowMapperDao> data = baseImageCustomMapper.listBaseImageCustom();
        if (data == null) {
            return null;
        }
        List<BaseImageCustom> baseImageCustoms = new LinkedList<>();
        for (RowMapperDao tmp : data) {
            BaseImageCustom baseImageCustom = checkResult(tmp, BaseImageCustom.class);
            baseImageCustoms.add(baseImageCustom);
        }
        return baseImageCustoms;
    }

    @Override
    public List<BaseImageCustom> getUnGcBaseImageCustom() {
        return baseImageCustomMapper.getUnGcBaseImageCustom();
    }

    @Override
    public void updateBaseImageCustomGC(int id, int isGC) {
        baseImageCustomMapper.updateBaseImageCustomGC(id, isGC);
    }

    @Override
    public void updateStatusById(int id, String state) {
        baseImageCustomMapper.updateStateById(id, state);
    }

    @Override
    public String getBuildTaskNameById(int buildId) {
        BaseImageCustom baseImageCustom = getBaseImageCustomById(buildId);
        if (baseImageCustom == null) {
            return null;
        }
        return baseImageCustom.getTaskName();
    }

    @Override
    public void setBaseImageLogMD5(int imageId, String md5) {
        baseImageCustomMapper.setBaseImageLogMD5(imageId, md5);
    }

    @Override
    public String getBaseImageLogMD5(int imageId) {
        return baseImageCustomMapper.getBaseImageLogMD5(imageId);
    }
}
