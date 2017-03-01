package org.domeos.framework.api.biz.monitor;

import org.domeos.framework.api.model.monitor.MonitorTarget;

import java.util.List;
import java.util.Set;

/**
 * Created by baokangwang on 2016/4/6.
 */
public interface MonitorBiz {

    List<String> getNodeCountersByEndpoints(Set<String> endpoints);

    List<String> getNodeCountersByEndpoints(String endpoints);

    List<String> getContainerCountersByEndpoints(String endpoints, String containers);

    int addMonitorTarget(MonitorTarget monitorTarget);

    int updateMonitorTargetById(MonitorTarget monitorTarget);

    String getMonitorTargetById(long id);
}
