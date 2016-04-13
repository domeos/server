package org.domeos.framework.api.biz.deployment.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.mapper.deployment.VersionMapper;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.engine.model.RowMapperDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 */
@Service("versionBiz")
public class VersionBizImpl extends BaseBizImpl implements VersionBiz {

    @Autowired
    VersionMapper versionMapper;

    @Override
    public long insertRow(Version version) {
        Long verNow = versionMapper.getMaxVersion(version.getDeployId());
        if (verNow == null) {
            verNow = 0L;
        }
        verNow++;
        version.setVersion(verNow);
        version.setName("version" + version.getVersion());
        version.setCreateTime(System.currentTimeMillis());
        versionMapper.insertRow(version, version.toString());
        return verNow;
    }

    @Override
    public void disableAllVersion(int deployId) {
        versionMapper.disableAllVersion(deployId);
    }

    @Override
    public Version getVersion(int deployId, long versionId) {
        RowMapperDao dao =  versionMapper.getVersion(deployId, versionId);
        return checkResult(dao, Version.class);
    }

    @Override
    public List<Version> getAllVersionByDeployId(int deployId) {
        List<Version> result = new ArrayList<>();
        List<RowMapperDao> daoList = versionMapper.getAllVersionByDeployId(deployId);
        for (RowMapperDao dao : daoList) {
            result.add(checkResult(dao, Version.class));
        }
        return result;
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
//                /* For this situation: add cluster kafka and flume -> create deployment version with log -> delete cluster kafka and flume -> get or list deployment version with log
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
