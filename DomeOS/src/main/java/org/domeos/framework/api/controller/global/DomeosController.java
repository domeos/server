package org.domeos.framework.api.controller.global;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.global.GlobalConstant;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by feiliu206363 on 2016/1/18.
 */
@Controller
@RequestMapping("/api/global")
public class DomeosController extends ApiController {
    @ResponseBody
    @RequestMapping(value = "/version", method = RequestMethod.GET)
    HttpResponseTemp<?> version() {
        return ResultStat.OK.wrap("0.2");
    }

    @ResponseBody
    @RequestMapping(value = "/database", method = RequestMethod.GET)
    HttpResponseTemp<?> database() {
        return ResultStat.OK.wrap(GlobalConstant.DATABASETYPE);
    }
}
