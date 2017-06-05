package org.domeos.framework.api.controller.global;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.global.SsoInfo;
import org.domeos.framework.api.service.global.SsoInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by KaiRen on 2017/4/19.
 */
@Controller
@RequestMapping("/api/global/ssoconfig")
public class SsoInfoController extends ApiController {
    @Autowired
    SsoInfoService ssoInfoService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    HttpResponseTemp<?> getSsoInfo() {
        return ssoInfoService.getSsoInfo();
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    HttpResponseTemp<?> setSsoInfo(@RequestBody SsoInfo ssoInfo) {
        return ssoInfoService.setSsoInfo(ssoInfo);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    HttpResponseTemp<?> modifySsoInfo(@RequestBody SsoInfo ssoInfo) {
        return ssoInfoService.modifySsoInfo(ssoInfo);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.DELETE)
    HttpResponseTemp<?> deleteSsoInfo() {
        return ssoInfoService.deleteSsoInfo();
    }

}
