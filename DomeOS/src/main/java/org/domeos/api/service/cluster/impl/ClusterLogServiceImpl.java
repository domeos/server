package org.domeos.api.service.cluster.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.cluster.ClusterLogMapper;
import org.domeos.api.model.cluster.ClusterLog;
import org.domeos.api.model.deployment.ContainerDraft;
import org.domeos.api.model.deployment.LogDraft;
import org.domeos.api.model.deployment.Version;
import org.domeos.api.service.cluster.ClusterLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by zhenfengchen on 15-12-28.
 */
@Service("clusterLogService")
public class ClusterLogServiceImpl implements ClusterLogService {
    @Autowired
    ClusterLogMapper clusterLogMapper;

    public ClusterLog getClusterLogByClusterId(long clusterId) {
        return clusterLogMapper.getClusterLogByClusterId((int)clusterId);
    }

    public boolean setLogDraft(Version version, long clusterId) {
        LogDraft logDraft = version.getLogDraft();
        ClusterLog clusterLog = getClusterLogByClusterId(clusterId);
        if (clusterLog != null && logDraft != null) {
            if (!StringUtils.isBlank(clusterLog.checkLegality())) {
                return false;
            }
            logDraft.setKafkaBrokers(clusterLog.getKafka());
            ContainerDraft flumeDraft = new ContainerDraft();
            flumeDraft.setCpu(1.0);
            flumeDraft.setMem(2048.0);
            flumeDraft.setTag(clusterLog.getImageTag());
//            if (clusterLog.getRegistry().endsWith("/")) {
//                flumeDraft.setImage(clusterLog.getRegistry() + clusterLog.getImageName());
//            } else {
//                flumeDraft.setImage(clusterLog.getRegistry() + "/" + clusterLog.getImageName());
//            }
            flumeDraft.setImage(clusterLog.getImageName());
            logDraft.setFlumeDraft(flumeDraft);
            return true;
        } else {
            return false;
        }
    }
}
