package org.domeos.framework.api.model.image;

/**
 * Created by KaiRen on 2017/1/16.
 */
public class PublicTagInfo {
    private String imageName;
    private String imageTag;
    private long imageSize;
    private long createTime;
    private int downloadCount;
    private String dockerfileUrl;
    private String imageUrl;

    public PublicTagInfo(String imageName, String imageTag, long imageSize, long createTime,
                         int downloadCount, String dockerfileUrl, String imageUrl) {
        this.imageName = imageName;
        this.imageTag = imageTag;
        this.imageSize = imageSize;
        this.createTime = createTime;
        this.downloadCount = downloadCount;
        this.dockerfileUrl = dockerfileUrl;
        this.imageUrl = imageUrl;
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

    public long getImageSize() {
        return imageSize;
    }

    public void setImageSize(long imageSize) {
        this.imageSize = imageSize;
    }

    public String getDockerfileUrl() {
        return dockerfileUrl;
    }

    public void setDockerfileUrl(String dockerfileUrl) {
        this.dockerfileUrl = dockerfileUrl;
    }

    public int getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(int downloadCount) {
        this.downloadCount = downloadCount;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
