package org.domeos.framework.api.biz.deployment.impl;

import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.consolemodel.deployment.VolumeDraft;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.mapper.domeos.configuration.ConfigurationDeployMapper;
import org.domeos.framework.api.mapper.domeos.deployment.VersionMapper;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.ClusterLog;
import org.domeos.framework.api.model.configuration.ConfigurationDeployMap;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.LogDraft;
import org.domeos.framework.api.model.deployment.related.VolumeType;
import org.domeos.framework.api.model.storage.VolumeDeployMap;
import org.domeos.framework.engine.exception.DaoConvertingException;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 */
@Service
public class VersionBizImpl extends BaseBizImpl implements VersionBiz {

    @Autowired
    VersionMapper versionMapper;

    @Autowired
    ConfigurationDeployMapper configurationDeployMapper;

    @Override
    public int insertRow(Version version) {
        Integer verNow = versionMapper.getMaxVersion(version.getDeployId());
        if (verNow == null) {
            verNow = 0;
        }
        verNow++;
        version.setVersion(verNow);
        version.setName("version" + version.getVersion());
        version.setCreateTime(System.currentTimeMillis());
        versionMapper.insertRow(version, version.toString());
        return verNow;
    }

    @Override
    public int insertVersionWithLogCollect(Version version, Cluster cluster) {
        ClusterLog clusterLog = cluster.getClusterLog();
        if (checkVersionEnable(version)) {
            if (clusterLog == null) {
                throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_LEGAL, "cluster log info not exist");
            }
            if (!StringUtils.isBlank(clusterLog.checkLegality())) {
                throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, clusterLog.checkLegality());
            }
            LogDraft logDraft = version.getLogDraft();
            if (logDraft == null) {
                logDraft = new LogDraft();
            }
            logDraft.setKafkaBrokers(clusterLog.getKafka());
            ContainerDraft flumeDraft = new ContainerDraft();
            flumeDraft.setCpu(1.0);
            flumeDraft.setMem(2048.0);
            flumeDraft.setCpuRequest(0.1);
            flumeDraft.setMemRequest(1.0);
            flumeDraft.setTag(clusterLog.getImageTag());
            flumeDraft.setImage(clusterLog.getImageName());
            logDraft.setFlumeDraft(flumeDraft);
            version.setLogDraft(logDraft);
        }

        int result = insertRow(version);
        enableVersion(version);
        return result;
    }

    @Override
    public void disableAllVersion(int deployId) {
        versionMapper.disableAllVersion(deployId);
    }

    @Override
    public Version getVersion(int deployId, int versionId) {
        RowMapperDao dao = versionMapper.getVersion(deployId, versionId);
        return checkResult(dao, Version.class);
    }

    @Override
    public List<Version> getAllVersionByDeployId(int deployId) {
        List<RowMapperDao> daoList = versionMapper.getAllVersionByDeployId(deployId);
        if (daoList == null || daoList.isEmpty()) {
            return new ArrayList<>(1);
        }
        List<Version> result = new ArrayList<>(daoList.size());
        for (RowMapperDao dao : daoList) {
            try {
                result.add(checkResult(dao, Version.class));
            } catch (DaoConvertingException e) {
                // to ignore the exception and continue;
            }
        }
        return result;
    }

    @Override
    public int updateVersion(Version version) {
        return versionMapper.updateLabelSelector(version.getId(), version.toString());
    }

    @Override
    public void enableVersion(Version version) {
        if (version.getVolumeDrafts() != null) {
            for (VolumeDraft volumeDraft : version.getVolumeDrafts()) {
                if (VolumeType.CONFIGMAP.equals(volumeDraft.getVolumeType()) && volumeDraft.getVolumeConfigMap() != null) {
                    ConfigurationDeployMap deployMap = new ConfigurationDeployMap();
                    deployMap.setConfigurationId(volumeDraft.getVolumeConfigMap().getConfigurationId());
                    deployMap.setDeployId(version.getDeployId());
                    deployMap.setVersionId(version.getId());
                    deployMap.setCreateTime(System.currentTimeMillis());
                    configurationDeployMapper.addConfigurationVersionMount(deployMap);
                }
            }
        }
        version.setDeprecate(false);
        versionMapper.updateLabelSelector(version.getId(), version.toString());
    }

    @Override
    public int updateLabelSelector(Version version) {
        return versionMapper.updateLabelSelector(version.getId(), version.toString());
    }

    private boolean checkVersionEnable(Version version) {
        if (version == null) {
            return false;
        }
        LogDraft logDraft = version.getLogDraft();
        // for version 0.3
        if (logDraft != null && logDraft.getLogItemDrafts() != null && logDraft.getLogItemDrafts().size() > 0) {
            return true;
        }
        // for version 0.4
        List<ContainerDraft> containerDrafts = version.getContainerDrafts();
        if (containerDrafts == null) {
            return true;
        }
        for (ContainerDraft containerDraft : containerDrafts) {
            if (containerDraft.getLogItemDrafts() != null && containerDraft.getLogItemDrafts().size() > 0) {
                return true;
            }
        }
        return false;
    }

