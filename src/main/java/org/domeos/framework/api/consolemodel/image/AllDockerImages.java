package org.domeos.framework.api.consolemodel.image;

import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.DockerImage;

import java.util.Comparator;
import java.util.Set;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
public class AllDockerImages {
    private String registry;
    private Set<ImageProjectCollection> imageProjectCollections;
    private Integer allProjectImageCount;
    private Set<String> otherImages;

    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        this.registry = registry;
    }

    public Set<ImageProjectCollection> getImageProjectCollections() {
        return imageProjectCollections;
    }

    public AllDockerImages setImageProjectCollections(Set<ImageProjectCollection> imageProjectCollections) {
        this.imageProjectCollections = imageProjectCollections;
        return this;
    }

    public Integer getAllProjectImageCount() {
        return allProjectImageCount;
    }

    public void setAllProjectImageCount(Integer allProjectImageCount) {
        this.allProjectImageCount = allProjectImageCount;
    }

    public Set<String> getOtherImages() {
        return otherImages;
    }

    public AllDockerImages setOtherImages(Set<String> otherImages) {
        this.otherImages = otherImages;
        return this;
    }

    public class ImageComparator implements Comparator {

        @Override
        public int compare(Object t1, Object t2) {
            if (t1.getClass() == DockerImage.class && t2.getClass() == DockerImage.class) {
                if (((DockerImage) t2).getCreateTime() - ((DockerImage) t1).getCreateTime() > 0) {
                    return 1;
                } else if (((DockerImage) t2).getCreateTime() - ((DockerImage) t1).getCreateTime() < 0) {
                    return -1;
                } else {
                    return 0;
                }
            } else if (t1.getClass() == BaseImage.class && t2.getClass() == BaseImage.class) {
                if (((BaseImage) t2).getCreateTime() - ((BaseImage) t1).getCreateTime() > 0) {
                    return 1;
                } else if (((BaseImage) t2).getCreateTime() - ((BaseImage) t1).getCreateTime() < 0) {
                    return -1;
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        }
    }
}
