package org.domeos.framework.api.service.overview.impl;

import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.configuration.ConfigurationBiz;
import org.domeos.framework.api.biz.deployment.DeployCollectionBiz;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerBiz;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerCollectionBiz;
import org.domeos.framework.api.biz.overview.OverviewBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.biz.project.ProjectCollectionBiz;
import org.domeos.framework.api.consolemodel.image.AllDockerImages;
import org.domeos.framework.api.consolemodel.loadBalancer.LoadBalancerCollectionInfo;
import org.domeos.framework.api.consolemodel.monitor.MonitorResult;
import org.domeos.framework.api.consolemodel.monitor.TargetRequest;
import org.domeos.framework.api.controller.exception.PermitException;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.cluster.related.NodeInfo;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.overview.DeploymentOverview;
import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.model.loadBalancer.related.LoadBalancerCollectionType;
import org.domeos.framework.api.model.monitor.TargetInfo;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.overview.DiskOverview;
import org.domeos.framework.api.model.overview.OperationContent;
import org.domeos.framework.api.model.overview.ProjectOverview;
import org.domeos.framework.api.model.overview.ResourceOverview;
import org.domeos.framework.api.model.overview.UsageOverview;
import org.domeos.framework.api.model.overview.related.DeploymentOnlineDetail;
import org.domeos.framework.api.model.project.ProjectCollection;
import org.domeos.framework.api.service.image.ImageService;
import org.domeos.framework.api.service.loadBalancer.LoadBalancerCollectionService;
import org.domeos.framework.api.service.monitor.MonitorService;
import org.domeos.framework.api.service.overview.OverviewService;
import org.domeos.framework.engine.AuthUtil;
import org.domeos.framework.engine.k8s.NodeWrapper;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.util.*;

/**
 * Created by junwuguo on 2017/1/19 0019.
 * The implementation of overview service
 */
@Service("overviewService")
public class OverviewServiceImpl implements OverviewService {

    @Autowired
    CollectionBiz collectionBiz;

    @Autowired
    ProjectCollectionBiz projectCollectionBiz;

    @Autowired
    ProjectBiz projectBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    DeployCollectionBiz deployCollectionBiz;

    @Autowired
    DeployEventBiz deployEventBiz;

    @Autowired
    ImageService imageService;

    @Autowired
    ImageBiz imageBiz;

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    ClusterBiz clusterBiz;

    @Autowired
    OperationHistory operationHistory;

    @Autowired
    MonitorService monitorService;
    
    @Autowired
    LoadBalancerBiz loadBalancerBiz;

    @Autowired
    LoadBalancerCollectionBiz loadBalancerCollectionBiz;
    
    @Autowired
    LoadBalancerCollectionService loadBalancerCollectionService;
    
    ConfigurationBiz configurationBiz;

    @Autowired
    OverviewBiz overviewBiz;

    private static Logger logger = LoggerFactory.getLogger(OverviewServiceImpl.class);
    //recent days
    private static final int RECENT_DAYS = 7;

    private User getUser() {
        User user = AuthUtil.getUser();
        if (user == null) {
            throw new PermitException("no user logged in");
        }
        return user;
    }

    private long getRecentTime(int before) {
        Calendar current = Calendar.getInstance();
        current.set(Calendar.DATE, current.get(Calendar.DATE) - before);
        current.set(Calendar.HOUR_OF_DAY, 0);
        current.set(Calendar.MINUTE, 0);
        current.set(Calendar.SECOND, 0);
        current.set(Calendar.MILLISECOND, 0);
        return current.getTimeInMillis();
    }

    @Override
    public UsageOverview getUsageOverview() throws InvocationTargetException, IllegalAccessException {
        UsageOverview result = new UsageOverview();
        result.merge(getProjectUsageOverview());
        result.merge(getImageUsageOverview());
        result.merge(getDeploymentUsageOverview());
        result.merge(getClusterUsageOverview());
        result.merge(getLoadBalancerUsageOverview());
        result.merge(getConfigurationUsageOverview());
        return result;
    }

