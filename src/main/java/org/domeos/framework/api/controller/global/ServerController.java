package org.domeos.framework.api.controller.global;

import org.domeos.framework.api.model.global.Server;
import org.domeos.framework.api.service.global.ServerService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by feiliu206363 on 2015/11/16.
 */
@Controller
@RequestMapping("/api/global/serverconfig")
public class ServerController extends ApiController {
    @Autowired
    ServerService serverService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setServer(@RequestBody Server server) {
        return serverService.setServer(server);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> getServer() {
        return serverService.getServer();
    }


    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> updateServer(@RequestBody Server server) {
        return serverService.updateServer(server);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteServer() {
        return serverService.deleteServer();
    }
}
