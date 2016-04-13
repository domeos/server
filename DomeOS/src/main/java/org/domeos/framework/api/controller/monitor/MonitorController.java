package org.domeos.framework.api.controller.monitor;

import org.domeos.framework.api.consolemodel.monitor.TargetRequest;
import org.domeos.framework.api.consolemodel.monitor.MonitorDataRequest;
import org.domeos.framework.api.service.monitor.MonitorService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by baokangwang on 2016/3/1.
 */
@Controller
@RequestMapping("/api")
public class MonitorController extends ApiController {

    @Autowired
    MonitorService monitorService;

    @ResponseBody
    @RequestMapping(value = "/monitor/target", method = RequestMethod.POST)
    public HttpResponseTemp<?> insertTargets(@RequestBody TargetRequest targetRequest) {
        return monitorService.insertTargets(targetRequest);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor/target/{targetId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> fetchTargets(@PathVariable long targetId) {
        return monitorService.fetchTargets(targetId);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor/counter", method = RequestMethod.POST)
    public HttpResponseTemp<?> retrieveCounters(@RequestBody TargetRequest targetRequest) {
        return monitorService.retrieveCounters(targetRequest);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor/data", method = RequestMethod.POST)
    public HttpResponseTemp<?> getMonitorData(@RequestBody MonitorDataRequest monitorDataRequest) {
        return monitorService.getMonitorData(monitorDataRequest);
    }
}