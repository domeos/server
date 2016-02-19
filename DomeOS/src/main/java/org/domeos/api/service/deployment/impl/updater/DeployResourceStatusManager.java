package org.domeos.api.service.deployment.impl.updater;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.domeos.api.mapper.cluster.ClusterBasicMapper;
import org.domeos.api.model.cluster.ClusterBasic;
import org.domeos.api.model.deployment.DashboardQueryData;
import org.domeos.api.model.deployment.DeployRunningContainer;
import org.domeos.api.model.deployment.MonitorCounterInfo;
import org.domeos.api.service.global.GlobalService;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.ContainerStatus;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.util.filter.Filter;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
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
public class DeployResourceStatusManager {

    static ClusterBasicMapper clusterBasicMapper;
    static GlobalService globalService;

    private static final long firstRunWaitSeconds = 10;
    private static final long runIntervalSeconds = 300;
    private static boolean resourceStatusManagerIsRunning = false;

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
    public void setClusterBasicMapper(ClusterBasicMapper clusterBasicMapper) {
        DeployResourceStatusManager.clusterBasicMapper = clusterBasicMapper;
    }

    @Autowired
    public void setGlobalService(GlobalService globalService) {
        DeployResourceStatusManager.globalService = globalService;
    }

    public void startUpdateResourceStatus() {
        executorService.scheduleWithFixedDelay(new UpdateStatusRunnable(), firstRunWaitSeconds, runIntervalSeconds,
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
                if (globalService != null && globalService.getMonitor() != null) {
                    // STEP 01: get information of all pods (cluster - namespace - pod)
                    List<ClusterBasic> clusterList = clusterBasicMapper.listClusterBasic();
                    if (clusterList != null && clusterList.size() > 0) {
                        for (ClusterBasic clusterBasic : clusterList) {
                            PodList podList = null;
                            try {
                                KubeClient kubeClient = new KubeClient(clusterBasic.getApi());
                                podList = kubeClient.listAllPod();
                            } catch (Exception ex) {
                                logger.warn("get pod list of " + clusterBasic.getName() + " exception: " + ex.getMessage());
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
                        Filter.getPodSuccessRunningFilter().filter(podList);
                        if (podList == null || podList.getItems() == null || podList.getItems().length == 0) {
                            continue;
                        }
                        for (Pod pod : podList.getItems()) {
                            if (pod.getStatus() == null || pod.getStatus().getContainerStatuses() == null
                                    || pod.getStatus().getContainerStatuses().length == 0 || pod.getMetadata() == null
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
                                    Map<String, String> limits = pod.getSpec().getContainers()[0].getResources().getLimits();
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
                                DashboardQueryData dashboardQueryData =
                                        queryCpuAndMemory(counter.getNodeName(), counter.getContainerId());
                                if (dashboardQueryData == null) {
                                    continue;
                                }
                                double cpuUsedAverage = 0.0;
                                for (Double value : dashboardQueryData.getCpudata()) {
                                    cpuUsedAverage += value;
                                }
                                if (dashboardQueryData.getCpudata().size() > 0) {
                                    cpuUsedAverage /= dashboardQueryData.getCpudata().size();
                                }
                                // TODO cpuUsedAverage should be multiply Node Cpu core number
                                //deployResourceStatus.addCpuUsed(cpuUsedAverage);
                                //deployResourceStatus.addCpuTotal(entry.getValue().getCpuTotal());
                                double memUsedAverage = 0.0;
                                for (Double value : dashboardQueryData.getMemdata()) {
                                    memUsedAverage += value;
                                }
                                if (dashboardQueryData.getMemdata().size() > 0) {
                                    memUsedAverage /= dashboardQueryData.getMemdata().size();
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

    private DashboardQueryData queryCpuAndMemory(String node, String containerId) throws IOException {
        String responseResult = "";
        BufferedReader responseReader = null;
        DashboardQueryData dashboardQueryData = null;
        try {
            long currentTime = System.currentTimeMillis() / 1000;
            // TODO openxxs for test
            if (globalService.getMonitor() != null) {
                String urlString = globalService.getMonitor().url()
                        + "/api/query?node=" + node
                        + "&containerid=" + containerId
                        + "&start=" + (currentTime - 300)
                        + "&end=" + currentTime;
                URL queryUrl = new URL(urlString);
                URLConnection connection = queryUrl.openConnection();
                connection.setRequestProperty("Content-Type", "application/json;charset=UTF-8");
                connection.connect();
                responseReader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
                String line;
                while ((line = responseReader.readLine()) != null) {
                    responseResult += line;
                }
            }
        } catch (Exception ex) {
            // non-exist container
            return dashboardQueryData;
        } finally {
            if (responseReader != null) {
                responseReader.close();
            }
        }
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            dashboardQueryData = objectMapper.readValue(responseResult, DashboardQueryData.class);
        } catch (IOException ex) {
            logger.warn("marshal DashboardQueryData exception: " + ex.getMessage());
        }
        return dashboardQueryData;
    }

    private double transferKubeResourceValue(String kubeValue) {
        try {
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
