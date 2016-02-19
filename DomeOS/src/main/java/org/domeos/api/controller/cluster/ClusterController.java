package org.domeos.api.controller.cluster;

import org.domeos.api.model.console.Cluster.Cluster;
import org.domeos.api.model.console.Cluster.NodeLabel;
import org.domeos.api.service.cluster.ClusterService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
@Controller
@RequestMapping("/api/cluster")
public class ClusterController {
    @Autowired
    ClusterService clusterService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setCluster(@RequestBody Cluster cluster) {
        long userId = AuthUtil.getUserId();
        return clusterService.setCluster(cluster, userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> getClusters() {
        long userId = AuthUtil.getUserId();
        return clusterService.listCluster(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getClusterById(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return clusterService.getCluster(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> updateClusterById(@RequestBody Cluster cluster) {
        long userId = AuthUtil.getUserId();
        return clusterService.updateCluster(cluster, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteClusterById(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return clusterService.deleteCluster(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/namespace", method = RequestMethod.GET)
    public HttpResponseTemp<?> getAllNamespacesByClusterId(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return clusterService.getAllNamespacesByClusterId(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/namespace", method = RequestMethod.POST)
    public HttpResponseTemp<?> putNamespacesByClusterId(@PathVariable int id, @RequestBody List<String> namespaces) {
        long userId = AuthUtil.getUserId();
        return clusterService.putNamespacesByClusterId(id, namespaces, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelist", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNodeListByClusterId(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return clusterService.getNodeListByClusterId(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/node/{name}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNodeByClusterIdAndName(@PathVariable int id, @PathVariable String name) {
        long userId = AuthUtil.getUserId();
        return clusterService.getNodeByClusterIdAndName(id, name, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelist/{name}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getInstanceListByNodeName(@PathVariable int id, @PathVariable String name) {
        long userId = AuthUtil.getUserId();
        return clusterService.getInstanceListByNodeName(id, name, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelabels", method = RequestMethod.POST)
    public HttpResponseTemp<?> setNodeLablesByNodeName(@PathVariable int id, @RequestBody NodeLabel nodeLabel) {
        long userId = AuthUtil.getUserId();
        return clusterService.setNodeLabelsByNodeName(id, nodeLabel, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelistwithlabels", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNodeListByClusterIdWithLabels(@PathVariable int id, @RequestParam String labels) {
        long userId = AuthUtil.getUserId();
        return clusterService.getNodeListByClusterIdWithLabels(id, labels, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/labels", method = RequestMethod.GET)
    public HttpResponseTemp<?> getLabelsByClusterId(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return clusterService.getLabelsByClusterId(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/{nodeName}/{label}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteLabelsByClusterId(@PathVariable int id, @PathVariable String nodeName, @PathVariable String label) {
        long userId = AuthUtil.getUserId();
        return clusterService.deleteLabelsByClusterId(id, nodeName, label, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/{nodeName}/disk", method = RequestMethod.POST)
    public HttpResponseTemp<?> addDiskForNode(@PathVariable int id, @PathVariable String nodeName, @RequestParam String path) throws Exception {
        long userId = AuthUtil.getUserId();
        return clusterService.addDiskForNode(id, nodeName, path, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/{nodeName}/disk", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteDiskForNode(@PathVariable int id, @PathVariable String nodeName) throws Exception {
        long userId = AuthUtil.getUserId();
        return clusterService.deleteDiskForNode(id, nodeName, userId);
    }
}
