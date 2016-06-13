package org.domeos.framework.api.controller.deployment;

import org.domeos.framework.api.service.deployment.InstanceService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.engine.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * package agent is to help to do some modify on k8s to avoid use k8s client in other places
 */
@Controller
@RequestMapping("/api/agent/pod")
public class PodController {

    @Autowired
    InstanceService instanceService;

    @ResponseBody
    @RequestMapping(value = "/{clusterName}/{namespace}/{podName}/annotation", method = RequestMethod.PUT)
    public HttpResponseTemp<?> setAnnotation(@PathVariable String clusterName, @PathVariable String namespace,
                                             @PathVariable String podName, @RequestBody Map<String, String> annotations) {
        long userId = AuthUtil.getUserId();
        return instanceService.setPodAnnotation(clusterName, namespace, podName, annotations);
    }

}
