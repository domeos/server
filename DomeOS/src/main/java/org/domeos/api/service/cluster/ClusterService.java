package org.domeos.api.service.cluster;

import org.domeos.api.model.console.Cluster.Cluster;
import org.domeos.api.model.console.Cluster.NodeLabel;
import org.domeos.basemodel.HttpResponseTemp;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public interface ClusterService {
    /**
     *
     * @param cluster
     * @param userId
     * @return
     */
    HttpResponseTemp<?> setCluster(Cluster cluster, Long userId);

    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> listCluster(Long userId);

    /**
     *
     * @param id
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getCluster(int id, Long userId);

    /**
     *
     * @param cluster
     * @param userId
     * @return
     */
    HttpResponseTemp<?> updateCluster(Cluster cluster, Long userId);

    /**
     *
     * @param id
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteCluster(int id, Long userId);

    /**
     *
     * @param id
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getAllNamespacesByClusterId(int id, long userId);

    /**
     *
     * @param id
     * @param namespaces
     * @param userId
     * @return
     */
    HttpResponseTemp<?> putNamespacesByClusterId(int id, List<String> namespaces, long userId);

    /**
     *
     * @param id
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getNodeListByClusterId(int id, long userId);

    /**
     *
     * @param id
     * @param labels
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getNodeListByClusterIdWithLabels(int id, String labels, long userId);

    /**
     *
     * @param id
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getLabelsByClusterId(int id, long userId);

    /**
     *
     * @param id
     * @param name
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getInstanceListByNodeName(int id, String name, long userId);

    /**
     *
     * @param id
     * @param nodeLabel
     * @param userId
     * @return
     */
    HttpResponseTemp<?> setNodeLabelsByNodeName(int id, NodeLabel nodeLabel, long userId);

    /**
     *
     * @param id
     * @param name
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getNodeByClusterIdAndName(int id, String name, long userId);

    /**
     *
     * @param id
     * @param nodeName
     * @param label
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteLabelsByClusterId(int id, String nodeName, String label, long userId);

    /**
     *
     * @param id
     * @param nodeName
     * @param userId
     * @return
     */
    HttpResponseTemp<?> addDiskForNode(int id, String nodeName, String path, long userId) throws Exception;

    /**
     *
     * @param id
     * @param nodeName
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteDiskForNode(int id, String nodeName, long userId) throws Exception;
}
