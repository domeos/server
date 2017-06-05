package org.domeos.framework.engine.runtime;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.related.DeployResourceStatus;
import org.domeos.framework.api.model.monitor.falcon.CounterValue;
import org.domeos.framework.api.model.monitor.falcon.EndpointCounter;
import org.domeos.framework.api.model.monitor.falcon.GraphHistoryRequest;
import org.domeos.framework.api.model.monitor.falcon.GraphHistoryResponse;
import org.domeos.framework.api.service.monitor.MonitorService;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Created by xxs on 16/1/15.
 */
@Component
public class DeployResourceStatusManager implements IResourceStatus {

    private static ClusterBiz clusterBiz;
    private static GlobalBiz globalBiz;
    private static MonitorService monitorSelfService;

    private static final long FIRST_RUN_WAIT_SECONDS = 10;
    private static final long RUN_INTERVAL_SECONDS = 300;
    private static boolean resourceStatusManagerIsRunning = false;

    @PostConstruct
    public void init() {
        if (!resourceStatusManagerIsRunning) {
            startUpdateResourceStatus();
            resourceStatusManagerIsRunning = true;
        }
    }

    private static Logger logger = LoggerFactory.getLogger(DeployResourceStatusManager.class);

    private static Map<Long, DeployResourceStatus> allDeployResourceStatus = new ConcurrentHashMap<>();
    private static ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

    private DeployResourceStatusManager() {
    }

    @Autowired
    public void setClusterBiz(ClusterBiz clusterBiz) {
        DeployResourceStatusManager.clusterBiz = clusterBiz;
    }

    @Autowired
    public void setGlobalService(GlobalBiz globalBiz) {
        DeployResourceStatusManager.globalBiz = globalBiz;
    }

    @Autowired
    public void setMonitorSelfService(MonitorService monitorSelfService) {
        DeployResourceStatusManager.monitorSelfService = monitorSelfService;
    }

    private void startUpdateResourceStatus() {
        executorService.scheduleWithFixedDelay(new UpdateStatusRunnable(), FIRST_RUN_WAIT_SECONDS, RUN_INTERVAL_SECONDS,
                TimeUnit.SECONDS);
    }

    public DeployResourceStatus getDeployResourceStatusById(long deploymentId) {
        return allDeployResourceStatus.get(deploymentId);
    }

    private class UpdateStatusRunnable implements Runnable {
        @Override
        public void run() {
            if (globalBiz != null && globalBiz.getMonitor() != null) {
                // STEP 01: get information of all pods (cluster - namespace - pod)
                List<Cluster> clusterList = clusterBiz.listClusters();
                if (clusterList == null || clusterList.isEmpty()) {
                    return;
                }
                List<PodList> allPodList = new ArrayList<>(clusterList.size());
                for (Cluster cluster : clusterList) {
                    try {
                        KubeUtils kubeClient = Fabric8KubeUtils.buildKubeUtils(cluster, null);
                        PodList podList = kubeClient.listAllPod();
                        if (podList != null) {
                            allPodList.add(podList);
                        }
                    } catch (Exception ex) {
                        logger.warn("get pod list of " + cluster.getName() + " exception: " + ex.getMessage());
                    }
                }

                // STEP 02: classify running containers by deployId
                if (allPodList.isEmpty()) {
                    return;
                }
                Map<Long, DeployRunningContainer> deployWithContainerIds = new HashMap<>(allPodList.size());
                for (PodList podList : allPodList) {
                    if (podList == null || podList.getItems() == null || podList.getItems().isEmpty()) {
                        continue;
                    }
                    for (Pod pod : podList.getItems()) {
                        if (!"Running".equals(PodUtils.getPodStatus(pod)) || pod.getStatus() == null
                                || pod.getStatus().getContainerStatuses() == null || pod.getStatus().getContainerStatuses().isEmpty()
                                || pod.getMetadata() == null || pod.getMetadata().getLabels() == null
                                || pod.getMetadata().getLabels().get(GlobalConstant.DEPLOY_ID_STR) == null
                                || pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR) == null
                                || pod.getSpec() == null || pod.getSpec().getContainers() == null) {
                            continue;
                        }
                        long deployId, versionId;
                        try {
                            deployId = Long.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.DEPLOY_ID_STR));
                            versionId = Long.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
                        } catch (Exception ex) {
                            continue;
                        }
                        DeployRunningContainer deployRunningContainer = new DeployRunningContainer(deployId, versionId);
                        Map.Entry<Double, Double> cpuMemPair = PodUtils.getPodCpuMemoryLimits(pod);
                        deployRunningContainer.setCpuTotal(cpuMemPair.getKey());
                        deployRunningContainer.setMemTotal(cpuMemPair.getValue());
                        deployRunningContainer.setCounterInfo(PodUtils.getPodMonitorCounterInfoList(pod));
                        deployWithContainerIds.put(deployId, deployRunningContainer);
                    }
                }

