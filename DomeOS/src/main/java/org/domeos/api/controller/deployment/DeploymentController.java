package org.domeos.api.controller.deployment;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.deployment.DeployEvent;
import org.domeos.api.model.deployment.DeploymentDetail;
import org.domeos.api.model.deployment.DeploymentDraft;
import org.domeos.api.model.deployment.DeploymentInfo;
import org.domeos.api.model.user.User;
import org.domeos.api.service.deployment.DeploymentService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
@Controller
@RequestMapping("/api/deploy")
public class DeploymentController extends ApiController {
    @Autowired
    DeploymentService deploymentService;

    @ResponseBody
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<DeploymentInfo>> listDeployment() throws IOException, KubeInternalErrorException, KubeResponseException {
        long userId = AuthUtil.getUserId();
        return deploymentService.listDeployment(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public HttpResponseTemp<?> createDeployment(@RequestBody DeploymentDraft deploymentDraft) throws Exception {
        long userId = AuthUtil.getUserId();
        return deploymentService.createDeployment(deploymentDraft, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.GET)
    public HttpResponseTemp<DeploymentDetail> getDeployment(@PathVariable long deployId) throws IOException, KubeInternalErrorException, KubeResponseException {
        long userId = AuthUtil.getUserId();
        return deploymentService.getDeployment(deployId, userId);
    }

//    @ResponseBody
//    @RequestMapping(value = "/deploy/modify", method = RequestMethod.PUT)
//    public HttpResponseTemp<?> modifyDeployment(@RequestBody DeploymentDraft deploymentDraft) throws JsonProcessingException {
//        long userId = AuthUtil.getUserId();
//        return deploymentService.modifyDeployment(deploymentDraft, userId);
//    }

//    @ResponseBody
//    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.POST)
//    public HttpResponseTemp<?> createVersion(@PathVariable long deployId, @RequestBody VersionDraft versionDraft) throws IOException {
//        long userId = AuthUtil.getUserId();
//        return deploymentService.createVersion(deployId, userId, versionDraft);
//    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteDeployment(@PathVariable long deployId) throws IOException {
        long userId = AuthUtil.getUserId();
        return deploymentService.removeDeployment(deployId, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/action/stop", method = RequestMethod.POST)
    public HttpResponseTemp<?> stopDeployment(@RequestParam long deployId) throws KubeResponseException, KubeInternalErrorException, DeploymentEventException, IOException {
        User user = AuthUtil.getUser();
        return deploymentService.stopDeployment(deployId, user);
    }

    @ResponseBody
    @RequestMapping(value = "/action/start", method = RequestMethod.POST)
    public HttpResponseTemp<?> startDeployment(
            @RequestParam(value = "deployId", required = true) long deployId,
            @RequestParam(value = "version", required = true) long version,
            @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas
    ) throws IOException, KubeInternalErrorException, KubeResponseException, DeploymentEventException {
        User user = AuthUtil.getUser();
        return deploymentService.startDeployment(deployId, version, replicas, user);
    }

    @ResponseBody
    @RequestMapping(value = "/action/update", method = RequestMethod.POST)
    public HttpResponseTemp<?> startUpdate(
            @RequestParam(value = "deployId", required = true) long deployId,
            @RequestParam(value = "version", required = true) long version,
            @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas
            ) throws IOException,KubeResponseException, DeploymentEventException, KubeInternalErrorException {
        User user = AuthUtil.getUser();
        return deploymentService.startUpdate(deployId, version, replicas, user);
    }

//    @ResponseBody
//    @RequestMapping(value = "/update/{deployId}", method = RequestMethod.DELETE)
//    public HttpResponseTemp<?> deleteUpdate(@PathVariable long deployId) throws IOException {
//        long userId = AuthUtil.getUserId();
//        return deploymentService.deleteUpdate(deployId, userId);
//    }
//
//    @ResponseBody
//    @RequestMapping(value = "/update/{deployId}", method = RequestMethod.GET)
//    public HttpResponseTemp<?> getUpdateStatus(@PathVariable long deployId) throws IOException {
//        long userId = AuthUtil.getUserId();
//        return deploymentService.getUpdateStatus(deployId, userId);
//    }

    @ResponseBody
    @RequestMapping(value = "/action/rollback", method = RequestMethod.POST)
    public HttpResponseTemp<?> startRollback(
            @RequestParam(value = "deployId") long deployId,
            @RequestParam(value = "version") long versionId,
            @RequestParam(value = "replicas", required = false, defaultValue = "-1") int replicas
    ) throws IOException, KubeResponseException, DeploymentEventException, KubeInternalErrorException {
        User user = AuthUtil.getUser();
        return deploymentService.startRollback(deployId, versionId, replicas, user);
    }

//    @ResponseBody
//    @RequestMapping(value = "/rollback/{deployId}", method = RequestMethod.DELETE)
//    public HttpResponseTemp<?> deleteRollback(@PathVariable long deployId) throws KVContentException, IOException, KVServerException {
//        long userId = AuthUtil.getUserId();
//        return deploymentService.deleteUpdate(deployId, userId);
//    }
//
//    @ResponseBody
//    @RequestMapping(value = "/rollback/{deployId}", method = RequestMethod.GET)
//    public HttpResponseTemp<?> getRollbackStatus(@PathVariable long deployId) throws KVContentException, IOException, KVServerException {
//        long userId = AuthUtil.getUserId();
//        return deploymentService.getUpdateStatus(deployId, userId);
//    }

    @ResponseBody
    @RequestMapping(value = "/action/scaleup", method = RequestMethod.POST)
    public HttpResponseTemp<?> scaleupDeployment(@RequestParam(value = "deployId") long deployId,
                                                 @RequestParam(value = "replicas") int replicas,
                                                 @RequestParam(value = "version", required = false, defaultValue = "-1") long versionId)
            throws IOException, DeploymentEventException {
        User user = AuthUtil.getUser();
        return deploymentService.scaleUpDeployment(deployId, versionId, replicas, user);
    }

    @ResponseBody
    @RequestMapping(value = "/action/scaledown", method = RequestMethod.POST)
    public HttpResponseTemp<?> scaledownDeployment(@RequestParam(value = "deployId") long deployId,
                                                   @RequestParam(value = "replicas") int replicas,
                                                   @RequestParam(value = "version",required = false, defaultValue = "-1") long versionId)
            throws IOException, DeploymentEventException {
        User user = AuthUtil.getUser();
        return deploymentService.scaleDownDeployment(deployId, versionId, replicas, user);
    }

    @ResponseBody
    @RequestMapping(value = "/event/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<DeployEvent>> listDeployEvent(@RequestParam(value = "deployId") long deployId) throws IOException {
        long userId = AuthUtil.getUserId();
        return deploymentService.listDeployEvent(deployId, userId);
    }
}
