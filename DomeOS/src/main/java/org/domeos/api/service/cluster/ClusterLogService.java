package org.domeos.api.service.cluster;

import org.domeos.api.model.cluster.ClusterLog;
import org.domeos.api.model.deployment.Version;

/**
 * Created by zhenfengchen on 15-12-28.
 */
public interface ClusterLogService {
    ClusterLog getClusterLogByClusterId(long clusterId);

    boolean setLogDraft(Version version, long clusterId);
}
