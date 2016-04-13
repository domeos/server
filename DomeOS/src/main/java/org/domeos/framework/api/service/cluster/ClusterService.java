package org.domeos.framework.api.service.cluster;

import org.domeos.framework.api.consolemodel.cluster.ClusterCreate;
import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
import org.domeos.framework.api.model.cluster.related.NodeLabel;
import org.domeos.basemodel.HttpResponseTemp;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public interface ClusterService {
    /**
     *
     * @param clusterCreate
     * @return
     */
    HttpResponseTemp<?> setCluster(ClusterCreate clusterCreate);

    /**
     *
     * @return
     */
    HttpResponseTemp<?> listCluster();

    /**
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> getCluster(int id);

    /**
     *
     * @param cluster
     * @return
     */
    HttpResponseTemp<?> updateCluster(ClusterInfo cluster);

    /**
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> deleteCluster(int id);

    /**
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> getAllNamespacesByClusterId(int id);

    /**
     *
     * @param id
     * @param namespaces
     * @return
     */
    HttpResponseTemp<?> putNamespacesByClusterId(int id, List<String> namespaces);

    /**
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> getNodeListByClusterId(int id);

    /**
     *
     * @param id
     * @param labels
     * @return
     */
    HttpResponseTemp<?> getNodeListByClusterIdWithLabels(int id, String labels);

    /**
     *
     * @param id
     * @return
     */
    HttpResponseTemp<?> getLabelsByClusterId(int id);

    /**
     *
     * @param id
     * @param name
     * @return
     */
    HttpResponseTemp<?> getInstanceListByNodeName(int id, String name);

    /**
     *
     * @param id
     * @param nodeLabel
     * @return
     */
    HttpResponseTemp<?> setNodeLabelsByNodeName(int id, NodeLabel nodeLabel);

    /**
     *
     * @param id
     * @param name
     * @return
     */
    HttpResponseTemp<?> getNodeByClusterIdAndName(int id, String name);

    /**
     *
     * @param id
     * @param nodeName
     * @param label
     * @return
     */
    HttpResponseTemp<?> deleteLabelsByClusterId(int id, String nodeName, String label);

    /**
     *
     * @param id
     * @param nodeName
     * @return
     */
    HttpResponseTemp<?> addDiskForNode(int id, String nodeName, String path) throws Exception;

    /**
     *
     * @param id
     * @param nodeName
     * @return
     */
    HttpResponseTemp<?> deleteDiskForNode(int id, String nodeName) throws Exception;
}
