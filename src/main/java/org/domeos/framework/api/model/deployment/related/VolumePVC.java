package org.domeos.framework.api.model.deployment.related;

/**
 * Created by feiliu206363 on 2016/12/5.
 */
public class VolumePVC {
    private int volumeId;
    private String volumeName;
    private String claimName;
    private boolean readOnly = false;

    public int getVolumeId() {
        return volumeId;
    }

    public VolumePVC setVolumeId(int volumeId) {
        this.volumeId = volumeId;
        return this;
    }

    public String getVolumeName() {
        return volumeName;
    }

    public VolumePVC setVolumeName(String volumeName) {
        this.volumeName = volumeName;
        return this;
    }

    public String getClaimName() {
        return claimName;
    }

    public VolumePVC setClaimName(String claimName) {
        this.claimName = claimName;
        return this;
    }

    public boolean isReadOnly() {
        return readOnly;
    }

    public VolumePVC setReadOnly(boolean readOnly) {
        this.readOnly = readOnly;
        return this;
    }
}
