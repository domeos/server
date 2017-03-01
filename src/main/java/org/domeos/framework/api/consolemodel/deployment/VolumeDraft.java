package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.related.VolumeType;

/**
 * Created by feiliu206363 on 2016/12/5.
 */
public class VolumeDraft {
    private String name;
    private VolumeType volumeType;
    private String hostPath;
    private String emptyDir;

    public String getName() {
        return name;
    }

    public VolumeDraft setName(String name) {
        this.name = name;
        return this;
    }

    public VolumeType getVolumeType() {
        return volumeType;
    }

    public VolumeDraft setVolumeType(VolumeType volumeType) {
        this.volumeType = volumeType;
        return this;
    }

    public String getHostPath() {
        return hostPath;
    }

    public VolumeDraft setHostPath(String hostPath) {
        this.hostPath = hostPath;
        return this;
    }

    public String getEmptyDir() {
        return emptyDir;
    }

    public VolumeDraft setEmptyDir(String emptyDir) {
        this.emptyDir = emptyDir;
        return this;
    }
}
