package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2016/12/5.
 */
public class VolumeMountDraft {
    private String name; // name of volume, this must be set in deployment
    private boolean readOnly = false;
    private String mountPath;
    private String subPath;

    public String getName() {
        return name;
    }

    public VolumeMountDraft setName(String name) {
        this.name = name;
        return this;
    }

    public boolean isReadOnly() {
        return readOnly;
    }

    public VolumeMountDraft setReadOnly(boolean readOnly) {
        this.readOnly = readOnly;
        return this;
    }

    public String getMountPath() {
        return mountPath;
    }

    public VolumeMountDraft setMountPath(String mountPath) {
        this.mountPath = mountPath;
        return this;
    }

    public String getSubPath() {
        return subPath;
    }

    public VolumeMountDraft setSubPath(String subPath) {
        this.subPath = subPath;
        return this;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(name)) {
            return "volume name in container must be set";
        }
        if (!StringUtils.checkVolumeNamePattern(name)) {
            return "name must match pattern ^[a-z0-9]([-a-z0-9]*[a-z0-9])?$";
        }
        if (StringUtils.isBlank(mountPath)) {
            return "mount path of name(" + name + ") must be set";
        }
        return null;
    }
}
