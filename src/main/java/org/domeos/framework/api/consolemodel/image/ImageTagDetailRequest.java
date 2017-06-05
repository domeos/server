package org.domeos.framework.api.consolemodel.image;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/9/27.
 */
public class ImageTagDetailRequest {
    private String registry;
    private String name;
    private List<String> tags;

    public String getRegistry() {
        return registry;
    }

    public ImageTagDetailRequest setRegistry(String registry) {
        this.registry = registry;
        return this;
    }

    public String getName() {
        return name;
    }

    public ImageTagDetailRequest setName(String name) {
        this.name = name;
        return this;
    }

    public List<String> getTags() {
        return tags;
    }

    public ImageTagDetailRequest setTags(List<String> tags) {
        this.tags = tags;
        return this;
    }
}
