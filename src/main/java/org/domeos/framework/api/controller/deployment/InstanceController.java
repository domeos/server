package org.domeos.framework.api.controller.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.service.deployment.InstanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


/**
 * Created by xxs on 16/4/5.
 */
@Controller
@RequestMapping("/api/deploy/")
public class InstanceController extends ApiController {
    @Autowired
    InstanceService instanceService;

    @ResponseBody
    @RequestMapping(value = "/{id}/instance", method = RequestMethod.GET)
    public HttpResponseTemp<?> listPodsByDeployId(@PathVariable int id) throws Exception {
        return instanceService.listPodsByDeployId(id);
    }
    
    @ResponseBody
    @RequestMapping(value = "/{id}/instance", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> removePodByDeployIdAndPodName(@PathVariable int id,
                                                             @RequestParam(value = "instanceName", required = true) String instanceName) throws Exception {
        return instanceService.deletePodByDeployIdAndInsName(id, instanceName);
    }
}