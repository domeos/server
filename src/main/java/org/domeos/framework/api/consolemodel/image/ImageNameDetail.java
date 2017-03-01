package org.domeos.framework.api.consolemodel.image;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/9/27.
 */
public class ImageNameDetail {
    private String registry;
    private String imageName;
    private List<String> tags;

    public String getRegistry() {
        return registry;
    }

    public ImageNameDetail setRegistry(String registry) {
        this.registry = registry;
        return this;
    }

    public String getImageName() {
        return imageName;
    }

    public ImageNameDetail setImageName(String imageName) {
        this.imageName = imageName;
        return this;
    }

    public List<String> getTags() {
        return tags;
    }

    public ImageNameDetail setTags(List<String> tags) {
        this.tags = tags;
        return this;
    }
}
