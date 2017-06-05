package org.domeos.framework.api.service.monitor.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.monitor.MonitorBiz;
import org.domeos.framework.api.consolemodel.monitor.MonitorDataRequest;
import org.domeos.framework.api.consolemodel.monitor.MonitorResult;
import org.domeos.framework.api.consolemodel.monitor.TargetRequest;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.global.GlobalInfo;
import org.domeos.framework.api.model.global.GlobalType;
import org.domeos.framework.api.model.monitor.ContainerInfo;
import org.domeos.framework.api.model.monitor.CounterItems;
import org.domeos.framework.api.model.monitor.MonitorTarget;
import org.domeos.framework.api.model.monitor.TargetInfo;
import org.domeos.framework.api.model.monitor.falcon.EndpointCounter;
import org.domeos.framework.api.model.monitor.falcon.GraphHistoryRequest;
import org.domeos.framework.api.model.monitor.falcon.GraphHistoryResponse;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.monitor.MonitorService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.global.ClientConfigure;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.concurrent.Callable;

/**
 * Created by baokangwang on 2016/3/1.
 */
@Service
public class MonitorServiceImpl implements MonitorService {

    private static Logger logger = LoggerFactory.getLogger(MonitorServiceImpl.class);

    @Autowired
    MonitorBiz monitorBiz;

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    CustomObjectMapper mapper;

    @Override
    public HttpResponseTemp<?> insertTargets(TargetRequest targetRequest) {

        if (targetRequest == null) {
            throw ApiException.wrapMessage(ResultStat.TARGET_REQUEST_NOT_LEGAL, "target request info is null");
        }
        if (!StringUtils.isBlank(targetRequest.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.TARGET_REQUEST_NOT_LEGAL, targetRequest.checkLegality());
        }

        AuthUtil.verify(CurrentThreadInfo.getUserId(), targetRequest.getClusterId(), ResourceType.CLUSTER, OperationType.GET);

        String targetRequestJson;
        try {
            targetRequestJson = mapper.writeValueAsString(targetRequest);
        } catch (JsonProcessingException e) {
            logger.error("error processing json!", e);
            throw ApiException.wrapMessage(ResultStat.TARGET_REQUEST_NOT_LEGAL, "error processing json : " + e.getMessage());
        }

        MonitorTarget monitorTarget = new MonitorTarget();
        monitorBiz.addMonitorTarget(monitorTarget);

        monitorTarget.setTarget(targetRequestJson);
        monitorTarget.setCreateTime(new Date());
        monitorBiz.updateMonitorTargetById(monitorTarget);

        return ResultStat.OK.wrap(monitorTarget.getId());
    }

    @Override
    public HttpResponseTemp<?> fetchTargets(long targetId, int cid) {

        AuthUtil.verify(CurrentThreadInfo.getUserId(), cid, ResourceType.CLUSTER, OperationType.GET);

        String targetRequestJson = monitorBiz.getMonitorTargetById(targetId);
        if (StringUtils.isBlank(targetRequestJson)) {
            throw ApiException.wrapMessage(ResultStat.TARGET_REQUEST_NOT_LEGAL, "target id does not exist");
        }

        TargetRequest targetRequest;
        try {
            targetRequest = mapper.readValue(targetRequestJson, TargetRequest.class);
        } catch (IOException e) {
            logger.error("error processing json!", e);
            throw ApiException.wrapMessage(ResultStat.TARGET_REQUEST_NOT_LEGAL, "error processing json : " + e.getMessage());
        }

        return ResultStat.OK.wrap(targetRequest);
    }

    @Override
    public HttpResponseTemp<?> retrieveCounters(long targetId, int cid) {

        AuthUtil.verify(CurrentThreadInfo.getUserId(), cid, ResourceType.CLUSTER, OperationType.GET);

        TargetRequest targetRequest = fetchTargetRequest(targetId);
        if (targetRequest == null) {
            throw ApiException.wrapMessage(ResultStat.TARGET_REQUEST_NOT_LEGAL, "target request info not exists");
        }
        if (!StringUtils.isBlank(targetRequest.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.TARGET_REQUEST_NOT_LEGAL, targetRequest.checkLegality());
        }

        List<String> rawCounters = retrieveCountersByTargetInfoList(targetRequest.getTargetType(), targetRequest.getTargetInfos());
        if (rawCounters == null || rawCounters.isEmpty()) {
            return ResultStat.OK.wrap(null);
        }
        CounterItems counterItems = new CounterItems(rawCounters.size());
        for (String counter : rawCounters) {
            counterItems.insertCounter(counter, targetRequest.getTargetType());
        }
        return ResultStat.OK.wrap(counterItems);
    }


