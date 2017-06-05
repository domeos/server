package org.domeos.framework.api.consolemodel.configuration;

import java.util.Comparator;

/**
 * Created by feiliu206363 on 2017/1/20.
 */
public class ConfigurationDeployInfo {
    private int configurationId;
    private String configurationName;
    private int deployCollectionId;
    private String deployCollectionName;
    private int deployId;
    private String deployName;
    private int versionId;
    private int versionIdInDeploy;
    private long deployCreateTime;

    public int getConfigurationId() {
        return configurationId;
    }

    public ConfigurationDeployInfo setConfigurationId(int configurationId) {
        this.configurationId = configurationId;
        return this;
    }

    public String getConfigurationName() {
        return configurationName;
    }

    public ConfigurationDeployInfo setConfigurationName(String configurationName) {
        this.configurationName = configurationName;
        return this;
    }

    public int getDeployCollectionId() {
        return deployCollectionId;
    }

    public ConfigurationDeployInfo setDeployCollectionId(int deployCollectionId) {
        this.deployCollectionId = deployCollectionId;
        return this;
    }

    public String getDeployCollectionName() {
        return deployCollectionName;
    }

    public ConfigurationDeployInfo setDeployCollectionName(String deployCollectionName) {
        this.deployCollectionName = deployCollectionName;
        return this;
    }

    public int getDeployId() {
        return deployId;
    }

    public ConfigurationDeployInfo setDeployId(int deployId) {
        this.deployId = deployId;
        return this;
    }

    public String getDeployName() {
        return deployName;
    }

    public ConfigurationDeployInfo setDeployName(String deployName) {
        this.deployName = deployName;
        return this;
    }

    public int getVersionId() {
        return versionId;
    }

    public ConfigurationDeployInfo setVersionId(int versionId) {
        this.versionId = versionId;
        return this;
    }

    public int getVersionIdInDeploy() {
        return versionIdInDeploy;
    }

    public ConfigurationDeployInfo setVersionIdInDeploy(int versionIdInDeploy) {
        this.versionIdInDeploy = versionIdInDeploy;
        return this;
    }

    public long getDeployCreateTime() {
        return deployCreateTime;
    }

    public ConfigurationDeployInfo setDeployCreateTime(long deployCreateTime) {
        this.deployCreateTime = deployCreateTime;
        return this;
    }

    public static class ConfigurationDeployInfoComparator implements Comparator<ConfigurationDeployInfo> {
        @Override
        public int compare(ConfigurationDeployInfo t1, ConfigurationDeployInfo t2) {
            if (t2.getDeployCreateTime() - t1.getDeployCreateTime() > 0) {
                return 1;
            } else if (t2.getDeployCreateTime() - t1.getDeployCreateTime() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
