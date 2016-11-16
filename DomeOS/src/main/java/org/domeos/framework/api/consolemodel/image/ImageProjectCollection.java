package org.domeos.framework.api.consolemodel.image;

import java.util.Set;

/**
 * Created by feiliu206363 on 2016/9/26.
 */
public class ImageProjectCollection implements Comparable {
    private int projectCollectionId;
    private String projectCollectionName;
    private String creator;
    private long createTime;
    private String description;
    private boolean deletable;
    private Set<String> projectImages;

    public int getProjectCollectionId() {
        return projectCollectionId;
    }

    public ImageProjectCollection setProjectCollectionId(int projectCollectionId) {
        this.projectCollectionId = projectCollectionId;
        return this;
    }

    public String getProjectCollectionName() {
        return projectCollectionName;
    }

    public ImageProjectCollection setProjectCollectionName(String projectCollectionName) {
        this.projectCollectionName = projectCollectionName;
        return this;
    }

    public String getCreator() {
        return creator;
    }

    public ImageProjectCollection setCreator(String creator) {
        this.creator = creator;
        return this;
    }

    public long getCreateTime() {
        return createTime;
    }

    public ImageProjectCollection setCreateTime(long createTime) {
        this.createTime = createTime;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public ImageProjectCollection setDescription(String description) {
        this.description = description;
        return this;
    }

    public boolean isDeletable() {
        return deletable;
    }

    public ImageProjectCollection setDeletable(boolean deletable) {
        this.deletable = deletable;
        return this;
    }

    public Set<String> getProjectImages() {
        return projectImages;
    }

    public ImageProjectCollection setProjectImages(Set<String> projectImages) {
        this.projectImages = projectImages;
        return this;
    }

    @Override
    public int compareTo(Object o) {
        if (o instanceof ImageProjectCollection) {
            ImageProjectCollection collection = (ImageProjectCollection) o;
            if (projectCollectionId > collection.getProjectCollectionId()) {
                return 1;
            } else if (projectCollectionId < collection.getProjectCollectionId()) {
                return -1;
            } else {
                return 0;
            }
        }
        return 0;
    }
}