    @Override
    public HttpResponseTemp<?> getMonitorData(long targetId, long startTime, long endTime, String dataSpec, int cid) {

        AuthUtil.verify(CurrentThreadInfo.getUserId(), cid, ResourceType.CLUSTER, OperationType.GET);

        TargetRequest targetRequest = fetchTargetRequest(targetId);
        if (targetRequest == null) {
            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_REQUEST_NOT_LEGAL, "target request info not exists");
        }
        MonitorDataRequest monitorDataRequest = new MonitorDataRequest(
                startTime,
                endTime,
                dataSpec,
                targetRequest.getTargetType(),
                targetRequest.getTargetInfos());

        if (!StringUtils.isBlank(monitorDataRequest.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_REQUEST_NOT_LEGAL, monitorDataRequest.checkLegality());
        }

        // preparation
        GlobalInfo queryInfo = globalBiz.getGlobalInfoByType(GlobalType.MONITOR_QUERY);
        if (queryInfo == null) {
            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_QUERY_ERROR, "query is null");
        }
        String queryUrl = "http://" + queryInfo.getValue() + "/graph/history";

        MonitorResult monitorResult = new MonitorResult();
        monitorResult.setTargetType(monitorDataRequest.getTargetType());
        monitorResult.setDataSpec(monitorDataRequest.getDataSpec());

        // fetch data from query api
        List<GraphHistoryResponse> graphHistoryResponses = new ArrayList<>();
        // create graphHistoryRequest
        GraphHistoryRequest graphHistoryRequest = getGraphHistoryRequest(monitorDataRequest);
        List<EndpointCounter> endpointCounterList = graphHistoryRequest.getEndpoint_counters();
        //Concurrent requests, sending 500 counters at a time
        int max_size = 500;
        int times = endpointCounterList.size() % max_size == 0 ? endpointCounterList.size() / max_size : endpointCounterList.size() / max_size + 1;
        List<postJsonTask> tasks = new ArrayList<>(times);
        for (int i = 0; i < times; i++) {
            GraphHistoryRequest tmp = new GraphHistoryRequest();
            tmp.setStart(graphHistoryRequest.getStart());
            tmp.setEnd(graphHistoryRequest.getEnd());
            tmp.setCf(graphHistoryRequest.getCf());
            tmp.setEndpoint_counters(endpointCounterList.subList(i * max_size, Math.min((i + 1) * max_size, endpointCounterList.size())));
            tasks.add(new postJsonTask(queryUrl, tmp));
        }
        List<List<GraphHistoryResponse>> taskResult = ClientConfigure.executeCompletionService(tasks);
        for (List<GraphHistoryResponse> result : taskResult) {
            if (result != null && result.size() > 0) {
                graphHistoryResponses.addAll(result);
            }
        }
