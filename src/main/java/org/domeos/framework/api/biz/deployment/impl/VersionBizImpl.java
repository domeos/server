package org.domeos.framework.api.biz.deployment.impl;

import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.mapper.deployment.VersionMapper;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.ClusterLog;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.LogDraft;
import org.domeos.framework.engine.exception.DaoConvertingException;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.util.StringUtils;
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
            flumeDraft.setTag(clusterLog.getImageTag());
            flumeDraft.setImage(clusterLog.getImageName());
            logDraft.setFlumeDraft(flumeDraft);
            version.setLogDraft(logDraft);
        }

        int result = insertRow(version);

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
        List<Version> result = new ArrayList<>();
        List<RowMapperDao> daoList = versionMapper.getAllVersionByDeployId(deployId);
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
}
