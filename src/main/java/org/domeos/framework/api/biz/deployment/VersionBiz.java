package org.domeos.framework.api.biz.deployment;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Version;

import java.util.List;

/**
 */
public interface VersionBiz extends BaseBiz {
    String VERSION_TABLE_NAME = "version";

    int insertRow(Version version);

    int insertVersionWithLogCollect(Version version, Cluster cluster);

    void disableAllVersion(int deployId);

    int updateLabelSelector(Version version);

    Version getVersion(int deployId, int version);

    List<Version> getAllVersionByDeployId(int deployId);

    int updateVersion(Version version);
}