    @Override
    public UsageOverview getProjectUsageOverview() {
        UsageOverview result = new UsageOverview();
        try {
            User user = getUser();
            //get the number of project collection
            Set<ProjectCollection> projectCollectionSet = projectCollectionBiz.getCurrentUserProjectCollectionSet(user.getId());
            result.setProjectCollection(projectCollectionSet.size());

            //get the number of project
            if (projectCollectionSet.isEmpty()) {
                result.setProject(0);
            } else {
                List<Integer> collectionIdList = new ArrayList<>(projectCollectionSet.size());
                for (ProjectCollection collection : projectCollectionSet) {
                    collectionIdList.add(collection.getId());
                }
                result.setProject((collectionBiz.getResourcesCountByIdList(ResourceType.PROJECT, collectionIdList)));
            }
        } catch (Exception e) {
            logger.warn("get the overview of projects' usage, message is " + e.getMessage());
        }
        return result;
    }

    @Override
    public ProjectOverview getRecentProjectOverview() {
        ProjectOverview result = new ProjectOverview();
        try {
            //Initialize
            Integer[] autoBuild = new Integer[RECENT_DAYS];
            Integer[] manualBuild = new Integer[RECENT_DAYS];
            Arrays.fill(autoBuild, 0);
            Arrays.fill(manualBuild, 0);

            User user = getUser();
            long recentTime = getRecentTime(RECENT_DAYS - 1);
            List<BuildHistory> buildHistoryList = null;
            if (AuthUtil.isAdmin(user.getId())) {
                //admin can get the build history of all projects include removed projects
                buildHistoryList = projectBiz.listRecentHistoryAllProjectsIncludeRemovedByTime(recentTime);
            } else {
                //because we can't get the authorization of removed projects,
                //so normal user can't get the build history of removed projects

                //get the number of project collection
                Set<ProjectCollection> projectCollectionSet = projectCollectionBiz.getCurrentUserProjectCollectionSet(user.getId());
                if (!projectCollectionSet.isEmpty()) {
                    StringBuilder projectCollectionIds = new StringBuilder("(");
                    for (ProjectCollection collection : projectCollectionSet) {
                        if (projectCollectionIds.length() != 1) {
                            projectCollectionIds.append(",");
                        }
                        projectCollectionIds.append(collection.getId());
                    }
                    projectCollectionIds.append(")");
                    buildHistoryList = projectBiz.listRecentHistoryByProjectCollectionIdsTime(projectCollectionIds.toString(), recentTime);
                }
            }
            if (buildHistoryList != null && !buildHistoryList.isEmpty()) {
                for (BuildHistory history : buildHistoryList) {
                    int index = getTimeIndex(history.getCreateTime());
                    if (index != -1) {
                        if (history.getAutoBuild() == 0) {
                            autoBuild[RECENT_DAYS - index - 1]++;
                        } else {
                            manualBuild[RECENT_DAYS - index - 1]++;
                        }
                    }
                }
            }
            result.setAutoBuild(Arrays.asList(autoBuild));
            result.setManualBuild(Arrays.asList(manualBuild));
        } catch (Exception e) {
            logger.warn("get the overview of recent project error, message is " + e.getMessage());
        }
        return result;
    }

    @Override
    public UsageOverview getDeploymentUsageOverview() {
        UsageOverview result = new UsageOverview();
        try {
            User user = getUser();
            List<Integer> collectionIdList = null;
            List<CollectionAuthorityMap> deployCollectionAuthorityMapList = AuthUtil.getCollectionList(user.getId(), ResourceType.DEPLOY_COLLECTION);
            if (deployCollectionAuthorityMapList != null && !deployCollectionAuthorityMapList.isEmpty()) {
                result.setDeployCollection(deployCollectionAuthorityMapList.size());
                collectionIdList = new ArrayList<>(deployCollectionAuthorityMapList.size());
                for (CollectionAuthorityMap map : deployCollectionAuthorityMapList) {
                    collectionIdList.add(map.getCollectionId());
                }
            }

            if (collectionIdList == null || collectionIdList.isEmpty()) {
                result.setDeployment(0);
            } else {
                result.setDeployment(collectionBiz.getResourcesCountByIdList(ResourceType.DEPLOY, collectionIdList));
            }
        } catch (Exception e) {
            logger.warn("get the overview of deployments' usage error, message is " + e.getMessage());
        }
        return result;
    }

