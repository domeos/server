package org.domeos.framework.api.consolemodel.configuration;

import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.model.configuration.ConfigurationCollection;

/**
 * Created by feiliu206363 on 2017/2/16.
 */
public class ConfigurationCollectionConsole {
    private ConfigurationCollection configurationCollection;
    private CreatorInfo creatorInfo;

    public ConfigurationCollection getConfigurationCollection() {
        return configurationCollection;
    }

    public ConfigurationCollectionConsole setConfigurationCollection(ConfigurationCollection configurationCollection) {
        this.configurationCollection = configurationCollection;
        return this;
    }

    public CreatorInfo getCreatorInfo() {
        return creatorInfo;
    }

    public ConfigurationCollectionConsole setCreatorInfo(CreatorInfo creatorInfo) {
        this.creatorInfo = creatorInfo;
        return this;
    }
}
