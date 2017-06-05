package org.domeos.framework.api.service.configuration.impl;

import org.domeos.basemodel.ResultStat;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.configuration.ConfigurationBiz;
import org.domeos.framework.api.biz.deployment.DeployCollectionBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.consolemodel.configuration.ConfigurationCollectionConsole;
import org.domeos.framework.api.consolemodel.configuration.ConfigurationCollectionInfo;
import org.domeos.framework.api.consolemodel.configuration.ConfigurationConsole;
import org.domeos.framework.api.consolemodel.configuration.ConfigurationDeployInfo;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.configuration.Configuration;
import org.domeos.framework.api.model.configuration.ConfigurationCollection;
import org.domeos.framework.api.model.configuration.ConfigurationDeployMap;
import org.domeos.framework.api.model.deployment.DeployCollection;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.configuration.ConfigurationService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.k8s.ConfigurationWrapper;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
@Service
public class ConfigurationServiceImpl implements ConfigurationService {
    @Autowired
    ConfigurationBiz configurationBiz;

    @Autowired
    CollectionBiz collectionBiz;

    @Autowired
    OperationHistory operationHistory;

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    VersionBiz versionBiz;

    @Autowired
    DeployCollectionBiz deployCollectionBiz;

    @Override
    public Configuration createConfiguration(int collectionId, Configuration configuration) {
        User user = getUser();
        AuthUtil.verify(user.getId(), collectionId, ResourceType.CONFIGURATION_COLLECTION, OperationType.MODIFY);
        if (configuration.checkLegality() != null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, configuration.checkLegality());
        }
        ConfigurationCollection configurationCollection = configurationBiz.getConfigurationCollectionById(collectionId);
        if (configurationCollection == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such id of configuration collection");
        }