                // STEP 03: calculate cpuTotal, cpuUsed, memTotal and memUsed for each deployment
                if (deployWithContainerIds.isEmpty()) {
                    return;
                }
                Map<Long, DeployResourceStatus> allDeployResourceStatusTmp = new HashMap<>(deployWithContainerIds.size());
                for (Map.Entry<Long, DeployRunningContainer> entry : deployWithContainerIds.entrySet()) {
                    DeployResourceStatus deployResourceStatus = new DeployResourceStatus();
                    deployResourceStatus.setDeployId(entry.getKey());
                    if (entry.getValue().getCounterInfo() == null || entry.getValue().getCounterInfo().isEmpty()) {
                        allDeployResourceStatusTmp.put(entry.getKey(), deployResourceStatus);
                        continue;
                    }
                    for (MonitorCounterInfo counter : entry.getValue().getCounterInfo()) {
                        QueryData queryData = queryCpuAndMemory(counter.getNodeName(), counter.getContainerId());
                        if (queryData == null || !queryData.getOk()) {
                            continue;
                        }
                        //double cpuUsedAverage = 0.0;
                        //for (Double value : queryData.getCpudata()) {
                        //    cpuUsedAverage += value;
                        //}
                        //if (queryData.getCpudata().size() > 0) {
                        //    cpuUsedAverage /= queryData.getCpudata().size();
                        //}
                        // TODO cpuUsedAverage should be multiply Node Cpu core number
                        //deployResourceStatus.addCpuUsed(cpuUsedAverage);
                        //deployResourceStatus.addCpuTotal(entry.getValue().getCpuTotal());
                        double memUsedAverage = 0.0;
                        for (Double value : queryData.getMemdata()) {
                            memUsedAverage += value;
                        }
                        if (queryData.getMemdata().size() > 0) {
                            memUsedAverage /= queryData.getMemdata().size();
                        }
                        deployResourceStatus.addMemUsed(memUsedAverage / 1024.0 / 1024.0);
                    }
                    deployResourceStatus.setMemTotal(entry.getValue().getMemTotal());
                    allDeployResourceStatusTmp.put(entry.getKey(), deployResourceStatus);
                }

                // STEP 04: copy allDeployResourceStatusTmp to all DeployResourceStatus for query
                allDeployResourceStatus.clear();
                allDeployResourceStatus.putAll(allDeployResourceStatusTmp);
            }
        }
    }

    // 2016-03-25: fetch info from query instead of dashboard
    private QueryData queryCpuAndMemory(String node, String containerId) {
        GraphHistoryRequest graphHistoryRequest = new GraphHistoryRequest();
        List<GraphHistoryResponse> graphHistoryResponses = null;
        try {
            long currentTime = System.currentTimeMillis() / 1000;
            graphHistoryRequest.setStart(currentTime - 300);
            graphHistoryRequest.setEnd(currentTime);
            graphHistoryRequest.setCf("AVERAGE");
            List<EndpointCounter> endpointCounters = new ArrayList<>();
            endpointCounters.add(new EndpointCounter(node, "container.cpu.usage.busy/id=" + containerId));
            endpointCounters.add(new EndpointCounter(node, "container.mem.usage/id=" + containerId));
            graphHistoryRequest.setEndpoint_counters(endpointCounters);
            // TODO test
            if (globalBiz.getMonitor() != null) {
                String urlString = "http://" + globalBiz.getMonitor().getQuery() + "/graph/history";
                graphHistoryResponses = monitorSelfService.postJson(urlString, graphHistoryRequest);
            }
        } catch (JsonProcessingException e) {
            logger.error("error processing json!", e);
            return null;
        } catch (IOException e) {
            logger.error("io exception!", e);
            return null;
        }

        if (graphHistoryResponses == null) {
            logger.warn("query response is null");
            return null;
        }

        QueryData queryData = new QueryData();
        queryData.setMsg("no data");
        queryData.setOk(false);
        for (GraphHistoryResponse graphHistoryResponse : graphHistoryResponses) {
            if (graphHistoryResponse.getValues() != null) {
                if (graphHistoryResponse.getCounter().startsWith("container.cpu.usage.busy")) {
                    for (CounterValue counterValue : graphHistoryResponse.getValues()) {
                        if (counterValue.getValue() != null) {
                            queryData.getCpudata().add(counterValue.getValue());
                        }
                    }
                } else if (graphHistoryResponse.getCounter().startsWith("container.mem.usage")) {
                    for (CounterValue counterValue : graphHistoryResponse.getValues()) {
                        if (counterValue.getValue() != null) {
                            queryData.getMemdata().add(counterValue.getValue());
                        }
                    }
                }
            }
        }
        if (queryData.getCpudata().size() != 0 && queryData.getMemdata().size() != 0) {
            queryData.setMsg("OK");
            queryData.setOk(true);
        }
        return queryData;
    }
}
