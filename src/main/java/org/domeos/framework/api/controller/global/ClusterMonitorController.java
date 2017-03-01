package org.domeos.framework.api.controller.global;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.global.ClusterMonitor;
import org.domeos.framework.api.service.global.ClusterMonitorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by feiliu206363 on 2016/1/5.
 */
@Controller
@RequestMapping("/api/global")
public class ClusterMonitorController extends ApiController {

    @Autowired
    ClusterMonitorService clusterMonitorService;

    @ResponseBody
    @RequestMapping(value = "/monitor", method = RequestMethod.GET)
    public HttpResponseTemp<?> getClusterMonitorInfo() {
        return clusterMonitorService.getClusterMonitorInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/monitor/info", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNormalClusterMonitorInfo() {
        return clusterMonitorService.getNormalClusterMonitorInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/monitor", method = RequestMethod.POST)
    public HttpResponseTemp<?> setClusterMonitorInfo(@RequestBody ClusterMonitor clusterMonitor) {
        return clusterMonitorService.setClusterMonitorInfo(clusterMonitor);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyClusterMonitorInfo(@RequestBody ClusterMonitor clusterMonitor) {
        return clusterMonitorService.modifyClusterMonitorInfo(clusterMonitor);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteClusterMonitorInfo(){
        return clusterMonitorService.deleteClusterMonitorInfo();
    }
}
