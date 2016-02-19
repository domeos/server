package org.domeos.api.controller.global;

import org.domeos.api.model.cluster.ClusterMonitor;
import org.domeos.api.service.global.ClusterMonitorService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2016/1/5.
 */
@Controller
@RequestMapping("/api/global")
public class ClusterMonitorController {

    @Autowired
    ClusterMonitorService clusterMonitorService;

    @ResponseBody
    @RequestMapping(value = "/monitor", method = RequestMethod.GET)
    public HttpResponseTemp<?> getClusterMonitorInfo() {
        long userId = AuthUtil.getUserId();
        return clusterMonitorService.getClusterMonitorInfo(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor/info", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNormalClusterMonitorInfo() {
        long userId = AuthUtil.getUserId();
        return clusterMonitorService.getNormalClusterMonitorInfo(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor", method = RequestMethod.POST)
    public HttpResponseTemp<?> setClusterMonitorInfo(@RequestBody ClusterMonitor clusterMonitor) {
        long userId = AuthUtil.getUserId();
        return clusterMonitorService.setClusterMonitorInfo(clusterMonitor, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyClusterMonitorInfo(@RequestBody ClusterMonitor clusterMonitor) {
        long userId = AuthUtil.getUserId();
        return clusterMonitorService.modifyClusterMonitorInfo(clusterMonitor, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/monitor", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteClusterMonitorInfo(){
        long userId = AuthUtil.getUserId();
        return clusterMonitorService.deleteClusterMonitorInfo(userId);
    }
}
