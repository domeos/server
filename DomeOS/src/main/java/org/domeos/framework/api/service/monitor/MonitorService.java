package org.domeos.framework.api.service.monitor;

import org.domeos.framework.api.consolemodel.monitor.TargetRequest;
import org.domeos.framework.api.consolemodel.monitor.MonitorDataRequest;
import org.domeos.framework.api.model.monitor.falcon.GraphHistoryRequest;
import org.domeos.framework.api.model.monitor.falcon.GraphHistoryResponse;
import org.domeos.basemodel.HttpResponseTemp;

import java.io.IOException;
import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public interface MonitorService {

    /**
     *
     * @param targetRequest defines targetType(node/pod/container) and targetInfos
     * @return targetId saved in database
     */
    HttpResponseTemp<?> insertTargets(TargetRequest targetRequest);

    /**
     *
     * @param targetId saved in database
     * @return targetRequest corresponding to specified targetId
     */
    HttpResponseTemp<?> fetchTargets(long targetId);

    /**
     *
     * @param targetRequest defines targetType(node/pod/container) and targetInfos
     * @return CounterItems (cpuCounters/memCounters/diskCounters/networkCounters)
     */
    HttpResponseTemp<?> retrieveCounters(TargetRequest targetRequest);

    /**
     *
     * @param monitorDataRequest defines monitor data request info
     * @return monitorResult
     */
    HttpResponseTemp<?> getMonitorData(MonitorDataRequest monitorDataRequest);

    /**
     *
     * @param requestUrl
     * @param graphHistoryRequest
     * @return graphHistoryResponses
     * @throws IOException
     */
    List<GraphHistoryResponse> postJson(String requestUrl, GraphHistoryRequest graphHistoryRequest)  throws IOException;
}