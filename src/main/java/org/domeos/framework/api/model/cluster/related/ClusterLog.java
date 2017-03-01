package org.domeos.framework.api.model.cluster.related;

import org.domeos.util.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/12/28.
 */
public class ClusterLog {

    private String kafka;
    private String zookeeper;
    private String imageName;
    private String imageTag;

    public String getKafka() {
        return kafka;
    }

    public void setKafka(String kafka) {
        this.kafka = kafka;
    }

    public String getZookeeper() {
        return zookeeper;
    }

    public void setZookeeper(String zookeeper) {
        this.zookeeper = zookeeper;
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

    public String checkLegality() {
        if (StringUtils.isBlank(kafka)) {
            return "kafka must be set";
        }
        if (StringUtils.isBlank(zookeeper)) {
            return "zookeeper must be set";
        }
        if (StringUtils.isBlank(imageName)) {
            return "image name must be set";
        }
        if (StringUtils.isBlank(imageTag)) {
            return "image tag must be set";
        }
        imageName = CommonUtil.domainUrl(imageName);
        return null;
    }
}
