package org.domeos.framework.api.model.image;

import java.util.List;

/**
 * Created by KaiRen on 2017/1/16.
 */
public class PublicImageDetail extends PublicImageInfo {
    private String readMeUrl;
    private String description;
    private long createTime;
    private List<PublicTagInfo> tagInfos;

    public PublicImageDetail(String imageName, int size, int downloadCount, String iconUrl, long createTime, String readMeUrl,
                             String description, long lastModified, List<PublicTagInfo> tagInfos) {
        super(imageName, size, downloadCount, iconUrl, lastModified);
        this.readMeUrl = readMeUrl;
        this.description = description;
        this.createTime = createTime;
        this.tagInfos = tagInfos;
    }

    public String getReadMeUrl() {
        return readMeUrl;
    }

    public void setReadMeUrl(String readMeUrl) {
        this.readMeUrl = readMeUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<PublicTagInfo> getTagInfos() {
        return tagInfos;
    }

    public void setTagInfos(List<PublicTagInfo> tagInfos) {
        this.tagInfos = tagInfos;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }
}
