package org.domeos.framework.api.controller.global;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.service.global.SsoInfoService;
import org.domeos.framework.api.service.global.UUIDService;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * Created by feiliu206363 on 2016/1/18.
 */
@Controller
public class DomeosController extends ApiController {
    @Autowired
    UUIDService uuidService;

    @Autowired
    SsoInfoService ssoInfoService;

    @ResponseBody
    @RequestMapping(value = "/api/global/version", method = RequestMethod.GET)
    HttpResponseTemp<?> version() {
        return ResultStat.OK.wrap("0.4");
    }

    @ResponseBody
    @RequestMapping(value = "/", method = RequestMethod.GET)
    ModelAndView welcomPage() {
        return new ModelAndView("index.html");
    }

    @ResponseBody
    @RequestMapping(value = "/api/global/uuid", method = RequestMethod.GET)
    HttpResponseTemp<?> uuid() {
        return ResultStat.OK.wrap(uuidService.getUUID());
    }

    @ResponseBody
    @RequestMapping(value = "/api/global/database", method = RequestMethod.GET)
    HttpResponseTemp<?> database() {
        return ResultStat.OK.wrap(GlobalConstant.DATABASETYPE);
    }

    @ResponseBody
    @RequestMapping(value = "/health", method = RequestMethod.GET)
    String health() {
        return null;
    }

    @ResponseBody
    @RequestMapping(value = "/api/global/loginoption", method = RequestMethod.GET)
    HttpResponseTemp<?> getLoginOption() {
        return ssoInfoService.getLoginOption();
    }


}
