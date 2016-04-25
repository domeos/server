package org.domeos.framework.api.controller.monitor;

import org.domeos.framework.api.consolemodel.monitor.TargetRequest;
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
    public HttpResponseTemp<?> fetchTargets(@PathVariable long targetId,
                                            @RequestParam(value = "cid", required = true) int cid) {
        return monitorService.fetchTargets(targetId, cid);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor/counter/{targetId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> retrieveCounters(@PathVariable long targetId,
                                                @RequestParam(value = "cid", required = true) int cid) {
        return monitorService.retrieveCounters(targetId, cid);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor/data/{targetId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getMonitorData(@PathVariable long targetId,
                                              @RequestParam(value = "start", required = true) long start,
                                              @RequestParam(value = "end", required = true) long end,
                                              @RequestParam(value = "dataSpec", defaultValue = "AVERAGE") String dataSpec,
                                              @RequestParam(value = "cid", required = true) int cid) {
        return monitorService.getMonitorData(targetId, start, end, dataSpec, cid);
    }
}