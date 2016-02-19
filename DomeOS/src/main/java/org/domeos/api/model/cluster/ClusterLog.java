package org.domeos.api.model.cluster;

import org.apache.commons.lang3.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/12/28.
 */
public class ClusterLog {
    int id;
    int clusterId;
    String kafka;
    String zookeeper;
    String imageName;
    String imageTag;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

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
        if (clusterId <= 0) {
            return "clutser id must be set";
        }
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
