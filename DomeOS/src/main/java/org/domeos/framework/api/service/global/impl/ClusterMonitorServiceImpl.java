package org.domeos.framework.api.service.global.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.model.global.ClusterMonitor;
import org.domeos.framework.api.service.global.ClusterMonitorService;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2016/1/5.
 */
@Service("clusterMonitorService")
public class ClusterMonitorServiceImpl implements ClusterMonitorService {

    @Autowired
    GlobalBiz globalBiz;

    @Override
    public HttpResponseTemp<?> getClusterMonitorInfo() {
        ClusterMonitor clusterMonitor = globalBiz.getMonitor();
        return ResultStat.OK.wrap(clusterMonitor);
    }

    @Override
    public HttpResponseTemp<?> setClusterMonitorInfo(ClusterMonitor clusterMonitor) {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        if (!StringUtils.isBlank(clusterMonitor.checkLegality())) {
            return ResultStat.PARAM_ERROR.wrap(null, clusterMonitor.checkLegality());
        }

        clusterMonitor.setCreateTime(System.currentTimeMillis());
        globalBiz.deleteMonitor();
        globalBiz.addMonitor(clusterMonitor);
        return ResultStat.OK.wrap(clusterMonitor);
    }

    @Override
    public HttpResponseTemp<?> modifyClusterMonitorInfo(ClusterMonitor clusterMonitor) {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        globalBiz.updateMonitor(clusterMonitor);
        return ResultStat.OK.wrap(clusterMonitor);
    }

    @Override
    public HttpResponseTemp<?> deleteClusterMonitorInfo() {
        int userId = GlobalConstant.userThreadLocal.get().getId();
        if (!AuthUtil.isAdmin(userId)) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }

        globalBiz.deleteMonitor();
        return ResultStat.OK.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> getNormalClusterMonitorInfo() {
        ClusterMonitor clusterMonitor = globalBiz.getMonitor();
        return ResultStat.OK.wrap(clusterMonitor);
    }
}
