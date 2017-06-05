package org.domeos.framework.api.consolemodel.cluster;

import org.domeos.framework.api.model.deployment.related.HostEnv;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/12/29.
 */
public class ClusterWatcherInfo {
    private String name;
    private String description;
    private int deployId;
    private int clusterId;
    private String namespace;
    private String state;
    private HostEnv hostEnv;
    private List<VersionSelectorInfo> versionSelectorInfos;
    private long createTime;

    public String getName() {
        return name;
    }

    public ClusterWatcherInfo setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public ClusterWatcherInfo setDescription(String description) {
        this.description = description;
        return this;
    }

    public int getDeployId() {
        return deployId;
    }

    public ClusterWatcherInfo setDeployId(int deployId) {
        this.deployId = deployId;
        return this;
    }

    public int getClusterId() {
        return clusterId;
    }

    public ClusterWatcherInfo setClusterId(int clusterId) {
        this.clusterId = clusterId;
        return this;
    }

    public String getNamespace() {
        return namespace;
    }

    public HostEnv getHostEnv() {
        return hostEnv;
    }

    public ClusterWatcherInfo setHostEnv(HostEnv hostEnv) {
        this.hostEnv = hostEnv;
        return this;
    }

    public ClusterWatcherInfo setNamespace(String namespace) {
        this.namespace = namespace;
        return this;
    }

    public String getState() {
        return state;
    }

    public ClusterWatcherInfo setState(String state) {
        this.state = state;
        return this;
    }

    public long getCreateTime() {
        return createTime;
    }

    public ClusterWatcherInfo setCreateTime(long createTime) {
        this.createTime = createTime;
        return this;
    }

    public List<VersionSelectorInfo> getVersionSelectorInfos() {
        return versionSelectorInfos;
    }

    public ClusterWatcherInfo setVersionSelectorInfos(List<VersionSelectorInfo> versionSelectorInfos) {
        this.versionSelectorInfos = versionSelectorInfos;
        return this;
    }
}
