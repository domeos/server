package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.related.VolumeConfigMap;
import org.domeos.framework.api.model.deployment.related.VolumePVC;
import org.domeos.framework.api.model.deployment.related.VolumeType;
import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2016/12/5.
 */
public class VolumeDraft {
    private String name;
    private VolumeType volumeType;
    private String hostPath;
    private String emptyDir;
    private VolumePVC volumePVC;
    private VolumeConfigMap volumeConfigMap;

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

    public VolumePVC getVolumePVC() {
        return volumePVC;
    }

    public VolumeDraft setVolumePVC(VolumePVC volumePVC) {
        this.volumePVC = volumePVC;
        return this;
    }

    public VolumeConfigMap getVolumeConfigMap() {
        return volumeConfigMap;
    }

    public VolumeDraft setVolumeConfigMap(VolumeConfigMap volumeConfigMap) {
        this.volumeConfigMap = volumeConfigMap;
        return this;
    }
    
    public String checkLegality() {
        if (StringUtils.isBlank(getName())) {
            return "name must be set";
        }
        if (!StringUtils.checkVolumeNamePattern(getName())) {
            return "name must match pattern ^[a-z0-9]([-a-z0-9]*[a-z0-9])?$";
        }
        return null;
    }
}
