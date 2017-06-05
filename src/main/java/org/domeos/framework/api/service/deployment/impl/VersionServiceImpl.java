package org.domeos.framework.api.service.deployment.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.exception.DeploymentEventException;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.configuration.ConfigurationBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.consolemodel.deployment.*;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.configuration.Configuration;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.deployment.VersionService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.RuntimeDriver;
import org.domeos.framework.engine.coderepo.ReflectFactory;
import org.domeos.framework.engine.k8s.handler.DeployResourceHandler;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 */
@Service
public class VersionServiceImpl implements VersionService {

    @Autowired
    VersionBiz versionBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    ConfigurationBiz configurationBiz;

    @Override
    public Long createVersion(VersionDraft versionDraft, int deployId) throws Exception {
        checkDeployPermit(deployId, OperationType.MODIFY);
        versionDraft.convertToVersion();
        String versionLegality = versionDraft.checkLegality();
        if (!StringUtils.isBlank(versionLegality)) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_LEGAL, versionLegality);
        }
        long versionId;
        try {
            Deployment deployment = deploymentBiz.getDeployment(deployId);
            if (deployment == null) {
                throw ApiException.wrapResultStat(ResultStat.DEPLOYMENT_NOT_EXIST);
            }
            Cluster cluster = clusterBiz.getClusterById(deployment.getClusterId());
            if (cluster == null) {
                throw ApiException.wrapResultStat(ResultStat.CLUSTER_NOT_EXIST);
            }
            versionId = versionBiz.insertVersionWithLogCollect(versionDraft, cluster);
        } catch (Exception e) {
            versionBiz.removeById(GlobalConstant.VERSION_TABLE_NAME, versionDraft.getId());
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, e.getMessage());
        }
        return versionId;

    }

    @Override
    public VersionDraft getVersion(int deployId, int versionId) throws Exception {
        checkDeployPermit(deployId, OperationType.GET);
        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapResultStat(ResultStat.VERSION_NOT_EXIST);
        }
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOYMENT_NOT_EXIST);
        }
        // get clusterName by clusterId
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, deployment.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_NOT_EXIST);
        }
        VersionDraft versionDraft = new VersionDraft(version, deployment, cluster);
        if (version.getVersionType() != VersionType.CUSTOM) {
            DeployResourceHandler deployResourceHandler = ReflectFactory.createDeployResourceHandler(
                    deployment.getDeploymentType().getDeployClassName(), null, deployment);
            VersionString versionString = null;
            if (deployResourceHandler != null) {
                versionString = deployResourceHandler.getVersionString(version, null, null);
            }
            if (versionString != null) {
                versionString.setPodSpecStr(version.getPodSpecStr());

            }
            versionDraft.setVersionString(versionString);
        }

        return versionDraft;
    }

    @Override
    public List<VersionInfo> listVersion(int deployId) throws Exception {
        checkDeployPermit(deployId, OperationType.GET);
        List<Version> versions = versionBiz.getAllVersionByDeployId(deployId);
        if (versions == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "does not have version for deploy " + deployId);
        }
        List<VersionInfo> versionInfos = new ArrayList<>(versions.size());
        for (Version version : versions) {
            VersionInfo versionInfo = new VersionInfo(version);
            versionInfos.add(versionInfo);
        }
        Collections.sort(versionInfos, new Comparator<VersionInfo>() {
            @Override
            public int compare(VersionInfo o1, VersionInfo o2) {
                return ((Long) o2.getVersion()).compareTo(o1.getVersion());
            }
        });

        return versionInfos;
    }

    @Override
    public HttpResponseTemp<?> deprecateVersionById(int id) {
        Version version = versionBiz.getById(GlobalConstant.VERSION_TABLE_NAME, id, Version.class);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version!");
        }
        deprecateVersion(version);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> deprecateVersionByDeployIdAndVersionId(int deployId, int versionId) {
        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version!");
        }
        deprecateVersion(version);
        return ResultStat.OK.wrap(null);
    }
    
    @Override
    public HttpResponseTemp<?> enableVersionById(int id) {
        Version version = versionBiz.getById(GlobalConstant.VERSION_TABLE_NAME, id, Version.class);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version!");
        }
        enableVersion(version);
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> enableVersionByDeployIdAndVersionId(int deployId, int versionId) {
        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "no such version!");
        }
        enableVersion(version);
        return ResultStat.OK.wrap(null);
    }
    
    private void deprecateVersion(Version version) {
        User user = getUser();
        AuthUtil.verify(user.getId(), version.getDeployId(), ResourceType.DEPLOY, OperationType.MODIFY);
        Deployment deployment = deploymentBiz.getDeployment(version.getDeployId());
        if (deployment == null) {
            throw ApiException.wrapResultStat(ResultStat.DEPLOYMENT_NOT_EXIST);
        }
        if (checkDeprecated(deployment, version.getId())) {
            version.setDeprecate(true);
            versionBiz.updateVersion(version);
            configurationBiz.removeConfigurationVersionMapByVersionId(version.getId());
        } else {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DEPRECATE_VERSION, "can't  deprecate current version");
        }
    }
    
    private void enableVersion(Version version) {
        User user = getUser();
        AuthUtil.verify(user.getId(), version.getDeployId(), ResourceType.DEPLOY, OperationType.MODIFY);
        // check config existence first
        checkConfigExistence(version);
        try {
            versionBiz.enableVersion(version);
        } catch (Exception e) {
            configurationBiz.removeConfigurationVersionMapByVersionId(version.getId());
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, e.getMessage());
        }
        
    }
    
    void checkDeployPermit(int deployId, OperationType operationType) {
        AuthUtil.verify(CurrentThreadInfo.getUserId(), deployId, ResourceType.DEPLOY, operationType);
    }

    private User getUser() {
        User user = CurrentThreadInfo.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        return user;
    }
    
    private void checkConfigExistence(Version version) {
        if (version.getVolumeDrafts() != null && !version.getVolumeDrafts().isEmpty()) {
            for (VolumeDraft volumeDraft : version.getVolumeDrafts()) {
                VolumeConfigMap volumeConfigMap = volumeDraft.getVolumeConfigMap();
                if (VolumeType.CONFIGMAP.equals(volumeDraft.getVolumeType()) && volumeConfigMap != null) {
                    Configuration config = configurationBiz.getConfigurationById(volumeConfigMap.getConfigurationId());
                    if (config == null) {
                        throw ApiException.wrapMessage(ResultStat.CANNOT_ENABLE_VERSION, "Failed to restore, config " + volumeConfigMap.getName() + " have been deleted.");
                    }
                }
            }
        }
    }
    
    private boolean checkDeprecated(Deployment deployment, int deprecatedVersionId) {
        if (!DeploymentStatus.STOP.name().equals(deployment.getState())) {
            RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(deployment.getClusterId());
            if (driver == null) {
                throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, " There is no RuntimeDriver for cluster(" + deployment.getClusterId() + ").");
            }
            // get current versions
            List<Version> versions;
            try {
                versions = driver.getCurrnetVersionsByDeployment(deployment);
            } catch (DeploymentEventException e) {
                return false;
            }
            if (versions != null) {
                for (Version ver : versions) {
                    if (ver.getId() == deprecatedVersionId) {
                        return false;
                    }
                }
            } 
        }
        return true;
    }
}