package org.domeos.framework.api.controller.global;

import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.service.global.RegistryService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by feiliu206363 on 2015/11/13.
 */
@Controller
@RequestMapping("/api/global/registry/private")
public class RegistryController extends ApiController {
    @Autowired
    RegistryService registryService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setPrivateRegistry(@RequestBody Registry registry) {
        return registryService.setPrivateRegistry(registry);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> getPrivateRegistry() {
        return registryService.getPrivateRegistry();
    }

    @ResponseBody
    @RequestMapping(value = "/certification", method = RequestMethod.GET)
    public String getCertification() {
        return registryService.getCertification();
    }
}
