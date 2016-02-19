package org.domeos.api.model.deployment;

/**
 */
public class VersionDBProto {
    long vid;
    long deployId;
    long version;
    String contents;

    public long getVid() {
        return vid;
    }

    public void setVid(long vid) {
        this.vid = vid;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }

    public String getContents() {
        return contents;
    }

    public void setContents(String contents) {
        this.contents = contents;
    }
}
