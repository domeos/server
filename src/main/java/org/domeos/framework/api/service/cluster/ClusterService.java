package org.domeos.framework.api.service.cluster;

import java.util.List;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
import org.domeos.framework.api.model.cluster.related.NodeLabel;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
public interface ClusterService {
    /**
     *
     * @param clusterCreate
     * @return
     */
    HttpResponseTemp<?> setCluster(ClusterInfo clusterInfo);

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
     * @param namespace
     * @return
     */
    HttpResponseTemp<?> getInstanceListByClusterIdWithNamespace(int id, String namespace);

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
     * @param nodeLabels
     * @return
     */
    HttpResponseTemp<?> setNodeLabels(int id, List<NodeLabel> nodeLabels);

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
     * @param nodeLabels
     * @return
     */
    HttpResponseTemp<?> deleteNodeLabels(int id, List<NodeLabel> nodeLabels);

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
