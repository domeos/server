package org.domeos.api.service.ci.impl;

import org.domeos.api.mapper.ci.KubeBuildMapper;
import org.domeos.api.mapper.cluster.ClusterBasicMapper;
import org.domeos.api.model.ci.KubeBuild;
import org.domeos.api.model.cluster.CiCluster;
import org.domeos.api.model.cluster.ClusterBasic;
import org.domeos.api.service.global.GlobalService;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by feiliu206363 on 2015/12/6.
 */
public class KubeServiceInfo {
    static GlobalService globalService;
    static KubeBuildMapper kubeBuildMapper;
    static ClusterBasicMapper clusterBasicMapper;

    @Autowired
    public void setGlobalService(GlobalService globalService) {
        KubeServiceInfo.globalService = globalService;
    }

    @Autowired
    public void setKubeBuildMapper(KubeBuildMapper kubeBuildMapper) {
        KubeServiceInfo.kubeBuildMapper = kubeBuildMapper;
    }

    @Autowired
    public void setClusterBasicMapper(ClusterBasicMapper clusterBasicMapper) {
        KubeServiceInfo.clusterBasicMapper = clusterBasicMapper;
    }

    public static CiCluster getCiCluster() {
        return globalService.getCiCluster();
    }

    public static KubeBuild getKubeBuildById(int buildId) {
        return kubeBuildMapper.getKubeBuildByBuildId(buildId);
    }

    public static ClusterBasic getClusterBasicById(int clusterId) {
        return clusterBasicMapper.getClusterBasicById(clusterId);
    }
}