    @Override
    public DeploymentOverview getRecentDeploymentOverview() {
        DeploymentOverview result = new DeploymentOverview();
        try {
            //Initialize
            Integer[] autoDeploy = new Integer[RECENT_DAYS];
            Integer[] onlineNumber = new Integer[RECENT_DAYS];
            DeploymentOnlineDetail[] onlineDetails = new DeploymentOnlineDetail[RECENT_DAYS];
            Arrays.fill(autoDeploy, 0);
            Arrays.fill(onlineNumber, 0);
            for (int i = 0; i < RECENT_DAYS; i++) {
                onlineDetails[i] = new DeploymentOnlineDetail();
            }

            User user = getUser();
            long recentTime = getRecentTime(RECENT_DAYS - 1);
            List<DeployEvent> eventList;
            if (AuthUtil.isAdmin(user.getId())) {
                //admin can get the recent event of all deployments include removed deployments
                eventList = deployEventBiz.listRecentEventAllDeploymentIncludeRemovedByTime(recentTime);
            } else {
                //because we can't get the authorization of removed deployments,
                //so normal user can't get the recent event of removed deployments

                //get the number of project collection
                List<CollectionAuthorityMap> deployCollectionAuthorityMapList = AuthUtil.getCollectionList(user.getId(), ResourceType.DEPLOY_COLLECTION);
                eventList = deployEventBiz.listRecentEventByDeployCollectionIdTime(deployCollectionAuthorityMapList, recentTime);
            }
            for (DeployEvent event : eventList) {
                int index = getTimeIndex(event.getStartTime());
                if (index != -1) {
                    if (event.getUserName().equals("DomeOS")) {
                        autoDeploy[RECENT_DAYS - index - 1]++;
                    }
                    switch (event.getOperation()) {
                        case START:
                            onlineDetails[RECENT_DAYS - index - 1].setStartNumber(onlineDetails[RECENT_DAYS - index - 1].getStartNumber() + 1);
                            break;

                        case UPDATE:
                            onlineDetails[RECENT_DAYS - index - 1].setUpdateNumber(onlineDetails[RECENT_DAYS - index - 1].getUpdateNumber() + 1);
                            break;

                        case ROLLBACK:
                            onlineDetails[RECENT_DAYS - index - 1].setRollbackNumber(onlineDetails[RECENT_DAYS - index - 1].getRollbackNumber() + 1);
                            break;

                        case SCALE_UP:
                            onlineDetails[RECENT_DAYS - index - 1].setScaleUpNumber(onlineDetails[RECENT_DAYS - index - 1].getScaleUpNumber() + 1);
                            break;

                        case SCALE_DOWN:
                            onlineDetails[RECENT_DAYS - index - 1].setScaleDownNumber(onlineDetails[RECENT_DAYS - index - 1].getScaleDownNumber() + 1);
                            break;
                    }
                }
            }
            for (int i = 0; i < onlineDetails.length; i++) {
                onlineNumber[i] = onlineDetails[i].getStartNumber() + onlineDetails[i].getUpdateNumber() + onlineDetails[i].getRollbackNumber()
                        + onlineDetails[i].getScaleUpNumber() + onlineDetails[i].getScaleDownNumber();
            }
            result.setAutoDeploy(Arrays.asList(autoDeploy));
            result.setOnlineNumber(Arrays.asList(onlineNumber));
            result.setOnlineDetails(Arrays.asList(onlineDetails));
        } catch (Exception e) {
            logger.warn("get the overview of recent deployment error, message is " + e.getMessage());
        }
        return result;
    }

    private int getTimeIndex(long time) {
        int result = -1;
        for (int i = 0; i < RECENT_DAYS; i++) {
            if (time >= getRecentTime(i)) {
                result = i;
                break;
            }
        }
        return result;
    }

    @Override
    public UsageOverview getImageUsageOverview() {
        UsageOverview result = new UsageOverview();
        try {
            int baseImageCount = imageBiz.getBaseImagesCount();
            int projectImageNumber = 0;
            int otherImageNumber = 0;
            Registry registry = globalBiz.getRegistry();
            if (registry != null) {
                AllDockerImages allDockerImages = (AllDockerImages) imageService.getAllDockerImages().getResult();
                projectImageNumber = allDockerImages.getAllProjectImageCount();
                otherImageNumber = allDockerImages.getOtherImages().size();
            }
            result.setImage(baseImageCount + projectImageNumber + otherImageNumber);
            result.setImageBase(baseImageCount);
            result.setImageProject(projectImageNumber);
            result.setImageOther(otherImageNumber);
        } catch (Exception e) {
            logger.warn("get the overview of image error, message is " + e.getMessage());
        }
        return result;
    }

