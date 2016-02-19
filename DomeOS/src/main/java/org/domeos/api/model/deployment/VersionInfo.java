package org.domeos.api.model.deployment;

/**
 * Created by xxs on 15/12/16.
 */
public class VersionInfo {
    private long deployId;
    private long version;
    private long createTime;

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setVersion(long version) {
        this.version = version;
    }

    public long getVersion() {
        return version;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getCreateTime() {
        return createTime;
    }

    public VersionInfo(Version version) {
        this.deployId = version.getDeployId();
        this.version = version.getVersion();
        this.createTime = version.getCreateTime();
    }
}
