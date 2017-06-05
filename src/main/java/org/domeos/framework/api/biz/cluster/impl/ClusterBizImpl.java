package org.domeos.framework.api.biz.cluster.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.mapper.domeos.cluster.ClusterMapper;
import org.domeos.framework.api.mapper.domeos.cluster.ClusterWatcherDeployMapper;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.ClusterWatcherDeployMap;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Service("clusterBiz")
public class ClusterBizImpl extends BaseBizImpl implements ClusterBiz {

    @Autowired
    ClusterMapper clusterMapper;

    @Autowired
    ClusterWatcherDeployMapper watcherDeployMapper;

    @Override
    public boolean hasCluster(String name) {
        return (super.getByName(GlobalConstant.CLUSTER_TABLE_NAME, name, Cluster.class) != null);
    }

    @Override
    public void insertCluster(Cluster cluster) throws DaoException {
        clusterMapper.insertCluster(cluster, cluster.toString());
    }

    @Override
    public Cluster getClusterById(int id) {
        return super.getById(GlobalConstant.CLUSTER_TABLE_NAME, id, Cluster.class);
    }

    @Override
    public Cluster getClusterByName(String name) {
        return super.getByName(GlobalConstant.CLUSTER_TABLE_NAME, name, Cluster.class);
    }

    @Override
    public List<Cluster> listClusters() {
        return super.getWholeTable(GlobalConstant.CLUSTER_TABLE_NAME, Cluster.class);
    }

    @Override
    public void setClusterWacherDeployMap(ClusterWatcherDeployMap clusterWacherDeployMap) {
        watcherDeployMapper.setClusterWacherDeployMap(clusterWacherDeployMap);
    }

    @Override
    public int getWatcherSizeDeployMapByClusterId(int clusterId) {
        return watcherDeployMapper.getWatcherDeployMapByClusterId(clusterId);
    }

    @Override
    public ClusterWatcherDeployMap getWacherDeployMapByClusterId(int clusterId) {
        return watcherDeployMapper.getDeployIdByClusterId(clusterId);
    }

    @Override
    public void deleteClusterWatchDeployMapByDeployId(int deployId) {
        watcherDeployMapper.deleteClusterWatchDeployMapByDeployId(deployId);
    }

    @Override
    public void updateCluster(Cluster cluster) throws DaoException {
        clusterMapper.updateCluster(cluster, cluster.toString());
    }
}
