package org.domeos.framework.api.consolemodel.deployment;

/**
 * Created by feiliu206363 on 2017/3/6.
 */
public class VolumeMountConsole extends VolumeDraft {
    private String containerPath;  // volume mount path in container
    private boolean readonly = false;  // volume readonly in container

    public String getContainerPath() {
        return containerPath;
    }

    public VolumeMountConsole setContainerPath(String containerPath) {
        this.containerPath = containerPath;
        return this;
    }

    public boolean isReadonly() {
        return readonly;
    }

    public VolumeMountConsole setReadonly(boolean readonly) {
        this.readonly = readonly;
        return this;
    }

    public VolumeMountConsole fillWithVolumeDraft(VolumeDraft volumeDraft) {
        setName(volumeDraft.getName());
        setVolumeType(volumeDraft.getVolumeType());
        setEmptyDir(volumeDraft.getEmptyDir());
        setHostPath(volumeDraft.getHostPath());
        setVolumePVC(volumeDraft.getVolumePVC());
        setVolumeConfigMap(volumeDraft.getVolumeConfigMap());
        return this;
    }
}
