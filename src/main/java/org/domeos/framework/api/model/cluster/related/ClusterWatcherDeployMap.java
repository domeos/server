package org.domeos.framework.api.model.cluster.related;

/**
 * Created by feiliu206363 on 2016/12/28.
 */
public class ClusterWatcherDeployMap {
    private int id;
    private int clusterId;
    private int deployId;
    private long updateTime;

    public int getId() {
        return id;
    }

    public ClusterWatcherDeployMap setId(int id) {
        this.id = id;
        return this;
    }

    public int getClusterId() {
        return clusterId;
    }

    public ClusterWatcherDeployMap setClusterId(int clusterId) {
        this.clusterId = clusterId;
        return this;
    }

    public int getDeployId() {
        return deployId;
    }

    public ClusterWatcherDeployMap setDeployId(int deployId) {
        this.deployId = deployId;
        return this;
    }

    public long getUpdateTime() {
        return updateTime;
    }

    public ClusterWatcherDeployMap setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
        return this;
    }
}
