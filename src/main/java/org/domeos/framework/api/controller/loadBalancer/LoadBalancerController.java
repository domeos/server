package org.domeos.framework.api.controller.loadBalancer;

import java.util.List;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.loadBalancer.LoadBalancerDraft;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.cluster.related.NodeInfo;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerType;
import org.domeos.framework.api.service.loadBalancer.LoadBalancerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by jackfan on 2017/2/24.
 */
@Controller
@RequestMapping("/api/loadBalancer")
public class LoadBalancerController extends ApiController {
    @Autowired
    LoadBalancerService lbService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> addLoadBalancer(@RequestBody LoadBalancerDraft lbDraft)
            throws Exception {
        return ResultStat.OK.wrap(lbService.createLoadBalancer(lbDraft));
    }

    @ResponseBody
    @RequestMapping(value = "/id/{lbId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> removeLoadBalancer( @PathVariable int lbId) throws Exception {
        lbService.removeLoadBalancer(lbId);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> updateLoadBalancer(@RequestBody LoadBalancerDraft lbDraft) throws Exception {
        lbService.updateLoadBalancer(lbDraft);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/id/{lbId}/description", method = RequestMethod.PUT)
    public HttpResponseTemp<Void> updateLoadBalancerDescription(@PathVariable int lbId,
                                                                @RequestBody String description) throws Exception {
        lbService.updateLoadBalancerDescription(lbId, description);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public HttpResponseTemp<?> listLoadBalancer() throws Exception {
        return ResultStat.OK.wrap(lbService.listLoadBalancer());
    }
    
    @ResponseBody
    @RequestMapping(value = "/list/{lbcId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listLoadBalancer(@PathVariable int lbcId) throws Exception {
        return ResultStat.OK.wrap(lbService.listLoadBalancer(lbcId));
    }
    
    @ResponseBody
    @RequestMapping(value = "/id/{lbId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getLoadBalancer(@PathVariable int lbId) throws Exception {
        return ResultStat.OK.wrap(lbService.getLoadBalancer(lbId));
    }
    
    @ResponseBody
    @RequestMapping(value = "/action/start/{lbId}/{versionId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> startLoadBalancer(@PathVariable int lbId,
                                                 @PathVariable int versionId) throws Exception {
        lbService.startLoadBalancer(lbId, versionId);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/action/stop/{lbId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> stopLoadBalancer(@PathVariable int lbId) throws Exception {
        lbService.stopLoadBalancer(lbId);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/action/update/{lbId}/{versionId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> startUpdateLoadBalancer(@PathVariable int lbId,
                                                       @PathVariable int versionId) throws Exception {
        lbService.startUpdate(lbId, versionId);;
        return ResultStat.OK.wrap(null);
    }
     
    @ResponseBody
    @RequestMapping(value = "/action/rollback/{lbId}/{versionId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> startRollbackLoadBalancer(@PathVariable int lbId,
                                                         @PathVariable int versionId) throws Exception {
        lbService.startRollback(lbId, versionId);;
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/action/scales/{lbId}/{versionId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> scaleLoadBalancer(@PathVariable int lbId,
                                                 @PathVariable int versionId,
                                                 @RequestBody List<NodeInfo> nodes) throws Exception {
        lbService.scaleUpAndDown(lbId, versionId, nodes);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/event/list/{lbId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listLoadBalancerEvent(@PathVariable int lbId) throws Exception {
        return ResultStat.OK.wrap(lbService.listLoadBalancerEvent(lbId));
    }
    
    @ResponseBody
    @RequestMapping(value = "/instance/list/{lbId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listLoadBalancerInstance(@PathVariable int lbId) throws Exception {
        return ResultStat.OK.wrap(lbService.listLoadBalancerInstance(lbId));
    }
    
    @ResponseBody
    @RequestMapping(value = "/instance/{lbId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> removePodByLbIdAndPodName(@PathVariable int lbId,
                                                         @RequestParam(value = "instanceName", required = true) String instanceName) throws Exception {
        lbService.deletePodByLbIdAndInsName(lbId, instanceName);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/deploy/list", method = RequestMethod.GET)
    public HttpResponseTemp<?> listDeploy(@RequestParam(value = "clusterId", required = true) int clusterId,
                                          @RequestParam(value = "namespace", required = true) String namespace,
                                          @RequestParam(value = "lbType", required = true) LoadBalancerType lbType) throws Exception {
        return ResultStat.OK.wrap(lbService.listDeploy(clusterId, namespace, lbType));
    }
}
