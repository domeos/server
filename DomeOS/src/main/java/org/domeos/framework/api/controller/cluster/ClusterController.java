package org.domeos.framework.api.controller.cluster;

import java.util.List;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.cluster.related.NodeLabel;
import org.domeos.framework.api.service.cluster.ClusterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

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
}
