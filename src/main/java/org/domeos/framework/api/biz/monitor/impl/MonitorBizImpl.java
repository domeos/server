package org.domeos.framework.api.biz.monitor.impl;

import org.domeos.framework.api.biz.monitor.MonitorBiz;
import org.domeos.framework.api.mapper.graph.GraphMapper;
import org.domeos.framework.api.mapper.domeos.monitor.MonitorTargetMapper;
import org.domeos.framework.api.model.monitor.MonitorTarget;
import org.domeos.global.ClientConfigure;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Callable;

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
    public List<String> getNodeCountersByEndpoints(Set<String> endpoints) {
        if (endpoints == null || endpoints.isEmpty()) {
            return null;
        }
        Set<String> rawCounter = new HashSet<>();
        List<GetNodeCounterTask> nodeCounterTasks = new ArrayList<>(endpoints.size());
        for (String endpoint : endpoints) {
            nodeCounterTasks.add(new GetNodeCounterTask(endpoint));
        }
        List<List<String>> counters = ClientConfigure.executeCompletionService(nodeCounterTasks);
        for (List<String> counter : counters) {
            rawCounter.addAll(counter);
        }
        return new LinkedList<>(rawCounter);
    }

    private class GetNodeCounterTask implements Callable<List<String>> {
        private String endpoint;

        GetNodeCounterTask(String endpoint) {
            this.endpoint = endpoint;
        }

        @Override
        public List<String> call() throws Exception {
            int id = graphMapper.getEndpointId(endpoint);
            return graphMapper.getNodeCounterByEndpointId(id);
        }
    }

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