        // check name first
        if (configurationBiz.getConfigurationByName(configuration.getName()) != null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "configuration name already exist, choose another!");
        }

        // check k8s cluster auth
        AuthUtil.verify(user.getId(), configuration.getClusterId(), ResourceType.CLUSTER, OperationType.MODIFY);

        configuration.setCreateTime(System.currentTimeMillis());
        configurationBiz.createConfiguration(configuration);

        try {
            ConfigurationWrapper configurationWrapper = new ConfigurationWrapper().init(configuration.getClusterId(), configuration.getNamespace());
            configurationWrapper.createConfigmap(configuration);
        } catch (K8sDriverException e) {
            configurationBiz.removeById(GlobalConstant.CONFIGURATION_TABLE_NAME, configuration.getId());
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, e.getMessage());
        }

        CollectionResourceMap resourceMap = new CollectionResourceMap();
        resourceMap.setCreatorId(user.getId());
        resourceMap.setCollectionId(collectionId);
        resourceMap.setResourceId(configuration.getId());
        resourceMap.setResourceType(ResourceType.CONFIGURATION);
        resourceMap.setUpdateTime(System.currentTimeMillis());
        collectionBiz.addResource(resourceMap);

        OperationRecord record = new OperationRecord(configuration.getId(), ResourceType.CONFIGURATION, OperationType.SET,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return configuration;
    }

    @Override
    public ConfigurationCollection modifyConfigurationCollection(ConfigurationCollection configurationCollection) {
        User user = getUser();
        if (configurationCollection == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "configuration collection is null");
        }
        if (!StringUtils.isBlank(configurationCollection.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, configurationCollection.checkLegality());
        }
        AuthUtil.verify(user.getId(), configurationCollection.getId(), ResourceType.CONFIGURATION_COLLECTION, OperationType.MODIFY);

        if (configurationBiz.getConfigurationByName(configurationCollection.getName()) != null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "name already exist, please change!");
        }

        ConfigurationCollection oldCollection = configurationBiz.getConfigurationCollectionById(configurationCollection.getId());
        if (oldCollection == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such configuration collection");
        }
        oldCollection.setName(configurationCollection.getName());
        oldCollection.setDescription(configurationCollection.getDescription());
        if (configurationCollection.getCreatorId() > 0) {
            oldCollection.setCreatorId(configurationCollection.getCreatorId());
        }

        configurationBiz.updateConfigurationCollectionById(oldCollection);

        OperationRecord record = new OperationRecord(configurationCollection.getId(), ResourceType.CONFIGURATION_COLLECTION, OperationType.MODIFY,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return oldCollection;
    }

    @Override
    public Configuration modifyConfigurationByCollectionId(int collectionId, Configuration configuration) {
        User user = getUser();
        if (configuration == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "configuration is null");
        }
        if (!StringUtils.isBlank(configuration.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, configuration.checkLegality());
        }
        AuthUtil.verify(user.getId(), collectionId, ResourceType.CONFIGURATION_COLLECTION, OperationType.MODIFY);
        if (configurationBiz.getConfigurationById(configuration.getId()) == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such configuration");
        }

        try {
            ConfigurationWrapper configurationWrapper = new ConfigurationWrapper().init(configuration.getClusterId(), configuration.getNamespace());
            configurationWrapper.updateConfigmap(configuration);
        } catch (K8sDriverException e) {
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, e.getMessage());
        }
        configurationBiz.updateConfigurationDescriptionAndDataById(configuration);

        OperationRecord record = new OperationRecord(configuration.getId(), ResourceType.CONFIGURATION, OperationType.MODIFY,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return configuration;
    }

    @Override
    public Configuration modifyConfiguration(Configuration configuration) {
        User user = getUser();
        if (configuration == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "configuration is null");
        }
        if (!StringUtils.isBlank(configuration.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, configuration.checkLegality());
        }
        CollectionResourceMap collectionResourceMap = collectionBiz.getResourceByResourceIdAndResourceType(configuration.getId(),
                ResourceType.CONFIGURATION);
        if (collectionResourceMap == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such configuration");
        }
        AuthUtil.verify(user.getId(), collectionResourceMap.getCollectionId(), ResourceType.CONFIGURATION_COLLECTION, OperationType.MODIFY);
        if (configurationBiz.getConfigurationById(configuration.getId()) == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such configuration");
        }

        try {
            ConfigurationWrapper configurationWrapper = new ConfigurationWrapper().init(configuration.getClusterId(), configuration.getNamespace());
            configurationWrapper.updateConfigmap(configuration);
        } catch (K8sDriverException e) {
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, e.getMessage());
        }
        configurationBiz.updateConfigurationDescriptionAndDataById(configuration);

        OperationRecord record = new OperationRecord(configuration.getId(), ResourceType.CONFIGURATION, OperationType.MODIFY,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return configuration;
    }

    @Override
    public List<ConfigurationDeployInfo> listDeployVersionByConfiguration(int configureId) {
        User user = getUser();
        CollectionResourceMap resourceMap = collectionBiz.getResourceByResourceIdAndResourceType(configureId, ResourceType.CONFIGURATION);
        if (resourceMap == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such configuration");
        }
        AuthUtil.verify(user.getId(), resourceMap.getCollectionId(), ResourceType.CONFIGURATION_COLLECTION, OperationType.GET);

        List<ConfigurationDeployMap> configurationDeployMaps = configurationBiz.getMapsByConfigurationId(configureId);
        if (configurationDeployMaps == null || configurationDeployMaps.isEmpty()) {
            return null;
        }
        List<ConfigurationDeployInfoTask> consoleTasks = new ArrayList<>(configurationDeployMaps.size());
        for (ConfigurationDeployMap configurationDeployMap : configurationDeployMaps) {
            consoleTasks.add(new ConfigurationDeployInfoTask(configurationDeployMap));
        }
        List<ConfigurationDeployInfo> configurationDeployInfos = ClientConfigure.executeCompletionService(consoleTasks);
        if (configurationDeployInfos == null || configurationDeployInfos.isEmpty()) {
            return null;
        }
        Collections.sort(configurationDeployInfos, new ConfigurationDeployInfo.ConfigurationDeployInfoComparator());
        return configurationDeployInfos;
    }

    @Override
    public List<ConfigurationConsole> listConfigurationByClusterIdAndNamespace(int clusterId, String namespace) {
        User user = getUser();
        if (StringUtils.isBlank(namespace)) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "namespace is null!");
        }
        // verify cluster auth
        AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.GET);

        List<CollectionAuthorityMap> collectionAuthorityMaps = AuthUtil.getCollectionList(user.getId(), ResourceType.CONFIGURATION_COLLECTION);
        if (collectionAuthorityMaps == null || collectionAuthorityMaps.isEmpty()) {
            return null;
        }
        List<CollectionResourceMap> resourceMaps = collectionBiz.getResourcesByAuthorityMaps(ResourceType.CONFIGURATION, collectionAuthorityMaps);
        List<ConfigurationConsoleTask> consoleTasks = new ArrayList<>(collectionAuthorityMaps.size());
        for (CollectionResourceMap resourceMap : resourceMaps) {
            consoleTasks.add(new ConfigurationConsoleTask(resourceMap, clusterId, namespace));
        }
        List<ConfigurationConsole> configurationConsoles = ClientConfigure.executeCompletionService(consoleTasks);
        Collections.sort(configurationConsoles, new ConfigurationConsole.ConfigurationListComparator());
        return configurationConsoles;
    }

    private class ConfigurationDeployInfoTask implements Callable<ConfigurationDeployInfo> {
        private ConfigurationDeployMap configurationDeployMap;

        public ConfigurationDeployInfoTask(ConfigurationDeployMap configurationDeployMap) {
            this.configurationDeployMap = configurationDeployMap;
        }

        @Override
        public ConfigurationDeployInfo call() throws Exception {
            Configuration configuration = configurationBiz.getConfigurationById(configurationDeployMap.getConfigurationId());
            Deployment deployment = deploymentBiz.getDeployment(configurationDeployMap.getDeployId());
            Version version = versionBiz.getById(VersionBiz.VERSION_TABLE_NAME, configurationDeployMap.getVersionId(), Version.class);
            if (configuration == null || deployment == null || version == null) {
                return null;
            }
            CollectionResourceMap resourceMap = collectionBiz.getResourceByResourceIdAndResourceType(deployment.getId(),
                    ResourceType.DEPLOY);
            if (resourceMap == null) {
                return null;
            }
            DeployCollection deployCollection = deployCollectionBiz.getDeployCollection(resourceMap.getCollectionId());
            if (deployCollection == null) {
                return null;
            }
            ConfigurationDeployInfo configurationDeployInfo = new ConfigurationDeployInfo();
            configurationDeployInfo.setConfigurationId(configurationDeployMap.getConfigurationId());
            configurationDeployInfo.setConfigurationName(configuration.getName());
            configurationDeployInfo.setDeployCollectionId(resourceMap.getCollectionId());
            configurationDeployInfo.setDeployCollectionName(deployCollection.getName());
            configurationDeployInfo.setDeployId(configurationDeployMap.getDeployId());
            configurationDeployInfo.setDeployName(deployment.getName());
            configurationDeployInfo.setDeployCreateTime(deployment.getCreateTime());
            configurationDeployInfo.setVersionId(configurationDeployMap.getVersionId());
            configurationDeployInfo.setVersionIdInDeploy(version.getVersion());
            return configurationDeployInfo;
        }
    }

    @Override
    public ConfigurationCollectionInfo createConfigurationCollection(ConfigurationCollection configurationCollection) {
        User user = getUser();
        if (!StringUtils.isBlank(configurationCollection.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, configurationCollection.checkLegality());
        }

        if (configurationBiz.getConfigurationCollectionByName(configurationCollection.getName()) != null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "configuration cluster name already exist!");
        }

        configurationCollection.setCreateTime(System.currentTimeMillis());
        configurationCollection.setCreatorId(user.getId());
        configurationBiz.createConfigurationCollection(configurationCollection);

        CollectionAuthorityMap authorityMap = new CollectionAuthorityMap();
        authorityMap.setResourceType(ResourceType.CONFIGURATION_COLLECTION);
        authorityMap.setCollectionId(configurationCollection.getId());
        authorityMap.setUserId(user.getId());
        authorityMap.setRole(Role.MASTER);
        authorityMap.setUpdateTime(System.currentTimeMillis());
        collectionBiz.addAuthority(authorityMap);

        OperationRecord record = new OperationRecord(configurationCollection.getId(), ResourceType.CONFIGURATION_COLLECTION,
                OperationType.SET, user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        ConfigurationCollectionInfo collectionConsole = new ConfigurationCollectionInfo().buildByCollection(configurationCollection);
        collectionConsole.setCreatorInfo(new CreatorInfo().setCreatorId(user.getId()).setName(user.getUsername()));
        collectionConsole.setRole(Role.MASTER);
        return collectionConsole;
    }

    @Override
    public ConfigurationCollectionConsole getConfigurationCollection(int id) {
        User user = getUser();
        AuthUtil.verify(user.getId(), id, ResourceType.CONFIGURATION_COLLECTION, OperationType.GET);
        ConfigurationCollection configurationCollection = configurationBiz.getConfigurationCollectionById(id);
        ConfigurationCollectionConsole collectionConsole = new ConfigurationCollectionConsole();
        collectionConsole.setConfigurationCollection(configurationCollection);
        collectionConsole.setCreatorInfo(new CreatorInfo().setCreatorId(configurationCollection.getCreatorId())
                .setName(AuthUtil.getUserNameById(configurationCollection.getCreatorId())));
        return collectionConsole;
    }

    @Override
    public List<ConfigurationCollectionInfo> listConfigurationCollection() {
        User user = getUser();
        List<CollectionAuthorityMap> collectionAuthorityMaps = AuthUtil.getCollectionList(user.getId(), ResourceType.CONFIGURATION_COLLECTION);
        if (collectionAuthorityMaps == null) {
            return null;
        }
        List<ConfigurationCollectionInfoTask> collectionInfoTasks = new ArrayList<>(collectionAuthorityMaps.size());
        boolean isAdmin = AuthUtil.isAdmin(user.getId());
        for (CollectionAuthorityMap authorityMap : collectionAuthorityMaps) {
            collectionInfoTasks.add(new ConfigurationCollectionInfoTask(isAdmin, authorityMap));
        }
        List<ConfigurationCollectionInfo> collectionInfos = ClientConfigure.executeCompletionService(collectionInfoTasks);

        Collections.sort(collectionInfos, new ConfigurationCollectionInfo.ConfigurationCollectionListComparator());
        return collectionInfos;
    }

    private class ConfigurationCollectionInfoTask implements Callable<ConfigurationCollectionInfo> {
        private boolean isAdmin;
        private CollectionAuthorityMap authorityMap;

        public ConfigurationCollectionInfoTask(boolean isAdmin, CollectionAuthorityMap authorityMap) {
            this.isAdmin = isAdmin;
            this.authorityMap = authorityMap;
        }

        @Override
        public ConfigurationCollectionInfo call() throws Exception {
            if (authorityMap == null) {
                return null;
            }
            ConfigurationCollection collection = configurationBiz.getConfigurationCollectionById(authorityMap.getCollectionId());
            ConfigurationCollectionInfo collectionInfo = new ConfigurationCollectionInfo().buildByCollection(collection);
            collectionInfo.setCreatorInfo(new CreatorInfo()
                    .setCreatorId(collection.getCreatorId()).setName(AuthUtil.getUserNameById(collection.getCreatorId())));
            List<CollectionResourceMap> resourceMaps = collectionBiz.
                    getResourcesByCollectionIdAndResourceType(authorityMap.getCollectionId(), ResourceType.CONFIGURATION);
            if (resourceMaps != null && !resourceMaps.isEmpty()) {
                collectionInfo.setConfigurationCount(resourceMaps.size());
            }
            List<CollectionAuthorityMap> authorityMaps = collectionBiz.getAuthoritiesByCollectionIdAndResourceType(authorityMap.getCollectionId(),
                    ResourceType.CONFIGURATION_COLLECTION);
            if (authorityMaps != null && !authorityMaps.isEmpty()) {
                collectionInfo.setMemberCount(authorityMaps.size());
            }
            if (isAdmin) {
                collectionInfo.setRole(Role.MASTER);
            } else {
                if (Role.GUEST.equals(authorityMap.getRole())) {
                    collectionInfo.setRole(Role.REPORTER);
                } else {
                    collectionInfo.setRole(authorityMap.getRole());
                }
            }
            return collectionInfo;
        }
    }

    @Override
    public Void deleteConfigurationCollection(int id) {
        User user = getUser();
        AuthUtil.verify(user.getId(), id, ResourceType.CONFIGURATION_COLLECTION, OperationType.DELETE);

        List<CollectionResourceMap> collectionResourceMaps = collectionBiz.getResourcesByCollectionIdAndResourceType(id, ResourceType.CONFIGURATION);
        if (collectionResourceMaps != null && !collectionResourceMaps.isEmpty()) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "please delete configuration in this collection first");
        }

        configurationBiz.removeById(GlobalConstant.CONFIGURATION_COLLECTION_TABLE_NAME, id);

        collectionBiz.deleteAuthoritiesByCollectionIdAndResourceType(id, ResourceType.CONFIGURATION_COLLECTION);

        OperationRecord record = new OperationRecord(id, ResourceType.CONFIGURATION_COLLECTION, OperationType.DELETE,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return null;
    }

    @Override
    public ConfigurationConsole getConfigurationByCollectionIdAndId(int collectionId, int configureId) {
        User user = getUser();
        AuthUtil.verify(user.getId(), collectionId, ResourceType.CONFIGURATION_COLLECTION, OperationType.GET);

        CollectionResourceMap resourceMap = collectionBiz.getResourceByResourceIdAndResourceType(configureId, ResourceType.CONFIGURATION);
        if (resourceMap == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such resource in database");
        }

        List<ConfigurationConsoleTask> tasks = new ArrayList<>(1);
        tasks.add(new ConfigurationConsoleTask(resourceMap, -1, null));
        List<ConfigurationConsole> configurationConsoles = ClientConfigure.executeCompletionService(tasks);
        if (configurationConsoles == null || configurationConsoles.isEmpty()) {
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, "cannot get collection, please contact with admin");
        }
        return configurationConsoles.get(0);
    }

    private class ConfigurationConsoleTask implements Callable<ConfigurationConsole> {
        private CollectionResourceMap resourceMap;
        private int clusterId;
        private String namespace;

        public ConfigurationConsoleTask(CollectionResourceMap resourceMap, int clusterId, String namespace) {
            this.resourceMap = resourceMap;
            this.clusterId = clusterId;
            this.namespace = namespace;
        }

        @Override
        public ConfigurationConsole call() throws Exception {
            Configuration configuration = configurationBiz.getConfigurationById(resourceMap.getResourceId());
            if (configuration == null ||
                    (clusterId > 0 && configuration.getClusterId() != clusterId) ||
                    (!StringUtils.isBlank(namespace) && !namespace.equals(configuration.getNamespace()))) {
                return null;
            } else {
                ConfigurationConsole configurationConsole = new ConfigurationConsole();
                configurationConsole.setClusterName(clusterBiz.getNameById(GlobalConstant.CLUSTER_TABLE_NAME, configuration.getClusterId()));
                configurationConsole.setCollectionId(resourceMap.getCollectionId());
                configurationConsole.setConfiguration(configuration);
                configurationConsole.setCreatorInfo(new CreatorInfo().setName(AuthUtil.getUserNameById(resourceMap.getCreatorId()))
                        .setCreatorId(resourceMap.getCreatorId()));
                return configurationConsole;
            }
        }
    }

    @Override
    public ConfigurationConsole getConfigurationById(int configureId) {
        User user = getUser();
        CollectionResourceMap collectionResourceMap = collectionBiz.getResourceByResourceIdAndResourceType(configureId, ResourceType.CONFIGURATION);
        if (collectionResourceMap == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such volume");
        }
        AuthUtil.verify(user.getId(), collectionResourceMap.getCollectionId(), ResourceType.CONFIGURATION_COLLECTION, OperationType.GET);

        List<ConfigurationConsoleTask> tasks = new ArrayList<>(1);
        tasks.add(new ConfigurationConsoleTask(collectionResourceMap, -1, null));
        List<ConfigurationConsole> configurationConsoles = ClientConfigure.executeCompletionService(tasks);
        if (configurationConsoles == null || configurationConsoles.isEmpty()) {
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, "cannot get volume, please contact with admin");
        }
        return configurationConsoles.get(0);
    }

    @Override
    public List<ConfigurationConsole> listConfigurationByCollectionId(int collectionId) {
        User user = getUser();
        AuthUtil.verify(user.getId(), collectionId, ResourceType.CONFIGURATION_COLLECTION, OperationType.GET);
        List<CollectionResourceMap> resourceMaps = collectionBiz.getResourcesByCollectionIdAndResourceType(collectionId, ResourceType.CONFIGURATION);

        if (resourceMaps == null || resourceMaps.isEmpty()) {
            return null;
        }

        List<ConfigurationConsoleTask> consoleTasks = new ArrayList<>(resourceMaps.size());
        for (CollectionResourceMap resourceMap : resourceMaps) {
            consoleTasks.add(new ConfigurationConsoleTask(resourceMap, -1, null));
        }
        List<ConfigurationConsole> configurationConsoles = ClientConfigure.executeCompletionService(consoleTasks);
        Collections.sort(configurationConsoles, new ConfigurationConsole.ConfigurationListComparator());
        return configurationConsoles;
    }

    @Override
    public List<ConfigurationConsole> listAllConfigurations() {
        User user = getUser();
        List<CollectionAuthorityMap> collectionAuthorityMaps = AuthUtil.getCollectionList(user.getId(), ResourceType.CONFIGURATION_COLLECTION);
        if (collectionAuthorityMaps == null || collectionAuthorityMaps.isEmpty()) {
            return null;
        }
        List<CollectionResourceMap> resourceMaps = collectionBiz.getResourcesByAuthorityMaps(ResourceType.CONFIGURATION, collectionAuthorityMaps);
        List<ConfigurationConsoleTask> consoleTasks = new ArrayList<>(collectionAuthorityMaps.size());
        for (CollectionResourceMap resourceMap : resourceMaps) {
            consoleTasks.add(new ConfigurationConsoleTask(resourceMap, -1, null));
        }
        List<ConfigurationConsole> configurationConsoles = ClientConfigure.executeCompletionService(consoleTasks);
        Collections.sort(configurationConsoles, new ConfigurationConsole.ConfigurationListComparator());
        return configurationConsoles;
    }

    @Override
    public List<ConfigurationConsole> listConfigurationByClusterId(int clusterId) {
        User user = getUser();
        // verify cluster auth
        AuthUtil.verify(user.getId(), clusterId, ResourceType.CLUSTER, OperationType.GET);

        List<CollectionAuthorityMap> collectionAuthorityMaps = AuthUtil.getCollectionList(user.getId(), ResourceType.CONFIGURATION_COLLECTION);
        if (collectionAuthorityMaps == null || collectionAuthorityMaps.isEmpty()) {
            return null;
        }
        List<CollectionResourceMap> resourceMaps = collectionBiz.getResourcesByAuthorityMaps(ResourceType.CONFIGURATION, collectionAuthorityMaps);
        List<ConfigurationConsoleTask> consoleTasks = new ArrayList<>(collectionAuthorityMaps.size());
        for (CollectionResourceMap resourceMap : resourceMaps) {
            consoleTasks.add(new ConfigurationConsoleTask(resourceMap, clusterId, null));
        }
        List<ConfigurationConsole> configurationConsoles = ClientConfigure.executeCompletionService(consoleTasks);
        Collections.sort(configurationConsoles, new ConfigurationConsole.ConfigurationListComparator());
        return configurationConsoles;
    }

    @Override
    public Void deleteConfigurationId(int configureId) {
        User user = getUser();
        CollectionResourceMap resourceMap = collectionBiz.getResourceByResourceIdAndResourceType(configureId, ResourceType.CONFIGURATION);
        if (resourceMap == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such configuration");
        }
        AuthUtil.verify(user.getId(), resourceMap.getCollectionId(), ResourceType.CONFIGURATION_COLLECTION, OperationType.GET);

        List<ConfigurationDeployMap> configurationDeployMaps = configurationBiz.getMapsByConfigurationId(configureId);
        if (configurationDeployMaps != null && !configurationDeployMaps.isEmpty()) {
            throw ApiException.wrapMessage(ResultStat.CONFIGURATION_USED, "this configuration used by deployment, please stop deployment first");
        }

        Configuration configuration = configurationBiz.getConfigurationById(configureId);
        if (configuration == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such configuration");
        }

        // do not check cluster auth when delete volume

        try {
            ConfigurationWrapper configurationWrapper = new ConfigurationWrapper()
                    .init(configuration.getClusterId(), configuration.getNamespace());
            configurationWrapper.deleteConfiguration(configuration);
        } catch (K8sDriverException e) {
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, "delete configuration error, message is " + e.getMessage());
        }

        configurationBiz.deleteConfigurationById(configureId);
        collectionBiz.deleteResourceByResourceIdAndResourceType(configureId, ResourceType.CONFIGURATION);

        OperationRecord record = new OperationRecord(configureId, ResourceType.CONFIGURATION, OperationType.DELETE,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return null;
    }

    @Override
    public Void deleteConfigurationCollectionIdAndId(int collectionId, int configureId) {
        User user = getUser();
        AuthUtil.verify(user.getId(), collectionId, ResourceType.CONFIGURATION_COLLECTION, OperationType.GET);

        List<ConfigurationDeployMap> configurationDeployMaps = configurationBiz.getMapsByConfigurationId(configureId);

        if (configurationDeployMaps != null && !configurationDeployMaps.isEmpty()) {
            throw ApiException.wrapMessage(ResultStat.STORAGE_VOLUME_USED, "this configuration mounted by deployment, please stop deployment first");
        }

        Configuration configuration = configurationBiz.getConfigurationById(configureId);
        if (configuration == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such configuration");
        }

        try {
            ConfigurationWrapper configurationWrapper = new ConfigurationWrapper().init(configuration.getClusterId(), configuration.getNamespace());
            configurationWrapper.deleteConfiguration(configuration);
        } catch (K8sDriverException e) {
            throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, "delete pv pvc error, message is " + e.getMessage());
        }

        configurationBiz.deleteConfigurationById(configureId);
        collectionBiz.deleteResourceByResourceIdAndResourceType(configureId, ResourceType.CONFIGURATION);

        OperationRecord record = new OperationRecord(configureId, ResourceType.CONFIGURATION, OperationType.DELETE,
                user.getId(), user.getUsername(), "OK", "", System.currentTimeMillis());
        operationHistory.insertRecord(record);

        return null;
    }

    private User getUser() {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        return user;
    }

}
