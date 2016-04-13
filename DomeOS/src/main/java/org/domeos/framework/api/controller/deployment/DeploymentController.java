package org.domeos.framework.api.controller.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDetail;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.DeploymentInfo;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.deployment.DeployEvent;
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
    public HttpResponseTemp<?> createDeployment(@RequestBody DeploymentDraft deploymentDraft) throws Exception {
        return deploymentService.createDeployment(deploymentDraft);
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> removeDeployment(@PathVariable int deployId) throws IOException {
        return deploymentService.removeDeployment(deployId);
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyDeployment(@PathVariable int deployId,
                                                @RequestBody DeploymentDraft deploymentDraft) throws Exception {
        return deploymentService.modifyDeployment(deployId, deploymentDraft);
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.GET)
    public HttpResponseTemp<DeploymentDetail> getDeployment(@PathVariable int deployId) throws Exception {
        return deploymentService.getDeployment(deployId);
    }

    @ResponseBody
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<DeploymentInfo>> listDeployment() throws Exception {
        return deploymentService.listDeployment();
    }

    @ResponseBody
    @RequestMapping(value = "/action/start", method = RequestMethod.POST)
    public HttpResponseTemp<?> startDeployment(@RequestParam(value = "deployId", required = true) int deployId,
                                               @RequestParam(value = "version", required = true) long versionId,
                                               @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas
    )throws Exception {
        return deploymentService.startDeployment(deployId, versionId, replicas);
    }

    @ResponseBody
    @RequestMapping(value = "/action/stop", method = RequestMethod.POST)
    public HttpResponseTemp<?> stopDeployment(@RequestParam int deployId) throws Exception {
        return deploymentService.stopDeployment(deployId);
    }

    @ResponseBody
    @RequestMapping(value = "/action/update", method = RequestMethod.POST)
    public HttpResponseTemp<?> startUpdate(@RequestParam(value = "deployId", required = true) int deployId,
                                           @RequestParam(value = "version", required = true) long versionId,
                                           @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas
    ) throws Exception {
        return deploymentService.startUpdate(deployId, versionId, replicas);
    }

    @ResponseBody
    @RequestMapping(value = "/action/rollback", method = RequestMethod.POST)
    public HttpResponseTemp<?> startRollback(@RequestParam(value = "deployId", required = true) int deployId,
                                             @RequestParam(value = "version", required = true) long versionId,
                                             @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas
    ) throws Exception {
        return deploymentService.startRollback(deployId, versionId, replicas);
    }

    @ResponseBody
    @RequestMapping(value = "/action/scaleup", method = RequestMethod.POST)
    public HttpResponseTemp<?> scaleupDeployment(@RequestParam(value = "deployId", required = true) int deployId,
                                                 @RequestParam(value = "version", required = true) long versionId,
                                                 @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas
    ) throws Exception {
        return deploymentService.scaleUpDeployment(deployId, versionId, replicas);
    }

    @ResponseBody
    @RequestMapping(value = "/action/scaledown", method = RequestMethod.POST)
    public HttpResponseTemp<?> scaledownDeployment(@RequestParam(value = "deployId", required = true) int deployId,
                                                   @RequestParam(value = "version", required = true) long versionId,
                                                   @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas
    ) throws Exception {
        return deploymentService.scaleDownDeployment(deployId, versionId, replicas);
    }

    @ResponseBody
    @RequestMapping(value = "/event/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<DeployEvent>> listDeployEvent(@RequestParam(value = "deployId", required = true) int deployId
    ) throws Exception {
        return deploymentService.listDeployEvent(deployId);
    }

}