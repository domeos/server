package org.domeos.api.model.console.Cluster;

import org.domeos.api.model.cluster.ClusterMonitor;
import org.domeos.api.model.user.ResourceOwnerType;

import java.util.Comparator;

/**
 * Created by feiliu206363 on 2015/12/24.
 */
public class ClusterListInfo {
    int id;
    String name;
    String api;
    String tag;
    String ownerName;
    ResourceOwnerType ownerType;
    String domain;
    int logConfig;
    long createTime;
    ClusterMonitor clusterMonitor;
    int nodeNum;
    int podNum;

    public ClusterListInfo(int id, String name, String api, String tag, String ownerName, ResourceOwnerType ownerType, String domain, int logConfig, long createTime, int nodeNum, int podNum) {
        this.id = id;
        this.name = name;
        this.api = api;
        this.tag = tag;
        this.ownerName = ownerName;
        this.ownerType = ownerType;
        this.domain = domain;
        this.logConfig = logConfig;
        this.createTime = createTime;
        this.nodeNum = nodeNum;
        this.podNum = podNum;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getApi() {
        return api;
    }

    public void setApi(String api) {
        this.api = api;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public ResourceOwnerType getOwnerType() {
        return ownerType;
    }

    public void setOwnerType(ResourceOwnerType ownerType) {
        this.ownerType = ownerType;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public int getLogConfig() {
        return logConfig;
    }

    public void setLogConfig(int logConfig) {
        this.logConfig = logConfig;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public ClusterMonitor getClusterMonitor() {
        return clusterMonitor;
    }

    public void setClusterMonitor(ClusterMonitor clusterMonitor) {
        this.clusterMonitor = clusterMonitor;
    }

    public int getNodeNum() {
        return nodeNum;
    }

    public void setNodeNum(int nodeNum) {
        this.nodeNum = nodeNum;
    }

    public int getPodNum() {
        return podNum;
    }

    public void setPodNum(int podNum) {
        this.podNum = podNum;
    }

    public static class ClusterListInfoComparator implements Comparator<ClusterListInfo> {
        @Override
        public int compare(ClusterListInfo t1, ClusterListInfo t2) {
            if (t2.getCreateTime() - t1.getCreateTime() < 0) {
                return 1;
            } else if (t2.getCreateTime() - t1.getCreateTime() > 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