    @Override
    public UsageOverview getClusterUsageOverview() {
        UsageOverview result = new UsageOverview();
        try {
            User user = getUser();
            if (AuthUtil.isAdmin(user.getId())) {
                result.setCluster(clusterBiz.listClusters().size());
            } else {
                result.setCluster(collectionBiz.getAuthoritiesCountByUserIdAndResourceType(user.getId(), ResourceType.CLUSTER));
            }
        } catch (Exception e) {
            logger.warn("get the overview of cluster error, message is " + e.getMessage());
        }
        return result;
    }

    @Override
    public UsageOverview getConfigurationUsageOverview() {
        UsageOverview result = new UsageOverview();
        try {
            User user = getUser();
            List<Integer> collectionIdList = null;
            List<CollectionAuthorityMap> configurationCollectionAuthorityMapList =
                    AuthUtil.getCollectionList(user.getId(), ResourceType.CONFIGURATION_COLLECTION);
            if (configurationCollectionAuthorityMapList != null && !configurationCollectionAuthorityMapList.isEmpty()) {
                result.setConfigurationCollection(configurationCollectionAuthorityMapList.size());
                collectionIdList = new ArrayList<>(configurationCollectionAuthorityMapList.size());
                for (CollectionAuthorityMap map : configurationCollectionAuthorityMapList) {
                    collectionIdList.add(map.getCollectionId());
                }
            }

            if (collectionIdList == null || collectionIdList.isEmpty()) {
                result.setConfiguration(0);
            } else {
                result.setConfiguration(collectionBiz.getResourcesCountByIdList(ResourceType.CONFIGURATION, collectionIdList));
            }
        } catch (Exception e) {
            logger.warn("get the overview of configuration error, message is " + e.getMessage());
        }
        return result;
    }

    @Override
    public List<OperationContent> getOperationOverview() {
        try {
            User user = getUser();
            Calendar current = Calendar.getInstance();
            current.set(Calendar.HOUR_OF_DAY, 0);
            current.set(Calendar.MINUTE, 0);
            current.set(Calendar.SECOND, 0);
            current.set(Calendar.MILLISECOND, 0);
            long time = current.getTimeInMillis();
            List<OperationRecord> recordList = operationHistory.listOperationRecordByUserNameTime(user.getId(), time);
            Map<ResourceType, Map<Integer, String>> map = new HashMap<>();

            for (OperationRecord record : recordList) {
                if (map.containsKey(record.getResourceType())) {
                    map.get(record.getResourceType()).put(record.getResourceId(), "");
                } else {
                    Map<Integer, String> tmp = new HashMap<>();
                    tmp.put(record.getResourceId(), "");
                    map.put(record.getResourceType(), tmp);
                }
            }

            for (ResourceType key : map.keySet()) {
                try {
                    Map<Integer, String> nameMap = map.get(key);
                    if (!nameMap.isEmpty()) {
                        nameMap.putAll(overviewBiz.getIdNameMapIncludeRemovedByIdList(key.getTableName(), generateIdList(nameMap)));
                    }
                } catch (Exception e) {
                    logger.warn("get the overview of operation error, message is " + e.getMessage());
                }
            }

            List<OperationContent> result = new ArrayList<>(recordList.size());
            for (OperationRecord record : recordList) {
                result.add(new OperationContent(map.get(record.getResourceType()).get(record.getResourceId()),
                        record.getResourceType(), record.getOperation(), record.getUserId(), record.getUserName(), record.getOperateTime()));
            }
            Collections.sort(result, new OperationContent.OperationContentListComparator());
            return result;
        } catch (Exception e) {
            logger.warn("get the overview of operation error, message is " + e.getMessage());
        }
        return new ArrayList<>(1);
    }

    private List<Integer> generateIdList(Map<Integer, String> map) {
        if (map == null || map.isEmpty()) {
            return null;
        }
        return new ArrayList<>(map.keySet());
    }

