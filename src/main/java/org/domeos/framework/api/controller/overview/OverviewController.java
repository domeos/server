package org.domeos.framework.api.controller.overview;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.service.overview.OverviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;

/**
 * Created by junwuguo on 2017/1/19 0019.
 * The overview controller
 */
@Controller
@RequestMapping("/api/overview")
public class OverviewController extends ApiController {

    @Autowired
    OverviewService overviewService;

    @ResponseBody
    @RequestMapping(value = "/project", method = RequestMethod.GET)
    public HttpResponseTemp<?> getProjectOverview() {
        return ResultStat.OK.wrap(overviewService.getRecentProjectOverview());
    }

    @ResponseBody
    @RequestMapping(value = "/deployment", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDeployOverview() throws IOException {
        return ResultStat.OK.wrap(overviewService.getRecentDeploymentOverview());
    }

    @ResponseBody
    @RequestMapping(value = "/image", method = RequestMethod.GET)
    public HttpResponseTemp<?> getImageOverview() {
        return ResultStat.OK.wrap(overviewService.getImageUsageOverview());
    }

    @ResponseBody
    @RequestMapping(value = "/cluster", method = RequestMethod.GET)
    public HttpResponseTemp<?> getClusterOverview() {
        return ResultStat.OK.wrap(overviewService.getClusterUsageOverview());
    }

    @ResponseBody
    @RequestMapping(value = "/operation", method = RequestMethod.GET)
    public HttpResponseTemp<?> getOperationOverview() {
        return ResultStat.OK.wrap(overviewService.getOperationOverview());
    }

    @ResponseBody
    @RequestMapping(value = "/resource", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourceOverview() {
        return ResultStat.OK.wrap(overviewService.getResourceOverview());
    }

    @ResponseBody
    @RequestMapping(value = "/disk", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDiskOverview() {
        return ResultStat.OK.wrap(overviewService.getDiskOverview());
    }

    @ResponseBody
    @RequestMapping(value = "/usage", method = RequestMethod.GET)
    public HttpResponseTemp<?> getAllOverview() throws InvocationTargetException, IllegalAccessException {
        return ResultStat.OK.wrap(overviewService.getUsageOverview());
    }

}
