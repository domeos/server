package org.domeos.framework.api.model.image.related;

import org.domeos.util.CommonUtil;

/**
 * Created by baokangwang on 2016/4/6.
 */
public class SourceImage {

    private int thirdParty;
    private String imageName;
    private String imageTag;
    private String registryUrl;

    public SourceImage() {
    }

    public int getThirdParty() {
        return thirdParty;
    }

    public void setThirdParty(int thirdParty) {
        this.thirdParty = thirdParty;
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

    public String getRegistryUrl() {
        return registryUrl;
    }

    public void setRegistryUrl(String registryUrl) {
        registryUrl = CommonUtil.fullUrl(registryUrl);
        this.registryUrl = registryUrl;
    }

    @Override
    public String toString() {
        return "{ \"thirdParty\":" + thirdParty + ", \"imageName\":\"" + imageName + "\", \"imageTag\":\"" + imageTag
                + "\", \"registryUrl\": \"" + registryUrl + "\"}";
    }
}