//        try {
//            graphHistoryResponses = postJson(queryUrl, graphHistoryRequest);
//        } catch (JsonProcessingException e) {
//            logger.error("error processing json!", e);
//            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_QUERY_ERROR, "error processing json : " + e.getMessage());
//        } catch (IOException e) {
//            logger.error("io exception!", e);
//            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_QUERY_ERROR, "io exception : " + e.getMessage());
//        }
//        if (graphHistoryResponses == null) {
//            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_QUERY_ERROR, "query response is null");
//        }
        // re-arrage GraphHistoryResponses
        Map<String, List<GraphHistoryResponse>> graphHistoryResponseMap = arrangeGraphHistoryResponseList(graphHistoryResponses,
                monitorDataRequest.getTargetType());

        // create MonitorResult
        createMonitorResult(monitorResult, graphHistoryResponseMap, monitorDataRequest);

        return ResultStat.OK.wrap(monitorResult);
    }

    @Override
    public MonitorResult getMonitorDataForOverview(TargetRequest targetRequest, long startTime, long endTime, String dataSpec, boolean isDisk) {
        if (targetRequest == null) {
            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_REQUEST_NOT_LEGAL, "target request info not exists");
        }
        MonitorDataRequest monitorDataRequest = new MonitorDataRequest(
                startTime,
                endTime,
                dataSpec,
                targetRequest.getTargetType(),
                targetRequest.getTargetInfos());

        if (!StringUtils.isBlank(monitorDataRequest.checkLegality())) {
            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_REQUEST_NOT_LEGAL, monitorDataRequest.checkLegality());
        }

        // preparation
        GlobalInfo queryInfo = globalBiz.getGlobalInfoByType(GlobalType.MONITOR_QUERY);
        if (queryInfo == null) {
            throw ApiException.wrapMessage(ResultStat.MONITOR_DATA_QUERY_ERROR, "query is null");
        }
        String queryUrl = "http://" + queryInfo.getValue() + "/graph/history";

        MonitorResult monitorResult = new MonitorResult();
        monitorResult.setTargetType(monitorDataRequest.getTargetType());
        monitorResult.setDataSpec(monitorDataRequest.getDataSpec());

        // fetch data from query api
        // create graphHistoryRequest
        GraphHistoryRequest graphHistoryRequest = getGraphHistoryRequestForOverview(monitorDataRequest, isDisk);
        List<EndpointCounter> endpointCounterList = graphHistoryRequest.getEndpoint_counters();
        //Concurrent requests, sending 500 counters at a time
        int max_size = 500;
        int times = endpointCounterList.size() % max_size == 0 ? endpointCounterList.size() / max_size : endpointCounterList.size() / max_size + 1;
        List<postJsonTask> tasks = new ArrayList<>(times);
        for (int i = 0; i < times; i++) {
            GraphHistoryRequest tmp = new GraphHistoryRequest();
            tmp.setStart(graphHistoryRequest.getStart());
            tmp.setEnd(graphHistoryRequest.getEnd());
            tmp.setCf(graphHistoryRequest.getCf());
            tmp.setEndpoint_counters(endpointCounterList.subList(i * max_size, Math.min((i + 1) * max_size, endpointCounterList.size())));
            tasks.add(new postJsonTask(queryUrl, tmp));
        }
        List<List<GraphHistoryResponse>> taskResult = ClientConfigure.executeCompletionService(tasks);
        List<GraphHistoryResponse> graphHistoryResponses = new ArrayList<>();
        for (List<GraphHistoryResponse> result : taskResult) {
            if (result != null && result.size() > 0) {
                graphHistoryResponses.addAll(result);
            }
        }

        // re-arrage GraphHistoryResponses
        Map<String, List<GraphHistoryResponse>> graphHistoryResponseMap = arrangeGraphHistoryResponseList(graphHistoryResponses,
                monitorDataRequest.getTargetType());

        // create MonitorResult
        createMonitorResult(monitorResult, graphHistoryResponseMap, monitorDataRequest);

        return monitorResult;
    }

    private class postJsonTask implements Callable<List<GraphHistoryResponse>> {

        String requestUrl;
        GraphHistoryRequest graphHistoryRequest;

        public postJsonTask(String requestUrl, GraphHistoryRequest graphHistoryRequest) {
            this.requestUrl = requestUrl;
            this.graphHistoryRequest = graphHistoryRequest;
        }

        @Override
        public List<GraphHistoryResponse> call() throws Exception {
            return postJson(requestUrl, graphHistoryRequest);
        }
    }


    // retrieve sorted counters
    private List<String> retrieveCountersByTargetInfoList(String targetType, List<TargetInfo> targetInfos) {

        if (targetInfos == null || targetInfos.size() == 0) {
            return null;
        }

        Set<String> endpoints = new HashSet<>();
        Set<String> containers = new HashSet<>();

        // collect endpoints and containers
        switch (targetType) {
            case "node":
                for (TargetInfo targetInfo : targetInfos) {
                    endpoints.add(targetInfo.getNode());
                }
                break;
            case "pod":
                for (TargetInfo targetInfo : targetInfos) {
                    for (ContainerInfo containerInfo : targetInfo.getPod().getContainers()) {
                        endpoints.add(containerInfo.getHostname());
                        containers.add(containerInfo.getContainerId());
                    }
                }
                break;
            case "container":
                for (TargetInfo targetInfo : targetInfos) {
                    endpoints.add(targetInfo.getContainer().getHostname());
                    containers.add(targetInfo.getContainer().getContainerId());
                }
        }

        // fetch counters from database
        switch (targetType) {
            case "node":
                return monitorBiz.getNodeCountersByEndpoints(endpoints);
            case "pod":
            case "container":
                return monitorBiz.getContainerCountersByEndpoints(joinStringSet(endpoints, ","), joinStringSet(containers, ","));
            default:
                return new ArrayList<>(1);
        }
    }

    private String joinStringSet(Set<String> stringSet, String delimiter) {

        String result = "";
        if (stringSet == null || stringSet.size() == 0) {
            return result;
        }
        for (String item : stringSet) {
            result += "\"" + item + "\"" + delimiter;
        }
        return result.substring(0, result.length() - delimiter.length());
    }

    // create graphHistoryRequest
    private GraphHistoryRequest getGraphHistoryRequest(MonitorDataRequest monitorDataRequest) {

        GraphHistoryRequest graphHistoryRequest = new GraphHistoryRequest();
        graphHistoryRequest.setStart(monitorDataRequest.getStartTime() / 1000);
        graphHistoryRequest.setEnd(monitorDataRequest.getEndTime() / 1000);
        graphHistoryRequest.setCf(monitorDataRequest.getDataSpec());

        List<String> counters = retrieveCountersByTargetInfoList(monitorDataRequest.getTargetType(), monitorDataRequest.getTargetInfos());

        switch (monitorDataRequest.getTargetType()) {
            case "node":
                for (String counter : counters) {
                    for (TargetInfo targetInfo : monitorDataRequest.getTargetInfos()) {
                        graphHistoryRequest.getEndpoint_counters().add(new EndpointCounter(targetInfo.getNode(), counter));
                    }
                }
                break;
            case "pod":
                for (String counter : counters) {
                    for (TargetInfo targetInfo : monitorDataRequest.getTargetInfos()) {
                        for (ContainerInfo containerInfo : targetInfo.getPod().getContainers()) {
                            if (counter.contains(containerInfo.getContainerId())) {
                                graphHistoryRequest.getEndpoint_counters().add(new EndpointCounter(containerInfo.getHostname(), counter));
                            }
                        }
                    }
                }
                break;
            case "container":
                for (String counter : counters) {
                    for (TargetInfo targetInfo : monitorDataRequest.getTargetInfos()) {
                        if (counter.contains(targetInfo.getContainer().getContainerId())) {
                            graphHistoryRequest.getEndpoint_counters().add(new EndpointCounter(targetInfo.getContainer().getHostname(), counter));
                        }
                    }
                }
        }

        return graphHistoryRequest;
    }

    // create graphHistoryRequest for overview
    private GraphHistoryRequest getGraphHistoryRequestForOverview(MonitorDataRequest monitorDataRequest, boolean isDisk) {

        GraphHistoryRequest graphHistoryRequest = new GraphHistoryRequest();
        graphHistoryRequest.setStart(monitorDataRequest.getStartTime() / 1000);
        graphHistoryRequest.setEnd(monitorDataRequest.getEndTime() / 1000);
        graphHistoryRequest.setCf(monitorDataRequest.getDataSpec());

        List<String> counters = retrieveCountersByTargetInfoList(monitorDataRequest.getTargetType(), monitorDataRequest.getTargetInfos());
        if (counters != null) {
            for (String counter : counters) {
                if ((isDisk && counter.startsWith("df.bytes") && !counter.startsWith("df.bytes.used.percent") && !counter.contains("kubernetes"))
                        || (!isDisk && (counter.startsWith("cpu.busy") || counter.startsWith("mem.memtotal") || counter.startsWith("mem.memused")))) {
                    for (TargetInfo targetInfo : monitorDataRequest.getTargetInfos()) {
                        graphHistoryRequest.getEndpoint_counters().add(new EndpointCounter(targetInfo.getNode(), counter));
                    }
                }
            }
        }
        return graphHistoryRequest;
    }

    @Override
    public List<GraphHistoryResponse> postJson(String requestUrl, GraphHistoryRequest graphHistoryRequest) throws IOException {

        HttpURLConnection conn;
        List<GraphHistoryResponse> graphHistoryResponses;
        try {

            URL url = new URL(requestUrl);

            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("accept", "*/*");
            conn.setRequestProperty("Charset", "UTF-8");
            conn.setRequestProperty("Connection", "Keep-Alive");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setDoInput(true);

            mapper.writeValue(conn.getOutputStream(), graphHistoryRequest);
            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                logger.error("error response code while post:" + responseCode);
                return null;
            }
            InputStream inputStream = conn.getInputStream();
            graphHistoryResponses = mapper.readValue(inputStream, new TypeReference<List<GraphHistoryResponse>>() {
            });
            inputStream.close();
        } catch (Exception e) {

            logger.error("exception in sending post request!", e);
            return null;
        }
        return graphHistoryResponses;
    }

    // re-arrage GraphHistoryResponses
    private Map<String, List<GraphHistoryResponse>> arrangeGraphHistoryResponseList(List<GraphHistoryResponse> graphHistoryResponses,
                                                                                    String targetType) {

        Map<String, List<GraphHistoryResponse>> result = new HashMap<>();

        for (GraphHistoryResponse graphHistoryResponse : graphHistoryResponses) {

            // ignore endpoint-counter pair with no data
            if (graphHistoryResponse.getValues() == null || graphHistoryResponse.getValues().size() == 0) {
                continue;
            }

            // fix counter name
            String counter = graphHistoryResponse.getCounter();
            switch (targetType) {
                case "node":
                    if (counter.startsWith("df.bytes")) {
                        counter = counter.substring(0, counter.indexOf("fstype=")) + counter.substring(counter.indexOf("mount="));
                    }
                    break;
                case "pod":
                case "container":
                    if (!counter.contains("/id=")) {
                        continue;
                    }
                    counter = counter.substring(0, counter.indexOf("/id="));
            }
            if (!result.containsKey(counter)) {
                result.put(counter, new ArrayList<GraphHistoryResponse>());
            }
            result.get(counter).add(graphHistoryResponse);
        }

        return result;
    }

    // create monitorResult by arranged GraphHistoryResponse-Map
    private void createMonitorResult(MonitorResult monitorResult, Map<String, List<GraphHistoryResponse>> graphHistoryResponseMap,
                                     MonitorDataRequest monitorDataRequest) {

        Map<String, String> containerPodMap = getContainerPodMap(monitorDataRequest);

        for (String counter : graphHistoryResponseMap.keySet()) {

            if (graphHistoryResponseMap.get(counter) == null || graphHistoryResponseMap.get(counter).size() == 0) {
                continue;
            }

            // create key : counter
            monitorResult.getCounterResults().put(counter, new ArrayList<Map<String, Double>>());

            // get timeStampCount for this counter
            int timeStampCount = 0;
            int maxCountIndex = 0;
            for (GraphHistoryResponse graphHistoryResponse : graphHistoryResponseMap.get(counter)) {
                if (graphHistoryResponse.getValues().size() > timeStampCount) {
                    timeStampCount = graphHistoryResponse.getValues().size();
                    maxCountIndex = graphHistoryResponseMap.get(counter).indexOf(graphHistoryResponse);
                }
            }

            // set interval
            if (graphHistoryResponseMap.get(counter).get(maxCountIndex).getValues().size() == 1) {
                monitorResult.setInterval(graphHistoryResponseMap.get(counter).get(maxCountIndex).getStep());
            } else {
                monitorResult.setInterval((int) (graphHistoryResponseMap.get(counter).get(maxCountIndex).getValues().get(1).getTimestamp()
                        - graphHistoryResponseMap.get(counter).get(maxCountIndex).getValues().get(0).getTimestamp()));
            }

            // cache targetValueKeys and index offsets
            List<String> targetValueKeys = new ArrayList<>();
            List<Integer> offsets = new ArrayList<>();
            for (GraphHistoryResponse graphHistoryResponse : graphHistoryResponseMap.get(counter)) {
                offsets.add(0);
                switch (monitorDataRequest.getTargetType()) {
                    case "node":
                        targetValueKeys.add(graphHistoryResponse.getEndpoint());
                        break;
                    case "pod":
                        targetValueKeys.add(containerPodMap.get(graphHistoryResponse.getCounter()
                                .substring(graphHistoryResponse.getCounter().indexOf("/id=") + 4)));
                        break;
                    case "container":
                        targetValueKeys.add(graphHistoryResponse.getCounter().substring(graphHistoryResponse.getCounter().indexOf("/id=") + 4));
                }
            }

            // for every timeStamp: create Map<String,Double>
            for (int index = 0; index < timeStampCount; index++) {

                Map<String, Double> targetValueMap = new HashMap<>();

                // add key "timeStamp"
                long currentTimeStamp = graphHistoryResponseMap.get(counter).get(maxCountIndex).getValues().get(index).getTimestamp();
                targetValueMap.put("timeStamp", (double) currentTimeStamp * 1000.0);

                for (GraphHistoryResponse graphHistoryResponse : graphHistoryResponseMap.get(counter)) {

                    int indexGraphHistoryResponse = graphHistoryResponseMap.get(counter).indexOf(graphHistoryResponse);
                    int indexActual = index - offsets.get(indexGraphHistoryResponse);
                    Double insertValue = null;

                    if (graphHistoryResponse.getValues().size() > indexActual) {
                        long actualTimeStamp = graphHistoryResponse.getValues().get(indexActual).getTimestamp();
                        if (actualTimeStamp > currentTimeStamp) {
                            offsets.set(indexGraphHistoryResponse, offsets.get(indexGraphHistoryResponse) + 1);
                        } else {
                            switch (monitorDataRequest.getTargetType()) {
                                case "pod":
                                    String pod = targetValueKeys.get(indexGraphHistoryResponse);
                                    if (!targetValueMap.containsKey(pod)) {
                                        insertValue = graphHistoryResponse.getValues().get(indexActual).getValue();
                                    } else if (graphHistoryResponse.getValues().get(indexActual).getValue() != null) {
                                        Double currentValue = targetValueMap.get(pod);
                                        if (currentValue == null) {
                                            insertValue = graphHistoryResponse.getValues().get(indexActual).getValue();
                                        } else {
                                            insertValue = currentValue + graphHistoryResponse.getValues().get(indexActual).getValue();
                                        }
                                    } else {
                                        insertValue = targetValueMap.get(pod);
                                    }
                                    break;
                                default:
                                    insertValue = graphHistoryResponse.getValues().get(indexActual).getValue();
                            }
                        }
                    }
                    String targetValueKey = targetValueKeys.get(indexGraphHistoryResponse);
                    targetValueMap.put(targetValueKey, insertValue);
                }

                monitorResult.getCounterResults().get(counter).add(targetValueMap);
            }
        }

        // change pod memory usage percent
        if (monitorDataRequest.getTargetType().equals("pod")) {
            int length = monitorResult.getCounterResults().get("container.mem.usage.percent").size();
            if (monitorResult.getCounterResults().get("container.mem.usage").size() < length) {
                length = monitorResult.getCounterResults().get("container.mem.usage").size();
            }
            if (monitorResult.getCounterResults().get("container.mem.limit").size() < length) {
                length = monitorResult.getCounterResults().get("container.mem.limit").size();
            }
            for (int index = 0; index < length; index++) {
                Map<String, Double> currentMap = monitorResult.getCounterResults().get("container.mem.usage.percent").get(index);
                for (String key : currentMap.keySet()) {
                    if (key.equals("timeStamp")) {
                        continue;
                    }
                    if (monitorResult.getCounterResults().get("container.mem.usage").get(index).containsKey(key) &&
                            monitorResult.getCounterResults().get("container.mem.usage").get(index).get(key) != null &&
                            monitorResult.getCounterResults().get("container.mem.limit").get(index).containsKey(key) &&
                            monitorResult.getCounterResults().get("container.mem.limit").get(index).get(key) != null) {
                        monitorResult.getCounterResults().get("container.mem.usage.percent").get(index).put(key,
                                monitorResult.getCounterResults().get("container.mem.usage").get(index).get(key)
                                        / monitorResult.getCounterResults().get("container.mem.limit").get(index).get(key) * 100
                        );
                    } else {
                        monitorResult.getCounterResults().get("container.mem.usage.percent").get(index).put(key, null);
                    }
                }
            }
        }
    }

    // create containerId-pod mapping
    private Map<String, String> getContainerPodMap(MonitorDataRequest monitorDataRequest) {

        Map<String, String> containerPodMap = new HashMap<>();
        if (!monitorDataRequest.getTargetType().equals("pod")) {
            return containerPodMap;
        }

        for (TargetInfo targetInfo : monitorDataRequest.getTargetInfos()) {
            for (ContainerInfo containerInfo : targetInfo.getPod().getContainers()) {
                containerPodMap.put(containerInfo.getContainerId(), targetInfo.getPod().getPodName());
            }
        }
        return containerPodMap;
    }


    private TargetRequest fetchTargetRequest(long targetId) {
        String targetRequestJson = monitorBiz.getMonitorTargetById(targetId);
        if (StringUtils.isBlank(targetRequestJson)) {
            return null;
        }

        TargetRequest targetRequest;
        try {
            targetRequest = mapper.readValue(targetRequestJson, TargetRequest.class);
        } catch (IOException e) {
            logger.error("error processing json!", e);
            return null;
        }

        return targetRequest;
    }

}