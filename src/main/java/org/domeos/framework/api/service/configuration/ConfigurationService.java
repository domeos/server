package org.domeos.framework.api.service.configuration;

import org.domeos.framework.api.consolemodel.configuration.ConfigurationCollectionConsole;
import org.domeos.framework.api.consolemodel.configuration.ConfigurationCollectionInfo;
import org.domeos.framework.api.consolemodel.configuration.ConfigurationConsole;
import org.domeos.framework.api.consolemodel.configuration.ConfigurationDeployInfo;
import org.domeos.framework.api.model.configuration.Configuration;
import org.domeos.framework.api.model.configuration.ConfigurationCollection;

import java.util.List;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
public interface ConfigurationService {

    /**
     * create configuration collection
     *
     * @param configurationCollection
     * @return
     */
    ConfigurationCollectionInfo createConfigurationCollection(ConfigurationCollection configurationCollection);

    /**
     * get configuration collection info
     *
     * @param id
     * @return
     */
    ConfigurationCollectionConsole getConfigurationCollection(int id);

    /**
     * return configuration collection list
     *
     * @return
     */
    List<ConfigurationCollectionInfo> listConfigurationCollection();

    /**
     * delete configuration collection by id
     *
     * @param id
     */
    Void deleteConfigurationCollection(int id);

    /**
     * get configuration by collection id and id
     * @param collectionId
     * @param configureId
     * @return
     */
    ConfigurationConsole getConfigurationByCollectionIdAndId(int collectionId, int configureId);

    /**
     * get configuration by id
     * @param configureId
     * @return
     */
    ConfigurationConsole getConfigurationById(int configureId);

    /**
     * list configurations by collection id
     * @param collectionId
     * @return
     */
    List<ConfigurationConsole> listConfigurationByCollectionId(int collectionId);

    /**
     * all configuration list
     * @return
     */
    List<ConfigurationConsole> listAllConfigurations();

    /**
     * list configuration by cluster id
     * @param clusterId
     * @return
     */
    List<ConfigurationConsole> listConfigurationByClusterId(int clusterId);

    /**
     * delete configuration by id
     * @param configureId
     * @return
     */
    Void deleteConfigurationId(int configureId);

    /**
     * delete configurration by collection id and id
     * @param collectionId
     * @param configureId
     * @return
     */
    Void deleteConfigurationCollectionIdAndId(int collectionId, int configureId);

    /**
     * create configuration in collection
     * @param collectionId
     * @param configuration
     * @return
     */
    Configuration createConfiguration(int collectionId, Configuration configuration);

    /**
     * modify configuration collection, change name or description
     * @param configurationCollection
     * @return
     */
    ConfigurationCollection modifyConfigurationCollection(ConfigurationCollection configurationCollection);

    /**
     * modify configuration with collection id, change description or data
     * @param collectionId
     * @param configuration
     * @return
     */
    Configuration modifyConfigurationByCollectionId(int collectionId, Configuration configuration);

    /**
     * modify configuration change description or data
     * @param configuration
     * @return
     */
    Configuration modifyConfiguration(Configuration configuration);

    /**
     * list deployment and version info mount the configuration
     * @param configureId
     * @return
     */
    List<ConfigurationDeployInfo> listDeployVersionByConfiguration(int configureId);

    /**
     * get configuration by cluster id and namespace
     * @param clusterId
     * @param namespace
     * @return
     */
    List<ConfigurationConsole> listConfigurationByClusterIdAndNamespace(int clusterId, String namespace);
}
