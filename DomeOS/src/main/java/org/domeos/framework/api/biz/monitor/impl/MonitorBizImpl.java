package org.domeos.framework.api.biz.monitor.impl;

import org.domeos.framework.api.biz.monitor.MonitorBiz;
import org.domeos.framework.api.mapper.monitor.GraphMapper;
import org.domeos.framework.api.mapper.monitor.MonitorTargetMapper;
import org.domeos.framework.api.model.monitor.MonitorTarget;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
@Service("monitorBiz")
public class MonitorBizImpl implements MonitorBiz {

    @Autowired
    MonitorTargetMapper monitorTargetMapper;

    @Autowired
    GraphMapper graphMapper;

    @Override
    public List<String> getNodeCountersByEndpoints(String endpoints) {
        return graphMapper.getNodeCountersByEndpoints(endpoints);
    }

    @Override
    public List<String> getContainerCountersByEndpoints(String endpoints, String containers) {
        return graphMapper.getContainerCountersByEndpoints(endpoints, containers);
    }

    @Override
    public int addMonitorTarget(MonitorTarget monitorTarget) {
        return monitorTargetMapper.addMonitorTarget(monitorTarget);
    }

    @Override
    public int updateMonitorTargetById(MonitorTarget monitorTarget) {
        return monitorTargetMapper.updateMonitorTargetById(monitorTarget);
    }

    @Override
    public String getMonitorTargetById(long id) {
        return monitorTargetMapper.getMonitorTargetById(id);
    }
}
