package org.domeos.framework.api.consolemodel.image;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/9/27.
 */
public class ImageNameDetailRequest {
    private String registry;
    private RequestType requestType;
    private int projectCollectionId;
    private String projectCollectionName;
    private List<String> images;

    public String getRegistry() {
        return registry;
    }

    public ImageNameDetailRequest setRegistry(String registry) {
        this.registry = registry;
        return this;
    }

    public RequestType getRequestType() {
        return requestType;
    }

    public ImageNameDetailRequest setRequestType(RequestType requestType) {
        this.requestType = requestType;
        return this;
    }

    public int getProjectCollectionId() {
        return projectCollectionId;
    }

    public ImageNameDetailRequest setProjectCollectionId(int projectCollectionId) {
        this.projectCollectionId = projectCollectionId;
        return this;
    }

    public String getProjectCollectionName() {
        return projectCollectionName;
    }

    public ImageNameDetailRequest setProjectCollectionName(String projectCollectionName) {
        this.projectCollectionName = projectCollectionName;
        return this;
    }

    public List<String> getImages() {
        return images;
    }

    public ImageNameDetailRequest setImages(List<String> images) {
        this.images = images;
        return this;
    }

    public enum RequestType {
        OTHERIMAGE,
        PROJECT_COLLECTION
    }
}
