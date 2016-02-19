package org.domeos.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.cluster.ClusterMonitor;
import org.domeos.api.service.global.ClusterMonitorService;
import org.domeos.api.service.global.GlobalService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2016/1/5.
 */
@Service("clusterMonitorService")
public class ClusterMonitorServiceImpl implements ClusterMonitorService {

    @Autowired
    GlobalService globalService;

    @Override
    public HttpResponseTemp<?> getClusterMonitorInfo(long userId) {
        ClusterMonitor clusterMonitor = globalService.getMonitor();
        return ResultStat.OK.wrap(clusterMonitor);
    }

    @Override
    public HttpResponseTemp<?> setClusterMonitorInfo(ClusterMonitor clusterMonitor, long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        if (!StringUtils.isBlank(clusterMonitor.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, clusterMonitor.checkLegality());
        }

        clusterMonitor.setCreateTime(System.currentTimeMillis());
        globalService.deleteMonitor();
        globalService.addMonitor(clusterMonitor);
        return ResultStat.OK.wrap(clusterMonitor);
    }

    @Override
    public HttpResponseTemp<?> modifyClusterMonitorInfo(ClusterMonitor clusterMonitor, long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        globalService.updateMonitor(clusterMonitor);
        return ResultStat.OK.wrap(clusterMonitor);
    }

    @Override
    public HttpResponseTemp<?> deleteClusterMonitorInfo(long userId) {
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        globalService.deleteMonitor();
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getNormalClusterMonitorInfo(long userId) {
        ClusterMonitor clusterMonitor = globalService.getMonitor();
        return ResultStat.OK.wrap(clusterMonitor);
    }
}
