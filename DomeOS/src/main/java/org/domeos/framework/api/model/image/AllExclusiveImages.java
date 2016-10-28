package org.domeos.framework.api.model.image;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * Created by kairen on 25/04/16.
 */
public class AllExclusiveImages {
    List<ExclusiveImage> compilePublicImageList;
    List<ExclusiveImage> compilePrivateImageList;
    List<ExclusiveImage> runPublicImageList;
    List<ExclusiveImage> runPrivateImageList;

    public List<ExclusiveImage> getCompilePublicImageList() {
        return compilePublicImageList;
    }

    public void setCompilePublicImageList(List<ExclusiveImage> compilePublicImageList) {
        this.compilePublicImageList = compilePublicImageList;
    }

    public List<ExclusiveImage> getCompilePrivateImageList() {
        return compilePrivateImageList;
    }

    public void setCompilePrivateImageList(List<ExclusiveImage> compilePrivateImageList) {
        this.compilePrivateImageList = compilePrivateImageList;
    }

    public List<ExclusiveImage> getRunPublicImageList() {
        return runPublicImageList;
    }

    public void setRunPublicImageList(List<ExclusiveImage> runPublicImageList) {
        this.runPublicImageList = runPublicImageList;
    }

    public List<ExclusiveImage> getRunPrivateImageList() {
        return runPrivateImageList;
    }

    public void setRunPrivateImageList(List<ExclusiveImage> runPrivateImageList) {
        this.runPrivateImageList = runPrivateImageList;
    }

    public AllExclusiveImages() {
    }

    public void sortAllImageList() {
        sortExclusiveImages(compilePublicImageList);
        sortExclusiveImages(compilePrivateImageList);
        sortExclusiveImages(runPublicImageList);
        sortExclusiveImages(runPrivateImageList);
    }

    public void sortExclusiveImages(List<ExclusiveImage> imageList) {
        if (imageList != null && imageList.size() > 0) {
            Collections.sort(imageList, new Comparator<ExclusiveImage>() {
                @Override
                public int compare(ExclusiveImage o1, ExclusiveImage o2) {
                    return ((Long) o2.getCreateTime()).compareTo(o1.getCreateTime());
                }
            });
        }
    }
}
