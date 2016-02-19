package org.domeos.api.controller.deployment;

import org.domeos.api.service.deployment.InstanceService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by feiliu206363 on 2015/12/18.
 */
@Controller
@RequestMapping("/api/deploy/")
public class InstanceController {
    @Autowired
    InstanceService instanceService;

    @ResponseBody
    @RequestMapping(value = "/{id}/instance", method = RequestMethod.GET)
    public HttpResponseTemp<?> listPodsByDeployId(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return instanceService.listPodsByDeployId(id, userId);
    }
}
