package org.domeos.framework.api.service.deployment.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.consolemodel.deployment.VersionDetail;
import org.domeos.framework.api.consolemodel.deployment.VersionInfo;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.deployment.VersionService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 */
@Service("versionService")
public class VersionServiceImpl implements VersionService {

    @Autowired
    VersionBiz versionBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    ClusterBiz clusterBiz;


    @Override
    public Long createVersion(Version version, int deployId) throws Exception {
        checkDeployPermit(deployId, OperationType.MODIFY);
        String versionLegality = version.checkLegality();
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
            versionId = versionBiz.insertVersionWithLogCollect(version, cluster);
        } catch (Exception e) {
            throw ApiException.wrapUnknownException(e);
        }
        return versionId;

    }


    @Override
    public VersionDetail getVersion(int deployId, long versionId) throws Exception {
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
        VersionDetail versionDetail = new VersionDetail();
        versionDetail.setClusterName(cluster.getName());
        versionDetail.setContainerDrafts(version.getContainerDrafts());
        versionDetail.setCreateTime(version.getCreateTime());
        versionDetail.setDeployId(deployId);
        versionDetail.setDeployName(deployment.getName());
        versionDetail.setHostEnv(deployment.getHostEnv());
        versionDetail.setHostList(version.getHostList());
        versionDetail.setLabelSelectors(version.getLabelSelectors());
        versionDetail.setLogDraft(version.getLogDraft());
        versionDetail.setNetworkMode(deployment.getNetworkMode());
        versionDetail.setVersion(versionId);
        versionDetail.setVolumes(version.getVolumes());
        return versionDetail;
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


    void checkDeployPermit(int deployId, OperationType operationType) {
        AuthUtil.verify(CurrentThreadInfo.getUserId(), deployId, ResourceType.DEPLOY, operationType);
    }

}