    @Override
    public ResourceOverview getResourceOverview() {
        ResourceOverview result = new ResourceOverview();
        try {
            User user = getUser();
            //insert all clusters' nodes' information to monitor_targets table
            List<NodeInfo> nodeList = new ArrayList<>();
            List<CollectionAuthorityMap> clusterAuthorityMapList = AuthUtil.getCollectionList(user.getId(), ResourceType.CLUSTER);
            if (!clusterAuthorityMapList.isEmpty()) {
                int tmpClusterId = clusterAuthorityMapList.get(0).getCollectionId();
                List<TargetInfo> targetInfos = new ArrayList<>();
                for (CollectionAuthorityMap authorityMap : clusterAuthorityMapList) {
                    try {
                        NodeWrapper nodeWrapper = new NodeWrapper().init(authorityMap.getCollectionId(), null);
                        List<NodeInfo> nodeInfoInCluster = nodeWrapper.getNodeInfoListWithoutPods();
                        nodeList.addAll(nodeInfoInCluster);
                        for (NodeInfo nodeInfo : nodeInfoInCluster) {
                            targetInfos.add(new TargetInfo(nodeInfo.getName(), null, null));
                        }
                    } catch (Exception e) {
                        logger.error(e.getMessage());
                    }
                }
                TargetRequest targetRequest = new TargetRequest(tmpClusterId, "node", targetInfos);
                monitorService.insertTargets(targetRequest);

                //use the existing function to get monitor data
                Calendar current = Calendar.getInstance();
                long endTime = current.getTimeInMillis();
                current.set(Calendar.MINUTE, current.get(Calendar.MINUTE) - 1);
                long startTime = current.getTimeInMillis();
                MonitorResult monitorResult = monitorService.getMonitorDataForOverview(targetRequest, startTime, endTime, "AVERAGE", false);
                if (null != monitorResult) {
                    Map<String, List<Map<String, Double>>> data = monitorResult.getCounterResults();
                    result.setMemoryTotal(getAverageSum(data, "mem.memtotal", null));
                    result.setMemoryUsed(getAverageSum(data, "mem.memused", null));
                    getAverageCpu(data, result);
                }
            }
            int onlineNode = 0;
            for (NodeInfo node : nodeList) {
                if (node.getStatus().equals("Ready")) {
                    onlineNode++;
                }
            }
            result.setNode(nodeList.size());
            result.setNodeOnline(onlineNode);
            result.setNodeOffline(nodeList.size() - onlineNode);
        } catch (Exception e) {
            logger.warn("get the overview of resources error, message is:" + e.getMessage());
        }
        return result;
    }

    @Override
    public DiskOverview getDiskOverview() {
        DiskOverview result = new DiskOverview();
        try {
            User user = getUser();
            //insert all clusters' nodes' information to monitor_targets table
            List<CollectionAuthorityMap> clusterAuthorityMapList = AuthUtil.getCollectionList(user.getId(), ResourceType.CLUSTER);
            if (!clusterAuthorityMapList.isEmpty()) {
                int tmpClusterId = clusterAuthorityMapList.get(0).getCollectionId();
                List<TargetInfo> targetInfos = new ArrayList<>();
                for (CollectionAuthorityMap authorityMap : clusterAuthorityMapList) {
                    try {
                        NodeWrapper nodeWrapper = new NodeWrapper().init(authorityMap.getCollectionId(), null);
                        for (NodeInfo nodeInfo : nodeWrapper.getNodeInfoListWithoutPods()) {
                            targetInfos.add(new TargetInfo(nodeInfo.getName(), null, null));
                        }
                    } catch (Exception e) {
                        logger.error(e.getMessage());
                    }
                }
                TargetRequest targetRequest = new TargetRequest(tmpClusterId, "node", targetInfos);
                monitorService.insertTargets(targetRequest);

                //use the existing function to get monitor data
                Calendar current = Calendar.getInstance();
                long endTime = current.getTimeInMillis();
                current.set(Calendar.MINUTE, current.get(Calendar.MINUTE) - 1);
                long startTime = current.getTimeInMillis();
                MonitorResult monitorResult = monitorService.getMonitorDataForOverview(targetRequest, startTime, endTime, "AVERAGE", true);
                if (null != monitorResult) {
                    Map<String, List<Map<String, Double>>> data = monitorResult.getCounterResults();
                    Double diskTotal = getAverageSum(data, "df.bytes.total/mount", null);
                    Double diskUsed = getAverageSum(data, "df.bytes.used/mount", null);
                    result.setDiskTotal(diskTotal);
                    result.setDiskRemain(diskTotal - diskUsed);
                }
            }
        } catch (Exception e) {
            logger.warn("get the overview of disk error, message is:" + e.getMessage());
        }
        return result;
    }