//    @Autowired
//    ClusterBasicMapper clusterBasicMapper;
//
//    @Autowired
//    ClusterLogService clusterLogService;
//
//    @Autowired
//    DeploymentBiz deploymentBiz;
//
//
//    private void setLogDraft(Version version, long deployId) throws IOException {
//        if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
//            Deployment deployment = deploymentBiz.getDeployment(deployId);
//            if (deployment != null) {
//                String clusterName = deployment.getClusterName();
//                ClusterBasic clusterBasic = clusterBasicMapper.getClusterBasicByName(clusterName);
//                long clusterId = clusterBasic.getId();
//
//                // set log flume image related
//                clusterLogService.setLogDraft(version, clusterId);
//                /* openxxs comment this checkContainerLegality(kafka and flume setting check)
//                /* For this situation: add cluster kafka and flume -> create deployment version with log ->
//                   delete cluster kafka and flume -> get or list deployment version with log
//                String logDraftCheckLegality = version.getLogDraft().checkContainerLegality();
//                if (!StringUtils.isBlank(logDraftCheckLegality)) {
//                    throw new IOException(logDraftCheckLegality);
//                }
//                */
//            }
//        }
//    }
//
//    @Override
//    public long createVersion(Version version) throws Exception {
//        VersionDBProto proto = buildVersionDBProto(version);
//
//        Long verNow = versionMapper.getMaxVersion(proto.getDeployId());
//        if (verNow == null) {
//            verNow = 0L;
//        }
//
//        verNow++;
//        proto.setVersion(verNow);
//        try {
//            versionMapper.createVersion(proto);
//        } catch (Exception e) {
//            throw new Exception("create new version failed, detail:" + e.getMessage(), e);
//        }
//        return verNow;
//    }
//
//    @Override
//    public Version getVersion(long deployId, long version) throws IOException {
//        VersionDBProto proto = versionMapper.getVersion(deployId, version);
//        return buildVersion(proto);
//    }
//
//    @Override
//    public Version getNewestVersion(long deployId) throws IOException {
//        VersionDBProto currentVersionDBProto = versionMapper.getNewestVersion(deployId);
//        return buildVersion(currentVersionDBProto);
//    }
//
//    @Override
//    public void deleteAllVersion(long deployId) {
//        List<VersionDBProto> versionDBProtos = versionMapper.listVersionByDeployId(deployId);
//        for (VersionDBProto proto : versionDBProtos) {
//            versionMapper.deleteVersionById(proto.getVid());
//        }
//    }
//
//    @Override
//    public List<Version> listVersions(long deployId) throws IOException {
//        List<VersionDBProto> protos = versionMapper.listVersionByDeployId(deployId);
//        if (protos == null || protos.size() == 0) {
//            return null;
//        }
//        List<Version> versions = new ArrayList<>(protos.size());
//        for (VersionDBProto versionDBProto : protos) {
//            Version version = buildVersion(versionDBProto);
//            versions.add(version);
//        }
//        return versions;
//    }
//
//    @Override
//    public VersionDetail buildVersionDetail(long deployId, long versionId) throws IOException {
//        VersionDetail versionDetail = new VersionDetail();
//        versionDetail.setVersion(versionId);
//        versionDetail.setDeployId(deployId);
//
//        Deployment deployment = deploymentBiz.getDeployment(deployId);
//        if (deployment == null) {
//            return null;
//        }
//        versionDetail.setClusterName(deployment.getClusterName());
//        versionDetail.setDeployName(deployment.getDeployName());
//        versionDetail.setHostEnv(deployment.getHostEnv());
//
//        Version version = this.getVersion(deployId, versionId);
//        if (version == null) {
//            return null;
//        }
//        versionDetail.setCreateTime(version.getCreateTime());
//        versionDetail.setContainerDrafts(version.getContainerDrafts());
//        versionDetail.setLogDraft(version.getLogDraft());
//        versionDetail.setLabelSelectors(version.getLabelSelectors());
//        versionDetail.setNetworkMode(deployment.getNetworkMode());
//        versionDetail.setVolumes(version.getVolumes());
//        versionDetail.setHostList(version.getHostList());
//
//        return versionDetail;
//    }
//
//    public final Version buildVersion(VersionDBProto versionDBProto) throws IOException {
//        Version version = objectMapper.readValue(versionDBProto.getContents(), Version.class);
//        version.setDeployId(versionDBProto.getDeployId());
//        version.setVid(versionDBProto.getVid());
//        version.setVersion(versionDBProto.getVersion());
//        setLogDraft(version, versionDBProto.getDeployId());
//        return version;
//    }
//
//    public final VersionDBProto buildVersionDBProto(Version version) throws JsonProcessingException {
//        VersionDBProto proto = new VersionDBProto();
//        proto.setDeployId(version.getDeployId());
//        proto.setVersion(version.getVersion());
//        proto.setContents(objectMapper.writeValueAsString(version));
//        return proto;
//    }
//
//    public final Version buildVersion(DeploymentDraft deploymentDraft, long deployId) {
//        Version version = new Version();
//        version.setCreateTime(System.currentTimeMillis() / 1000);
//        version.setDeployId(deployId);
//        version.setContainerDrafts(deploymentDraft.getContainerDrafts());
//        version.setLabelSelectors(deploymentDraft.getLabelSelectors());
//        version.setLogDraft(deploymentDraft.getLogDraft());
//        version.setVolumes(deploymentDraft.getVolumes());
//        version.setHostList(deploymentDraft.getHostList());
////        version.setNetworkMode(deploymentDraft.getNetworkMode());
//        return version;
//    }
//
//    public final boolean versionExist(long deployId, long versionId) {
//        List<VersionDBProto> versionDBProtos = versionMapper.listVersionByDeployId(deployId);
//        for (VersionDBProto versionDBProto : versionDBProtos) {
//            if (versionDBProto.getVersion() == versionId) {
//                return true;
//            }
//        }
//        return false;
//    }

}
