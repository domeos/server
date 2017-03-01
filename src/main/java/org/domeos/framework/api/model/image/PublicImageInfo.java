package org.domeos.framework.api.model.image;

/**
 * Created by KaiRen on 2017/1/16.
 */
public class PublicImageInfo {
    private String imageName;
    private int size;
    private int downloadCount;
    private String iconUrl;
    private long lastModified;

    public PublicImageInfo() {
    }

    public PublicImageInfo(String imageName, int size, int downloadCount, String iconUrl, long lastModified) {
        this.imageName = imageName;
        this.size = size;
        this.downloadCount = downloadCount;
        this.iconUrl = iconUrl;
        this.lastModified = lastModified;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public int getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(int downloadCount) {
        this.downloadCount = downloadCount;
    }

    public String getIconUrl() {
        return iconUrl;
    }

    public void setIconUrl(String iconUrl) {
        this.iconUrl = iconUrl;
    }

    public long getLastModified() {
        return lastModified;
    }

    public void setLastModified(long lastModified) {
        this.lastModified = lastModified;
    }
}
