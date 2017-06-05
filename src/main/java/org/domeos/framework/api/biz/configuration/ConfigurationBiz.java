package org.domeos.framework.api.biz.configuration;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.configuration.Configuration;
import org.domeos.framework.api.model.configuration.ConfigurationCollection;
import org.domeos.framework.api.model.configuration.ConfigurationDeployMap;
import org.domeos.framework.engine.model.RowMapperDao;

import java.util.List;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
public interface ConfigurationBiz extends BaseBiz {
    /**
     * get collection by name to judge if collection already exist
     * @param name
     * @return
     */
    RowMapperDao getConfigurationCollectionByName(String name);

    /**
     * create configuration collection
     * @param configurationCollection
     */
    void createConfigurationCollection(ConfigurationCollection configurationCollection);

    /**
     * get  configuration collection by id
     * @param id
     * @return
     */
    ConfigurationCollection getConfigurationCollectionById(int id);

    /**
     * get configuration by name to judge if name already exist
     * @param name
     * @return
     */
    RowMapperDao getConfigurationByName(String name);

    /**
     * create configuration
     * @param configuration
     */
    void createConfiguration(Configuration configuration);

    /**
     * get configuration by id
     * @param resourceId
     * @return
     */
    Configuration getConfigurationById(int resourceId);

    /**
     * get configuration list mounted by any deploy
     * @param configureId
     * @return
     */
    List<ConfigurationDeployMap> getMapsByConfigurationId(int configureId);

    /**
     * add configuration version deploy info
     * @param configurationDeployMap
     */
    void addConfigurationVersionMount(ConfigurationDeployMap configurationDeployMap);

    /**
     * remove configuration version deploy info by deploy id
     * @param deployId
     */
    void removeConfigurationVersionMapByDeployId(int deployId);

    /**
     * remove configuration version deploy info by version id
     * @param versionId
     */
    void removeConfigurationVersionMapByVersionId(int versionId);

    /**
     * delete configuration by id
     * @param configureId
     */
    void deleteConfigurationById(int configureId);

    /**
     * update configuration info
     * @param configuration
     */
    void updateConfigurationDescriptionAndDataById(Configuration configuration);

    /**
     * update configuration collection info
     * @param configurationCollection
     */
    void updateConfigurationCollectionById(ConfigurationCollection configurationCollection);
}
