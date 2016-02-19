package org.domeos.api.controller.global;

import org.domeos.api.service.monitor.MonitorService;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by feiliu206363 on 2015/12/22.
 */
@Controller
@RequestMapping("/")
public class MonitorController {
    @Autowired
    MonitorService monitorService;

    @ResponseBody
    @RequestMapping(value = "api/monitor/charts/{clusterId}", method = RequestMethod.GET)
    public void getChartsMonitorData(@PathVariable int clusterId, HttpServletRequest request, HttpServletResponse response) {
        long userId = AuthUtil.getUserId();
        monitorService.getChartsMonitor(clusterId, request, response, userId);
    }

    @ResponseBody
    @RequestMapping(value = "api/monitor/chart/{clusterId}", method = RequestMethod.POST)
    public void putChartsMonitorData(@PathVariable int clusterId, HttpServletRequest request, HttpServletResponse response) {
        long userId = AuthUtil.getUserId();
        monitorService.putChartsMonitor(clusterId, request, response, userId);
    }

    @ResponseBody
    @RequestMapping(value = "api/monitor/chart/big/{clusterId}", method = RequestMethod.GET)
    public void getChartBigMonitorData(@PathVariable int clusterId, HttpServletRequest request, HttpServletResponse response) {
        long userId = AuthUtil.getUserId();
        monitorService.getChartBigMonitor(clusterId, request, response, userId);
    }

    @ResponseBody
    @RequestMapping(value = "api/monitor/counters/{clusterId}", method = RequestMethod.POST)
    public void getCountersMonitorData(@PathVariable int clusterId, HttpServletRequest request, HttpServletResponse response) {
        long userId = AuthUtil.getUserId();
        monitorService.getCountersMonitor(clusterId, request, response, userId);
    }

    @ResponseBody
    @RequestMapping(value = "static/**", method = RequestMethod.GET)
    public void getCssMonitor(HttpServletRequest request, HttpServletResponse response) {
        long userId = AuthUtil.getUserId();
        monitorService.getCssMonitor(request, response, userId);
    }

    @ResponseBody
    @RequestMapping(value = "chart/**", method = RequestMethod.GET)
    public void getChartMonitor(HttpServletRequest request, HttpServletResponse response) {
        long userId = AuthUtil.getUserId();
        monitorService.getChartMonitor(request, response, userId);
    }
}
