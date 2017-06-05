package org.domeos.framework.api.model.deployment.related;

/**
 * Created by feiliu206363 on 2016/12/5.
 */
public enum VolumeType {
    HOSTPATH("hostPath"),
    EMPTYDIR("emptyDir"),
    PERSISTENTVOLUMECLAIM("persistentVolumeClaim"),
    CONFIGMAP("configMap");

    private String type;

    VolumeType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }

    public VolumeType setType(String type) {
        this.type = type;
        return this;
    }
}
