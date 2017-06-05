package org.domeos.framework.api.consolemodel.cluster;

import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.global.ClusterMonitor;

import java.util.Comparator;
/**
 * Created by feiliu206363 on 2015/12/24.
 */
public class ClusterListInfo {

    private int id;
    private String name;
    private String api;
    private String tag;
    private String domain;
    private int logConfig;
    private String ownerName;
    private Role role;
    private long createTime;
    private ClusterMonitor clusterMonitor;
    private int nodeNum;
    private int podNum;
    private int buildConfig;
    private WatcherStatus watcherStatus;
    
    public ClusterListInfo(int id, String name, String api, String tag, String domain, int logConfig, String ownerName,
                           Role role, long createTime, int nodeNum, int podNum, int buildConfig, WatcherStatus watcherStatus) {
        this.id = id;
        this.name = name;
        this.api = api;
        this.tag = tag;
        this.domain = domain;
        this.logConfig = logConfig;
        this.ownerName = ownerName;
        this.role = role;
        this.createTime = createTime;
        this.nodeNum = nodeNum;
        this.podNum = podNum;
        this.buildConfig = buildConfig;
        this.watcherStatus = watcherStatus;
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

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }
    
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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

    public int getBuildConfig() {
        return buildConfig;
    }

    public void setBuildConfig(int buildConfig) {
        this.buildConfig = buildConfig;
    }

    public WatcherStatus getWatcherStatus() {
        return watcherStatus;
    }

    public ClusterListInfo setWatcherStatus(WatcherStatus watcherStatus) {
        this.watcherStatus = watcherStatus;
        return this;
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
