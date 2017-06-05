package org.domeos.framework.api.biz.cluster;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.ClusterWatcherDeployMap;
import org.domeos.framework.engine.exception.DaoException;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
public interface ClusterBiz extends BaseBiz {

    boolean hasCluster(String name);

    void insertCluster(Cluster cluster) throws DaoException;

    Cluster getClusterById(int id);

    Cluster getClusterByName(String name);

    void updateCluster(Cluster cluster) throws DaoException;

    List<Cluster> listClusters();

    void setClusterWacherDeployMap(ClusterWatcherDeployMap clusterWacherDeployMap);

    int getWatcherSizeDeployMapByClusterId(int clusterId);

    ClusterWatcherDeployMap getWacherDeployMapByClusterId(int clusterId);

    void deleteClusterWatchDeployMapByDeployId(int deployId);
}
