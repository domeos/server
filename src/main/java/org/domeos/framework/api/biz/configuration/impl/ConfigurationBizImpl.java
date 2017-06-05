package org.domeos.framework.api.biz.configuration.impl;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.configuration.ConfigurationBiz;
import org.domeos.framework.api.mapper.domeos.configuration.ConfigurationCollectionMapper;
import org.domeos.framework.api.mapper.domeos.configuration.ConfigurationDeployMapper;
import org.domeos.framework.api.mapper.domeos.configuration.ConfigurationMapper;
import org.domeos.framework.api.model.configuration.Configuration;
import org.domeos.framework.api.model.configuration.ConfigurationCollection;
import org.domeos.framework.api.model.configuration.ConfigurationDeployMap;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
@Service("configurationBiz")
public class ConfigurationBizImpl extends BaseBizImpl implements ConfigurationBiz {
    @Autowired
    ConfigurationMapper configurationMapper;
    @Autowired
    ConfigurationCollectionMapper collectionMapper;
    @Autowired
    ConfigurationDeployMapper configurationDeployMapper;
    @Autowired
    BaseBiz baseBiz;

    @Override
    public RowMapperDao getConfigurationCollectionByName(String name) {
        return collectionMapper.getConfigurationCollectionByName(name);
    }

    @Override
    public void createConfigurationCollection(ConfigurationCollection configurationCollection) {
        collectionMapper.createConfigurationCollection(configurationCollection, configurationCollection.toString());
    }

    @Override
    public ConfigurationCollection getConfigurationCollectionById(int id) {
        RowMapperDao tmp = collectionMapper.getConfigurationCollectionById(id);
        if (tmp != null) {
            return checkResult(tmp, ConfigurationCollection.class);
        } else {
            return null;
        }
    }

    @Override
    public RowMapperDao getConfigurationByName(String name) {
        return configurationMapper.getConfigurationByName(name);
    }

    @Override
    public void createConfiguration(Configuration configuration) {
        configurationMapper.createConfiguration(configuration, configuration.toString());
    }

    @Override
    public Configuration getConfigurationById(int resourceId) {
        RowMapperDao tmp = configurationMapper.getConfigurationById(resourceId);
        if (tmp != null) {
            return checkResult(tmp, Configuration.class);
        } else {
            return null;
        }
    }

    @Override
    public List<ConfigurationDeployMap> getMapsByConfigurationId(int configureId) {
        return configurationDeployMapper.getMapsByConfigurationId(configureId);
    }

    @Override
    public void addConfigurationVersionMount(ConfigurationDeployMap configurationDeployMap) {
        configurationDeployMapper.addConfigurationVersionMount(configurationDeployMap);
    }

    @Override
    public void removeConfigurationVersionMapByDeployId(int deployId) {
        configurationDeployMapper.removeConfigurationVersionMapByDeployId(deployId);
    }

    @Override
    public void removeConfigurationVersionMapByVersionId(int deployId) {
        configurationDeployMapper.removeConfigurationVersionMapByVersionId(deployId);
    }

    @Override
    public void deleteConfigurationById(int configureId) {
        removeById(GlobalConstant.CONFIGURATION_TABLE_NAME, configureId);
    }

    @Override
    public void updateConfigurationDescriptionAndDataById(Configuration configuration) {
        configurationMapper.updateConfiguration(configuration, configuration.toString());
    }

    @Override
    public void updateConfigurationCollectionById(ConfigurationCollection configurationCollection) {
        collectionMapper.updateConfigurationCollection(configurationCollection, configurationCollection.toString());
    }
}
