package org.domeos.framework.api.model.configuration;

/**
 * Created by feiliu206363 on 2017/1/20.
 */
public class ConfigurationDeployMap {
    private int id;
    private int configurationId;
    private int deployId;
    private int versionId;
    private long createTime;

    public int getId() {
        return id;
    }

    public ConfigurationDeployMap setId(int id) {
        this.id = id;
        return this;
    }

    public int getConfigurationId() {
        return configurationId;
    }

    public ConfigurationDeployMap setConfigurationId(int configurationId) {
        this.configurationId = configurationId;
        return this;
    }

    public int getDeployId() {
        return deployId;
    }

    public ConfigurationDeployMap setDeployId(int deployId) {
        this.deployId = deployId;
        return this;
    }

    public int getVersionId() {
        return versionId;
    }

    public ConfigurationDeployMap setVersionId(int versionId) {
        this.versionId = versionId;
        return this;
    }

    public long getCreateTime() {
        return createTime;
    }

    public ConfigurationDeployMap setCreateTime(long createTime) {
        this.createTime = createTime;
        return this;
    }
}
