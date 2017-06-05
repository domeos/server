package org.domeos.framework.api.mapper.domeos.image;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.image.BaseImage;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Mapper
public interface BaseImageMapper {
    @Select("SELECT * FROM base_images WHERE id=#{id}")
    BaseImage getBaseImage(int id);

    @Select("SELECT * FROM base_images WHERE imageName=#{imageName}")
    List<BaseImage> getBaseImagesByName(@Param("imageName") String imageName);

    @Select("SELECT * FROM base_images WHERE imageName=#{imageName} and registry=#{registry}")
    List<BaseImage> getBaseImagesByNameAndRegistry(@Param("imageName") String imageName, @Param("registry") String registry);

    @Select("SELECT * FROM base_images")
    List<BaseImage> listBaseImages();

    @Insert("INSERT INTO base_images (imageName, imageTag, registry, description) VALUES (#{imageName}, #{imageTag}," +
            "#{registry}, #{description})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int setBaseImage(BaseImage baseImage);

    @Select("SELECT * FROM base_images WHERE imageName=#{imageName} and imageTag=#{imageTag} and registry=#{registry}")
    BaseImage getBaseImageByNameAndTagAndRegistry(@Param("imageName") String imageName, @Param("imageTag") String imageTag, @Param("registry") String registry);

    @Delete("DELETE FROM base_images WHERE id=#{id}")
    int deleteBuildImage(int id);

    @Select("SELECT COUNT(*) FROM base_images")
    int getBaseImagesCount();
}
