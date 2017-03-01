package org.domeos.framework.api.controller.global;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.global.WebSsh;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.service.global.WebConsoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by baokangwang on 2016/1/16.
 */
@Controller
@RequestMapping("/")
public class WebConsoleController extends ApiController {

    @Autowired
    WebConsoleService webConsoleService;

    @ResponseBody
    @RequestMapping(value = "console", method = RequestMethod.GET)
    public void getWebConsole(@RequestParam(value="host", required=true) String host,
                              @RequestParam(value="container", required=false) String container,
                              @RequestParam(value="type", required=true) ResourceType type,
                              @RequestParam(value="id", required=true) int id,
                              HttpServletRequest request,
                              HttpServletResponse response) {
        webConsoleService.getWebConsole(host, container, type, id, request, response);
    }

    @ResponseBody
    @RequestMapping(value = "console", method = RequestMethod.POST)
    public void postWebConsole(HttpServletRequest request,
                               HttpServletResponse response) {
        webConsoleService.postWebConsole(request, response);
    }

    @ResponseBody
    @RequestMapping(value = "api/global/webssh", method = RequestMethod.GET)
    public HttpResponseTemp<?> getWebsshSetting() {
        return webConsoleService.getWebsshSetting();
    }

    @ResponseBody
    @RequestMapping(value = "api/global/webssh", method = RequestMethod.POST)
    public HttpResponseTemp<?> setWebsshSetting(@RequestBody WebSsh webSsh) {
        return webConsoleService.setWebsshSetting(webSsh);
    }

    @ResponseBody
    @RequestMapping(value = "api/global/webssh", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyWebsshSetting(@RequestBody WebSsh webSsh) {
        return webConsoleService.updateWebsshSetting(webSsh);
    }

    @ResponseBody
    @RequestMapping(value = "api/global/webssh", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteWebsshSetting() {
        return webConsoleService.deleteWebsshSetting();
    }
}
