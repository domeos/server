package org.domeos.framework.api.controller.cluster;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.cluster.ClusterWatcherConf;
import org.domeos.framework.api.model.cluster.related.NodeLabel;
import org.domeos.framework.api.service.cluster.ClusterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
@Controller
@RequestMapping("/api/cluster")
public class ClusterController extends ApiController {

    @Autowired
    ClusterService clusterService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setCluster(@RequestBody ClusterInfo clusterInfo) {
        return clusterService.setCluster(clusterInfo);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> getClusters() {
        return clusterService.listCluster();
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getClusterById(@PathVariable int id) {
        return clusterService.getCluster(id);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> updateClusterById(@RequestBody ClusterInfo clusterInfo) {
        return clusterService.updateCluster(clusterInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteClusterById(@PathVariable int id) {
        return clusterService.deleteCluster(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/namespace", method = RequestMethod.GET)
    public HttpResponseTemp<?> getAllNamespacesByClusterId(@PathVariable int id) {
        return clusterService.getAllNamespacesByClusterId(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/namespace", method = RequestMethod.POST)
    public HttpResponseTemp<?> putNamespacesByClusterId(@PathVariable int id, @RequestBody List<String> namespaces) {
        return clusterService.putNamespacesByClusterId(id, namespaces);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelist", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNodeListByClusterId(@PathVariable int id) {
        return clusterService.getNodeListByClusterId(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelistwithoutpods", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNodeListWithoutPodsByClusterId(@PathVariable int id) {
        return clusterService.getNodeListWithoutPodsByClusterId(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/{namespace}/instancelist", method = RequestMethod.GET)
    public HttpResponseTemp<?> getInstanceListByClusterId(@PathVariable int id, @PathVariable String namespace) {
        return clusterService.getInstanceListByClusterIdWithNamespace(id, namespace);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/instancelist", method = RequestMethod.GET)
    public HttpResponseTemp<?> getInstanceListByClusterId(@PathVariable int id) {
        return clusterService.getInstanceListByClusterIdWithNamespace(id, null);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/instancelistwithlabels", method = RequestMethod.GET)
    public HttpResponseTemp<?> getInstanceListByClusterIdWithLabels(@PathVariable int id, @RequestParam String labels) {
        return clusterService.getInstanceListByClusterIdWithNamespaceAndLabels(id, null, labels);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/node/{name:.+}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNodeByClusterIdAndName(@PathVariable int id, @PathVariable String name) {
        return clusterService.getNodeByClusterIdAndName(id, name);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelist/{name:.+}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getInstanceListByNodeName(@PathVariable int id, @PathVariable String name) {
        return clusterService.getInstanceListByNodeName(id, name);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/labels", method = RequestMethod.GET)
    public HttpResponseTemp<?> getLabelsByClusterId(@PathVariable int id) {
        return clusterService.getLabelsByClusterId(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelistwithlabels", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNodeListByClusterIdWithLabels(@PathVariable int id, @RequestParam String labels) {
        return clusterService.getNodeListByClusterIdWithLabels(id, labels);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelabels/delete", method = RequestMethod.POST)
    public HttpResponseTemp<?> deleteNodeLabels(@PathVariable int id, @RequestBody List<NodeLabel> nodeLabels) {
        return clusterService.deleteNodeLabels(id, nodeLabels);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/nodelabels/add", method = RequestMethod.POST)
    public HttpResponseTemp<?> setNodeLables(@PathVariable int id, @RequestBody List<NodeLabel> nodeLabels) {
        return clusterService.setNodeLabels(id, nodeLabels);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/{nodeName}/disk", method = RequestMethod.POST)
    public HttpResponseTemp<?> addDiskForNode(@PathVariable int id, @PathVariable String nodeName, @RequestParam String path) throws Exception {
        return clusterService.addDiskForNode(id, nodeName, path);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/{nodeName}/disk", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteDiskForNode(@PathVariable int id, @PathVariable String nodeName) throws Exception {
        return clusterService.deleteDiskForNode(id, nodeName);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/watcher/create", method = RequestMethod.POST)
    public HttpResponseTemp<?> startWactherInCluster(@PathVariable int id, @RequestBody ClusterWatcherConf watcherConf) {
        return clusterService.createWatcherInCluster(id, watcherConf);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/watcher/status", method = RequestMethod.GET)
    public HttpResponseTemp<?> getWatcherStatus(@PathVariable int id) {
        return clusterService.getWatcherStatus(id);
    }
}
