package org.domeos.api.mapper.ci;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.ci.BaseImage;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/13.
 */
@Repository
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

    @Select("SELECT * FROM base_images WHERE imageName=#{imageName} and imageTag=#{imageTag}")
    BaseImage getBaseImageByNameAndTag(@Param("imageName") String imageName, @Param("imageTag") String imageTag);

    @Delete("DELETE FROM base_images WHERE id=#{id}")
    int deleteBuildImage(int id);

    @Select("SELECT * FROM base_images")
    List<BaseImage> getAllBaseImage();
}
