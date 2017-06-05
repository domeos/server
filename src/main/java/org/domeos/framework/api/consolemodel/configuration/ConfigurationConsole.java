package org.domeos.framework.api.consolemodel.configuration;

import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.model.configuration.Configuration;

import java.util.Comparator;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
public class ConfigurationConsole {
    private CreatorInfo creatorInfo;
    private String clusterName;
    private int collectionId;
    private Configuration configuration;

    public CreatorInfo getCreatorInfo() {
        return creatorInfo;
    }

    public ConfigurationConsole setCreatorInfo(CreatorInfo creatorInfo) {
        this.creatorInfo = creatorInfo;
        return this;
    }

    public String getClusterName() {
        return clusterName;
    }

    public ConfigurationConsole setClusterName(String clusterName) {
        this.clusterName = clusterName;
        return this;
    }

    public int getCollectionId() {
        return collectionId;
    }

    public ConfigurationConsole setCollectionId(int collectionId) {
        this.collectionId = collectionId;
        return this;
    }

    public Configuration getConfiguration() {
        return configuration;
    }

    public ConfigurationConsole setConfiguration(Configuration configuration) {
        this.configuration = configuration;
        return this;
    }

    public static class ConfigurationListComparator implements Comparator<ConfigurationConsole> {
        @Override
        public int compare(ConfigurationConsole t1, ConfigurationConsole t2) {
            if (t2.getConfiguration().getCreateTime() - t1.getConfiguration().getCreateTime() > 0) {
                return 1;
            } else if (t2.getConfiguration().getCreateTime() - t1.getConfiguration().getCreateTime() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
