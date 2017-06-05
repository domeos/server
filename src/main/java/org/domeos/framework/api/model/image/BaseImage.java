package org.domeos.framework.api.model.image;

import org.domeos.util.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/11/13.
 */
public class BaseImage {

    private int id;
    private String imageName;
    private String imageTag;
    private String registry;
    private String description;
    long createTime; // this is time that the image pushed into registry, so it is not stored in datebase

    public BaseImage() {
    }

    public BaseImage(String imageName, String imageTag, String registry, String description) {
        this.imageName = imageName;
        this.imageTag = imageTag;
        this.registry = registry;
        this.description = description;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getImageTag() {
        return imageTag;
    }

    public void setImageTag(String imageTag) {
        this.imageTag = imageTag;
    }

    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        this.registry = registry;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String imageInfo() {
        if (StringUtils.isBlank(registry)) {
            return imageName;
        } else {
            String prefix = CommonUtil.domainUrl(registry);
            return prefix + "/" + imageName;
        }
    }

    public String checkLegality() {
        if (StringUtils.isBlank(imageName)) {
            return "image name is null";
        }
        registry = CommonUtil.fullUrl(registry);
        return null;
    }

    public boolean equals(Object other) {
        BaseImage baseImage = (BaseImage) other;
        return this.imageName.equals(baseImage.getImageName()) && this.registry.equals(baseImage.getRegistry());
    }

    @Override
    public String toString() {
        return "{\"imageName\":" + imageName + ",\"imageTag\":" + imageTag + ",\"registry\":" + registry + "}";
    }
}