    private Double getAverageSum(Map<String, List<Map<String, Double>>> data, String keyPrefix, String pathIgnore) {
        Double result = 0.0;
        if (data != null && StringUtils.isNotBlank(keyPrefix)) {
            for (String key : data.keySet()) {
                if (StringUtils.isNotBlank(pathIgnore) && key.contains(pathIgnore)) {
                    continue;
                }
                if (key.startsWith(keyPrefix)) {
                    Map<String, List<Double>> all = new HashMap<>();
                    for (Map<String, Double> total : data.get(key)) {
                        for (String node : total.keySet()) {
                            if (!node.equals("timeStamp") && total.get(node) != null) {
                                if (all.containsKey(node)) {
                                    all.get(node).add(total.get(node));
                                } else {
                                    List<Double> tmp = new ArrayList<>(1);
                                    tmp.add(total.get(node));
                                    all.put(node, tmp);
                                }
                            }
                        }
                    }
                    for (String node : all.keySet()) {
                        List<Double> detail = all.get(node);
                        if (detail.size() != 0) {
                            Double sum = 0.0;
                            for (Double d : detail) {
                                sum += d;
                            }
                            result += sum / detail.size();
                        }
                    }
                }
            }
        }
        return result;
    }

    private void getAverageCpu(Map<String, List<Map<String, Double>>> data, ResourceOverview result) {
        if (data.containsKey("cpu.busy")) {
            Map<String, Double> total = new HashMap<>();
            for (Map<String, Double> cpu : data.get("cpu.busy")) {
                for (String key : cpu.keySet()) {
                    if (!key.equals("timeStamp") && cpu.get(key) != null) {
                        if (total.containsKey(key)) {
                            total.put(key, total.get(key) + cpu.get(key));
                        } else {
                            total.put(key, cpu.get(key));
                        }
                    }
                }
            }
            int cpu0To25 = 0;
            int cpu25To50 = 0;
            int cpu50To75 = 0;
            int cpu75To100 = 0;
            if (data.get("cpu.busy").size() != 0) {
                for (String key : total.keySet()) {
                    if (total.get(key) / data.get("cpu.busy").size() >= 0 && total.get(key) / data.get("cpu.busy").size() < 25) {
                        cpu0To25++;
                    } else if (total.get(key) / data.get("cpu.busy").size() < 50) {
                        cpu25To50++;
                    } else if (total.get(key) / data.get("cpu.busy").size() < 75) {
                        cpu50To75++;
                    } else if (total.get(key) / data.get("cpu.busy").size() <= 100) {
                        cpu75To100++;
                    }
                }
            }
            result.setCpu0To25(cpu0To25);
            result.setCpu25To50(cpu25To50);
            result.setCpu50To75(cpu50To75);
            result.setCpu75To100(cpu75To100);
        }
    }
    
    @Override
    public UsageOverview getLoadBalancerUsageOverview() {
        UsageOverview result = new UsageOverview();
        try {
            List<LoadBalancerCollectionInfo> lbcInfos = loadBalancerCollectionService.listLoadBalancerCollection();
            if (lbcInfos == null || lbcInfos.size() == 0) {
                result.setLoadBalancerCollection(0);
                result.setLoadBalancerNginx(0);
                result.setLoadBalancerProxy(0);
            } else {
                result.setLoadBalancerCollection(lbcInfos.size());
                int loadBalancerNginx = 0;
                int loadBalancerProxy = 0;
                for (LoadBalancerCollectionInfo info : lbcInfos) {
                    if (info.getLbcType() == LoadBalancerCollectionType.KUBE_PROXY) {
                        loadBalancerProxy += info.getLoadBalancerCount();
                    } else {
                        loadBalancerNginx += info.getLoadBalancerCount();
                    }
                }
                result.setLoadBalancerNginx(loadBalancerNginx);
                result.setLoadBalancerProxy(loadBalancerProxy);
            }
        } catch (Exception e) {
            logger.warn("get the overview of deployments' usage error, message is " + e.getMessage());
        }
        return result;
    }

}
