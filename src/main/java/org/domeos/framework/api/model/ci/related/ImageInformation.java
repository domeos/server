package org.domeos.framework.api.model.ci.related;

import org.domeos.util.StringUtils;
import org.domeos.framework.api.model.project.Project;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class ImageInformation {
    private String registry;
    private String imageName;
    private String imageTag;
    private double imageSize;
    private long createTime;

    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        this.registry = registry;
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

    public double getImageSize() {
        return imageSize;
    }

    public void setImageSize(double imageSize) {
        this.imageSize = imageSize;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String checkLegality() {
        if (!StringUtils.isBlank(imageName) && !Project.isRegularDockerName(imageName)) {
            return "image name not support, must match [a-z0-9]+([._-][a-z0-9]+)*";
        }
        if (!StringUtils.isBlank(imageTag) && !Project.isRegularDockerName(imageTag)) {
            return "image tag not support , must match [a-z0-9]+([._-][a-z0-9]+)*";
        }
        // we need registry with out http or https here
        registry = CommonUtil.domainUrl(registry);
        return null;
    }
}