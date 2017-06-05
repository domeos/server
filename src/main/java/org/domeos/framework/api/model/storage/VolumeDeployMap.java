package org.domeos.framework.api.model.storage;

/**
 * Created by feiliu206363 on 2016/12/1.
 */
public class VolumeDeployMap {
    private int id;
    private int volumeId;
    private int deployId;
    private int versionId;
    private long createTime;

    public int getId() {
        return id;
    }

    public VolumeDeployMap setId(int id) {
        this.id = id;
        return this;
    }

    public int getVolumeId() {
        return volumeId;
    }

    public VolumeDeployMap setVolumeId(int volumeId) {
        this.volumeId = volumeId;
        return this;
    }

    public int getDeployId() {
        return deployId;
    }

    public VolumeDeployMap setDeployId(int deployId) {
        this.deployId = deployId;
        return this;
    }

    public int getVersionId() {
        return versionId;
    }

    public VolumeDeployMap setVersionId(int versionId) {
        this.versionId = versionId;
        return this;
    }

    public long getCreateTime() {
        return createTime;
    }

    public VolumeDeployMap setCreateTime(long createTime) {
        this.createTime = createTime;
        return this;
    }
}
