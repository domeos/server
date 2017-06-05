package org.domeos.framework.api.model.deployment.related;

import java.util.Map;

/**
 * Created by feiliu206363 on 2016/12/20.
 */
public class VolumeConfigMap {
    private int configurationId;
    private String name;  // name of configMap, configMap must be created in k8s
    private Map<String, String> iterms;  // key is key in configMap, value is path under volumeMountPath

    public int getConfigurationId() {
        return configurationId;
    }

    public VolumeConfigMap setConfigurationId(int configurationId) {
        this.configurationId = configurationId;
        return this;
    }

    public String getName() {
        return name;
    }

    public VolumeConfigMap setName(String name) {
        this.name = name;
        return this;
    }

    public Map<String, String> getIterms() {
        return iterms;
    }

    public VolumeConfigMap setIterms(Map<String, String> iterms) {
        this.iterms = iterms;
        return this;
    }
}