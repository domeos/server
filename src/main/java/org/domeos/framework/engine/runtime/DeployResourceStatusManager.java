package org.domeos.framework.engine.runtime;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.fabric8.kubernetes.api.model.ContainerStatus;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.Quantity;
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
            try {
                List<PodList> allPodList = new ArrayList<>();
                if (globalBiz != null && globalBiz.getMonitor() != null) {
                    // STEP 01: get information of all pods (cluster - namespace - pod)
                    List<Cluster> clusterList = clusterBiz.listClusters();
                    if (clusterList != null && clusterList.size() > 0) {
                        for (Cluster cluster : clusterList) {
                            PodList podList;
                            try {
                                KubeUtils kubeClient = Fabric8KubeUtils.buildKubeUtils(cluster, null);
                                podList = kubeClient.listAllPod();
                            } catch (Exception ex) {
                                logger.warn("get pod list of " + cluster.getName() + " exception: " + ex.getMessage());
                                continue;
                            }
                            if (podList != null) {
                                allPodList.add(podList);
                            }
                        }
                    }

                    // STEP 02: classify running containers by deployId
                    Map<Long, DeployRunningContainer> deployWithContainerIds = new HashMap<>();
                    for (PodList podList : allPodList) {
                        if (podList == null || podList.getItems() == null || podList.getItems().size() == 0) {
                            continue;
                        }
                        for (Pod pod : podList.getItems()) {
                            if (!"Running".equals(PodUtils.getPodStatus(pod))) {
                                continue;
                            }
                            if (pod.getStatus() == null || pod.getStatus().getContainerStatuses() == null
                                    || pod.getStatus().getContainerStatuses().size() == 0 || pod.getMetadata() == null
                                    || pod.getMetadata().getLabels() == null) {
                                continue;
                            }
                            long deployId;
                            if (pod.getMetadata().getLabels().get(GlobalConstant.DEPLOY_ID_STR) != null) {
                                try {
                                    deployId = Long.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.DEPLOY_ID_STR));
                                } catch (Exception ex) {
                                    continue;
                                }
                            } else {
                                continue;
                            }
                            long versionId;
                            if (pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR) != null) {
                                try {
                                    versionId = Long.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
                                } catch (Exception ex) {
                                    continue;
                                }
                            } else {
                                continue;
                            }
                            for (ContainerStatus containerStatus : pod.getStatus().getContainerStatuses()) {
                                if (containerStatus == null || containerStatus.getContainerID() == null) {
                                    continue;
                                }
                                String containerId = containerStatus.getContainerID();
                                // transfer containerId from docker://xxx to xxx
                                containerId = containerId.replaceAll("docker://", "");
                                if (deployWithContainerIds.containsKey(deployId)) {
                                    deployWithContainerIds.get(deployId).insertNewRecord(pod.getSpec().getNodeName(), containerId);
                                } else {
                                    DeployRunningContainer deployRunningContainer = new DeployRunningContainer(deployId, versionId);
                                    deployRunningContainer.insertNewRecord(pod.getSpec().getNodeName(), containerId);
                                    Map<String, Quantity> limits = pod.getSpec().getContainers().get(0).getResources().getLimits();
                                    if (limits != null && limits.containsKey("cpu")) {
                                        double cpuTotal = transferKubeResourceValue(limits.get("cpu"));
                                        deployRunningContainer.setCpuTotal(cpuTotal);
                                    } else {
                                        deployRunningContainer.setCpuTotal(0.0);
                                    }
                                    if (limits != null && limits.containsKey("memory")) {
                                        double memTotal = transferKubeResourceValue(limits.get("memory")) / (1024.0 * 1024.0);
                                        deployRunningContainer.setMemTotal(memTotal);
                                    } else {
                                        deployRunningContainer.setMemTotal(0.0);
                                    }
                                    deployWithContainerIds.put(deployId, deployRunningContainer);
                                }
                            }
                        }
                    }

                    // STEP 03: calculate cpuTotal, cpuUsed, memTotal and memUsed for each deployment
                    Map<Long, DeployResourceStatus> allDeployResourceStatusTmp = new HashMap<>();
                    for (Map.Entry<Long, DeployRunningContainer> entry : deployWithContainerIds.entrySet()) {
                        DeployResourceStatus deployResourceStatus = new DeployResourceStatus();
                        deployResourceStatus.setDeployId(entry.getKey());
                        if (entry.getValue().getCounterInfo() != null && entry.getValue().getCounterInfo().size() > 0) {
                            for (MonitorCounterInfo counter : entry.getValue().getCounterInfo()) {
                                QueryData queryData =
                                        queryCpuAndMemory(counter.getNodeName(), counter.getContainerId());
                                if (queryData == null || !queryData.getOk()) {
                                    continue;
                                }
                                double cpuUsedAverage = 0.0;
                                for (Double value : queryData.getCpudata()) {
                                    cpuUsedAverage += value;
                                }
                                if (queryData.getCpudata().size() > 0) {
                                    cpuUsedAverage /= queryData.getCpudata().size();
                                }
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
                                deployResourceStatus.addMemUsed(memUsedAverage / 1024 / 1024);
                                deployResourceStatus.addMemTotal(entry.getValue().getMemTotal());
                            }
                        }
                        allDeployResourceStatusTmp.put(entry.getKey(), deployResourceStatus);
                    }

                    // STEP 04: copy allDeployResourceStatusTmp to all DeployResourceStatus for query
                    allDeployResourceStatus.clear();
                    allDeployResourceStatus.putAll(allDeployResourceStatusTmp);
                }
            } catch (IOException e) {
                logger.warn("get resource occupation ratio failed: " + e.getMessage());
            } catch (Exception ex) {
                logger.error("unknown exception when get resource occupation ratio : " + ex.getMessage(), ex);
            }
        }
    }

    // 2016-03-25: fetch info from query instead of dashboard
    private QueryData queryCpuAndMemory(String node, String containerId) throws IOException {

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

    private double transferKubeResourceValue(Quantity quantity) {
        try {
            String kubeValue = quantity.getAmount();
            if (kubeValue.length() < 2) {
                return Double.parseDouble(kubeValue);
            } else {
                switch (kubeValue.charAt(kubeValue.length() - 1)) {
                    case 'm':
                        return 0.001 * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 1));
                    case 'K':
                        return Math.pow(10.0, 3) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 1));
                    case 'M':
                        return Math.pow(10.0, 6) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 1));
                    case 'G':
                        return Math.pow(10.0, 9) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 1));
                    case 'T':
                        return Math.pow(10.0, 12) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 1));
                    case 'P':
                        return Math.pow(10.0, 15) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 1));
                    case 'E':
                        return Math.pow(10.0, 18) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 1));
                    case 'i':
                        if (kubeValue.length() > 2) {
                            switch (kubeValue.charAt(kubeValue.length() - 2)) {
                                case 'K':
                                    return 1024.0 * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 2));
                                case 'M':
                                    return Math.pow(1024.0, 2) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 2));
                                case 'G':
                                    return Math.pow(1024.0, 3) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 2));
                                case 'T':
                                    return Math.pow(1024.0, 4) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 2));
                                case 'P':
                                    return Math.pow(1024.0, 5) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 2));
                                case 'E':
                                    return Math.pow(1024.0, 6) * Double.parseDouble(kubeValue.substring(0, kubeValue.length() - 2));
                            }
                        } else {
                            return 0.0;
                        }
                    default:
                        return 0.0;
                }
            }
        } catch (Exception ex) {
            return 0.0;
        }
    }

}
