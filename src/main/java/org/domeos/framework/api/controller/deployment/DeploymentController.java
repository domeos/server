package org.domeos.framework.api.controller.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDetail;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.DeploymentInfo;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.UpdateJobResult;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.deployment.related.LoadBalancerForDeployDraft;
import org.domeos.framework.api.service.deployment.DeploymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * Created by xxs on 16/4/5.
 */
@Controller
@RequestMapping("/api/deploy")
public class DeploymentController extends ApiController {
    @Autowired
    DeploymentService deploymentService;

    @ResponseBody
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public HttpResponseTemp<Integer> createDeployment(@RequestBody DeploymentDraft deploymentDraft) throws Exception {
        return ResultStat.OK.wrap(deploymentService.createDeployment(deploymentDraft));
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<Void> removeDeployment(@PathVariable int deployId) throws IOException {
        deploymentService.removeDeployment(deployId);
        return ResultStat.OK.wrap(null);
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.PUT)
    public HttpResponseTemp<Void> modifyDeployment(@PathVariable int deployId,
                                                   @RequestBody DeploymentDraft deploymentDraft) throws Exception {
        deploymentService.modifyDeployment(deployId, deploymentDraft);
        return ResultStat.OK.wrap(null);
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}/description", method = RequestMethod.PUT)
    public HttpResponseTemp<Void> modifyDeploymentDescription(@PathVariable int deployId,
                                                   @RequestBody String description) throws Exception {
        deploymentService.modifyDeploymentDescription(deployId, description);
        return ResultStat.OK.wrap(null);
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.GET)
    public HttpResponseTemp<DeploymentDetail> getDeployment(@PathVariable int deployId) throws Exception {
        return ResultStat.OK.wrap(deploymentService.getDeployment(deployId));
    }

    @ResponseBody
    @RequestMapping(value = "/migrate/{deployId}/{collectionId}", method = RequestMethod.GET)
    public HttpResponseTemp<List<DeploymentInfo>> migrateDeployment(@PathVariable int deployId, @PathVariable int collectionId)
            throws Exception {
        deploymentService.migrateDeployment(deployId, collectionId);
        return ResultStat.OK.wrap(null);
    }

    @ResponseBody
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<DeploymentInfo>> listDeployment() throws Exception {
        return ResultStat.OK.wrap(deploymentService.listDeployment());
    }

    @ResponseBody
    @RequestMapping(value = "/list/{collectionId}", method = RequestMethod.GET)
    public HttpResponseTemp<List<DeploymentInfo>> listDeployment(@PathVariable int collectionId) throws Exception {
        return ResultStat.OK.wrap(deploymentService.listDeployment(collectionId));
    }

    @ResponseBody
    @RequestMapping(value = "/action/start", method = RequestMethod.POST)
    public HttpResponseTemp<Void> startDeployment(@RequestParam(value = "deployId", required = true) int deployId,
                                                  @RequestParam(value = "version", required = true) int versionId,
                                                  @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas)
            throws Exception {
        deploymentService.startDeployment(deployId, versionId, replicas);
        return ResultStat.OK.wrap(null);
    }

    @ResponseBody
    @RequestMapping(value = "/action/abort", method = RequestMethod.POST)
    public HttpResponseTemp<Void> abortDeployOperation(@RequestParam(value = "deployId", required = true) int deployId) throws Exception {
        deploymentService.abortDeployOperation(deployId);
        return ResultStat.OK.wrap(null);
    }

    @ResponseBody
    @RequestMapping(value = "/action/stop", method = RequestMethod.POST)
    public HttpResponseTemp<?> stopDeployment(@RequestParam int deployId) throws Exception {
        deploymentService.stopDeployment(deployId);
        return ResultStat.OK.wrap(null);
    }

    @ResponseBody
    @RequestMapping(value = "/action/update", method = RequestMethod.POST)
    public HttpResponseTemp<?> startUpdate(@RequestParam(value = "deployId", required = true) int deployId,
                                           @RequestParam(value = "version", required = true) int versionId,
                                           @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas,
                                           @RequestBody(required = false) Policy policy)
            throws Exception {
        return deploymentService.startUpdate(deployId, versionId, replicas, policy);
    }

    @ResponseBody
    @RequestMapping(value = "/action/rollback", method = RequestMethod.POST)
    public HttpResponseTemp<?> startRollback(@RequestParam(value = "deployId", required = true) int deployId,
                                             @RequestParam(value = "version", required = true) int versionId,
                                             @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas,
                                             @RequestBody(required = false) Policy policy)
            throws Exception {
        return deploymentService.startRollback(deployId, versionId, replicas, policy);
    }

    @ResponseBody
    @RequestMapping(value = "/action/scaleup", method = RequestMethod.POST)
    public HttpResponseTemp<?> scaleupDeployment(@RequestParam(value = "deployId", required = true) int deployId,
                                                 @RequestParam(value = "version", required = true) int versionId,
                                                 @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas)
            throws Exception {
        return deploymentService.scaleUpDeployment(deployId, versionId, replicas);
    }

    @ResponseBody
    @RequestMapping(value = "/action/scaledown", method = RequestMethod.POST)
    public HttpResponseTemp<?> scaledownDeployment(@RequestParam(value = "deployId", required = true) int deployId,
                                                   @RequestParam(value = "version", required = true) int versionId,
                                                   @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas)
            throws Exception {
        return deploymentService.scaleDownDeployment(deployId, versionId, replicas);
    }

    @ResponseBody
    @RequestMapping(value = "/action/daemonset/scales", method = RequestMethod.POST)
    public HttpResponseTemp<?> scaleDaemonSet(@RequestParam(value = "deployId", required = true) int deployId,
                                                   @RequestParam(value = "version", required = true) int versionId,
                                                   @RequestBody List<LabelSelector> replicas)
            throws Exception {
        return deploymentService.scaleDaemonSet(deployId, versionId, replicas);
    }

    @ResponseBody
    @RequestMapping(value = "/event/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<DeployEvent>> listDeployEvent(@RequestParam(value = "deployId", required = true) int deployId)
            throws Exception {
        return ResultStat.OK.wrap(deploymentService.listDeployEvent(deployId));
    }

    @ResponseBody
    @RequestMapping(value = "/deploymentstr", method = RequestMethod.POST)
    public HttpResponseTemp<?> getRCStr(@RequestBody DeploymentDraft deploymentDraft) throws Exception {
        return ResultStat.OK.wrap(deploymentService.getRCStr(deploymentDraft));
    }

    @ResponseBody
    @RequestMapping(value = "/updatejob", method = RequestMethod.POST)
    public HttpResponseTemp<?> updateJobResult(@RequestBody UpdateJobResult updateJobResult) throws Exception {
        deploymentService.updateJobResult(updateJobResult);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/id/{deployId}/loadbalancer", method = RequestMethod.PUT)
    public HttpResponseTemp<Void> modifyInnerService(@PathVariable int deployId,
                                                     @RequestBody LoadBalancerForDeployDraft loadBalancerDraft) throws Exception {
        deploymentService.modifyInnerService(deployId, loadBalancerDraft);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "/id/{deployId}/loadbalancer", method = RequestMethod.GET)
    public HttpResponseTemp<?> listLoadBalancer(@PathVariable int deployId) throws Exception {
        return ResultStat.OK.wrap(deploymentService.listLoadBalancer(deployId));
    }
}
