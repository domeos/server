package org.domeos.framework.api.model.image;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
public class AllDockerImages {

    private String registry;
    private CopyOnWriteArrayList<BaseImage> baseImages = new CopyOnWriteArrayList<>();
    private CopyOnWriteArrayList<DockerImage> projectImages = new CopyOnWriteArrayList<>();
    private CopyOnWriteArrayList<String> otherImages = new CopyOnWriteArrayList<>();

    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        this.registry = registry;
    }

    public CopyOnWriteArrayList<BaseImage> getBaseImages() {
        return baseImages;
    }

    public void setBaseImages(CopyOnWriteArrayList<BaseImage> baseImages) {
        this.baseImages = baseImages;
    }

    public void addBaseImage(BaseImage baseImage) {
        baseImages.add(baseImage);
    }

    public List<DockerImage> getProjectImages() {
        return projectImages;
    }

    public void setProjectImages(CopyOnWriteArrayList<DockerImage> projectImages) {
        this.projectImages = projectImages;
    }

    public void addProjectImage(DockerImage projectImage) {
        projectImages.add(projectImage);
    }

    public List<String> getOtherImages() {
        return otherImages;
    }

    public void setOtherImages(CopyOnWriteArrayList<String> otherImages) {
        this.otherImages = otherImages;
    }

    public void addOtherImage(String otherImage) {
        otherImages.add(otherImage);
    }

    public void sortDockerimages() {
        if (projectImages.size() > 0) {
            Object[] projects = projectImages.toArray();
            Arrays.sort(projects, new ImageComparator());
            for (int i = 0; i < projects.length; i++) {
                projectImages.set(i, (DockerImage) projects[i]);
            }
        }
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

    public void sortBaseimages() {
        if (baseImages.size() > 0) {
            Object[] bases = baseImages.toArray();
            Arrays.sort(bases, new ImageComparator());
            for (int i = 0; i < bases.length; i++) {
                baseImages.set(i, (BaseImage) bases[i]);
            }
        }
    }
}
