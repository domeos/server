package org.domeos.framework.api.biz.monitor.impl;

import org.domeos.framework.api.biz.monitor.MonitorBiz;
import org.domeos.framework.api.mapper.monitor.GraphMapper;
import org.domeos.framework.api.mapper.monitor.MonitorTargetMapper;
import org.domeos.framework.api.model.monitor.MonitorTarget;
import org.domeos.global.ClientConfigure;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

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
        if (endpoints == null) {
            return null;
        }
        Set<String> rawCounter = new HashSet<>();
        List<Future<List<String>>> futures = new ArrayList<>();
        for (String endpoint : endpoints) {
            Future<List<String>> future = ClientConfigure.executorService.submit(new GetNodeCounterTask(endpoint));
            futures.add(future);
        }
        for (Future<List<String>> future : futures) {
            try {
                List<String> counters = future.get();
                rawCounter.addAll(counters);
            } catch (InterruptedException | ExecutionException e) {

            }
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
