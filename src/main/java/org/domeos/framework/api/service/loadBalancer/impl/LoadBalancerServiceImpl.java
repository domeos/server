package org.domeos.framework.api.service.loadBalancer.impl;

import org.domeos.basemodel.ResultStat;
import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.K8sDriverException;
import org.domeos.exception.LoadBalancerException;
import org.domeos.framework.api.biz.OperationHistory;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.biz.deployment.*;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.biz.loadBalancer.*;
import org.domeos.framework.api.consolemodel.deployment.*;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.consolemodel.loadBalancer.*;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.ClusterWatcherDeployMap;
import org.domeos.framework.api.model.cluster.related.NodeInfo;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.deployment.*;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.api.model.deployment.related.Container;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.loadBalancer.*;
import org.domeos.framework.api.model.loadBalancer.related.*;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.api.service.event.EventService;
import org.domeos.framework.api.service.loadBalancer.LoadBalancerService;
import org.domeos.framework.engine.*;
import org.domeos.framework.engine.exception.DriverException;
import org.domeos.framework.engine.k8s.*;
import org.domeos.framework.engine.k8s.updater.EventChecker;
import org.domeos.framework.engine.k8s.util.*;
import org.domeos.framework.engine.runtime.IResourceStatus;
import org.domeos.global.*;
import org.domeos.util.*;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;

import io.fabric8.kubernetes.api.model.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by jackfan on 17/2/27.
 */
@Service
public class LoadBalancerServiceImpl implements LoadBalancerService {
    
    @Autowired
    LoadBalancerBiz lbBiz;
    
    @Autowired
    LoadBalancerCollectionBiz lbcBiz;
    
    @Autowired
    CollectionBiz collectionBiz;
    
    @Autowired
    DeploymentBiz deploymentBiz;
    
    @Autowired
    VersionBiz versionBiz;
    
    @Autowired
    ClusterBiz clusterBiz;
    
    @Autowired
    UniqPortBiz uniqPortBiz;
    
    @Autowired
    OperationHistory operationHistory;
    
    @Autowired
    EventService eventService;
    
    @Autowired
    DeploymentStatusManager deploymentStatusManager;
    
    @Autowired
    DeployEventBiz deployEventBiz;
    
    @Autowired
    K8SEventBiz k8SEventBiz;
    
    @Autowired
    IResourceStatus resourceStatus;
    
    private static Logger logger = LoggerFactory.getLogger(LoadBalancerServiceImpl.class);
    private final ResourceType resourceType = ResourceType.LOADBALANCER;
    
    private void checkLoadBalancerPermit(int lbId, OperationType operationType) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, lbId, resourceType, operationType);
    }

    private void checkCreateLoadBalancerPermit(int lbcId, int clusterId) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, clusterId, ResourceType.CLUSTER, OperationType.MODIFY);
        AuthUtil.collectionVerify(userId, lbcId, ResourceType.LOADBALANCER_COLLECTION, OperationType.MODIFY, -1);
    }
    
    @Override
    public LoadBalancerDraft createLoadBalancer(LoadBalancerDraft lbDraft) throws Exception {
        if (lbDraft == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, "loadBalancer is null");
        }
        
        String error = lbDraft.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, error);
        }
        Cluster cluster = clusterBiz.getClusterById(lbDraft.getClusterId());
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lbDraft.getClusterId());
        }
        LoadBalancerCollection lbc = lbcBiz.getLoadBalancerCollection(lbDraft.getLbcId());
        if (lbc == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_COLLECTION_NOT_EXIST,
                    "loadBalancer collection " + lbDraft.getLbcId() + " not exist");
        }
        
        checkCreateLoadBalancerPermit(lbDraft.getLbcId(), lbDraft.getClusterId());
        
        //check name exist or not
        String lbName = lbDraft.getName();
        List<LoadBalancer> lbList = lbBiz.listLoadBalancerByName(lbName);
        if (lbList != null && lbList.size() != 0) {
            for (LoadBalancer lb : lbList) {
                if (lb.getType() == lbDraft.getType() && lb.getClusterId() == lbDraft.getClusterId() && 
                    lb.getNamespace().equals(lbDraft.getNamespace())) {
                    throw ApiException.wrapMessage(ResultStat.LOADBALANCER_EXIST, "loadBalancer name have been exist.");
                }
            }
        }
        List<String> ips = lbDraft.getExternalIPs();
        LoadBalancer lb = lbDraft.toLoadBalancer();
        
        LoadBalancerWrapper wrapper = new LoadBalancerWrapper().init(lbDraft.getClusterId(), lbDraft.getNamespace());
        //create proxy lb
        if (lbDraft.getType() != LoadBalancerType.NGINX) {
            List<Deployment> list = deploymentBiz.getListByName(GlobalConstant.DEPLOY_TABLE_NAME, lbName, Deployment.class);
            if (list != null && list.size() != 0) {
                for (Deployment one : list) {
                    if (one.getClusterId() == lbDraft.getClusterId() && one.getNamespace().equals(lbDraft.getNamespace())) {
                        throw ApiException.wrapMessage(ResultStat.LOADBALANCER_EXIST, "loadBalancer name have been exist.");
                    }
                }
            }
            if (wrapper.getLoadBalancerService(lb) != null) {
                throw ApiException.wrapMessage(ResultStat.LOADBALANCER_EXIST, "loadBalancer name have been exist.");
            }
            //check port used or not
            KubeServiceDraft serviceDraft = lbDraft.getServiceDraft();
            for (String ip : ips) {
                for (LoadBalancerPort lbPort : serviceDraft.getLbPorts()) {
                    int port = lbPort.getPort();
                    if (uniqPortBiz.getUniqPort(ip, port, lbDraft.getClusterId()) != null) {
                        throw ApiException.wrapMessage(ResultStat.LOADBALANCER_PORT_USED, "ip: "+ ip + " port: " + port + " has been used.");
                    }
                }
            }
            
            try {
                lbBiz.createLoadBalancer(lb);
                lbDraft.setId(lb.getId());
                wrapper.createLoadBalancerService(lb);
            } catch (LoadBalancerException e) {
                lbBiz.removeLoadBalancer(lb.getId());
                throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, e.getMessage());
            }
            
            //add used port
            for (String ip : ips) {
                for (LoadBalancerPort lbPort : serviceDraft.getLbPorts()) {
                    uniqPortBiz.insertUniqPort(new UniqPort(lbPort.getPort(), lb.getId(), lbDraft.getClusterId(), ip, System.currentTimeMillis()));
                }
            }
            lbBiz.createLinkDeploy(new DeployLoadBalancerMap(serviceDraft.getDeployId(), lb.getId(), System.currentTimeMillis()));
        } else {//create nignx lb
            NginxDraft nginxDraft = lbDraft.getNginxDraft();
            //check port used or not
            int port = nginxDraft.getListenPort();
            for (String ip : ips) {
                if (uniqPortBiz.getUniqPort(ip, port, lbDraft.getClusterId())  != null) {
                    throw ApiException.wrapMessage(ResultStat.LOADBALANCER_PORT_USED, "ip: "+ ip + " port: " + port + " has been used.");
                }
            }
            
            DeploymentDraft deploymentDraft = lbDraft.toDeploymentDraft(CommonUtil.fullUrl(cluster.getApi()));
            Deployment deployment = deploymentDraft.toDeployment();
            deployment.setState(DeploymentStatus.STOP.name());
            deploymentBiz.createDeployment(deployment);
            
            lb.getNginxDraft().setDeployIdForLB(deployment.getId());
            lbBiz.createLoadBalancer(lb);
            lbDraft.setId(lb.getId());
            deployment.setUsedLoadBalancer(lb.getId());
            deploymentBiz.update(deployment);
            
            LabelSelector selector = new LabelSelector();
            selector.setContent(GlobalConstant.LB_NODE_LABEL);
            selector.setName(GlobalConstant.WITH_NEWLB_PREFIX + deployment.getId() + "-" + lb.getName());
            if (deploymentDraft.getLabelSelectors() != null) {
                deploymentDraft.getLabelSelectors().add(selector);
            } else {
                deploymentDraft.setLabelSelectors(Arrays.asList(selector));
            }
            
            Version version = deploymentDraft.toVersion();
            version.setDeployId(deployment.getId());
            version.setCreateTime(deployment.getCreateTime());
            try {
                versionBiz.insertVersionWithLogCollect(version, cluster);
                if (nginxDraft.getRules() != null) {
                    //create ingress
                    wrapper.createIngress(lb);
                    for (ForwardingRule rule : nginxDraft.getRules()) {
                        Deployment linkDeploy = deploymentBiz.getDeployment(rule.getDeployId());
                        if (linkDeploy != null && linkDeploy.getState().equals(DeploymentStatus.RUNNING.name())) {
                            //add link delpoy
                            lbBiz.createLinkDeploy(new DeployLoadBalancerMap(rule.getDeployId(), lb.getId(), System.currentTimeMillis()));
                        }
                    }
                }
            } catch (Exception e) {
                lbBiz.removeLoadBalancer(lb.getId());
                deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployment.getId());
                versionBiz.removeById(GlobalConstant.VERSION_TABLE_NAME, version.getId());
                throw ApiException.wrapMessage(ResultStat.SERVER_INTERNAL_ERROR, e.getMessage());
            }
            
            //add used port
            for (String ip : ips) {
                uniqPortBiz.insertUniqPort(new UniqPort(nginxDraft.getListenPort(), lb.getId(), lbDraft.getClusterId(), ip, System.currentTimeMillis()));
            }
        }
        
        CollectionResourceMap resourceMap = new CollectionResourceMap(lb.getId(), 
                CurrentThreadInfo.getUserId(), 
                resourceType, 
                lbDraft.getLbcId(), 
                System.currentTimeMillis());
        collectionBiz.addResource(resourceMap);
        
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                resourceMap.getResourceId(),
                resourceType,
                OperationType.SET,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        
        logger.info("create loadBalancer succeed, lbId={}, creatorId={}, lbcId={}",
                lb.getId(), CurrentThreadInfo.getUserId(), lbDraft.getLbcId());
        return lbDraft;
    }

    @Override
    public void removeLoadBalancer(int lbId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.DELETE);
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "loadBalancer is not exist");
        }
        LoadBalancerWrapper wrapper = new LoadBalancerWrapper().init(lb.getClusterId(), lb.getNamespace());
       
        if(lb.getType() != LoadBalancerType.NGINX) {
            int deployId = lb.getServiceDraft().getDeployId();
            Deployment deploy = deploymentBiz.getDeployment(deployId);
            if (deploy != null && deploy.getName().equals(lb.getName())) {
                List<LoadBalancer> linkedlbs = lbBiz.getLoadBalancersByDeploy(deployId);
                if (linkedlbs != null) {
                    for (LoadBalancer linkedlb : linkedlbs) {
                        if (linkedlb.getType() == LoadBalancerType.NGINX && linkedlb.getNginxDraft() != null) {
                            for (ForwardingRule rule : linkedlb.getNginxDraft().getRules()) {
                                if (rule.getDeployId() == deployId) {
                                    throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_LOADBALANCER, 
                                    "need to remove linked deploy " + deploy.getName() + " from nginx lb " + linkedlb.getName());
                                }
                            }
                        }
                    }
                }
                lb.setExternalIPs(null);
                lb.setType(LoadBalancerType.INNER_SERVICE);
                KubeServiceDraft serviceDraft = lb.getServiceDraft();
                List<LoadBalancerPort> newLBPorts = new ArrayList<LoadBalancerPort>();
                if (serviceDraft != null && serviceDraft.getLbPorts() != null) {
                    Set<Integer> targetPorts = new HashSet<Integer>();
                    for (LoadBalancerPort oldLBPort : serviceDraft.getLbPorts()) {
                        targetPorts.add(oldLBPort.getTargetPort());
                    }
                    for (int targetPort : targetPorts) {
                        LoadBalancerPort newLBPort = new LoadBalancerPort();
                        newLBPort.setPort(targetPort);
                        newLBPort.setTargetPort(targetPort);
                        newLBPorts.add(newLBPort);
                    }
                    serviceDraft.setLbPorts(newLBPorts);
                }
                wrapper.deleteLoadBalancerService(lb);
                wrapper.createLoadBalancerService(lb);
                lbBiz.updateLoadBalancer(lb);
            } else {
                wrapper.deleteLoadBalancerService(lb);
                lbBiz.removeLoadBalancer(lbId);
                lbBiz.removeLinkDeployByLoadBalancerId(lbId);
            }
        } else {
            int deployId = lb.getNginxDraft().getDeployIdForLB();
            Deployment deploy = deploymentBiz.getDeployment(deployId);
            if (deploy == null || !deploy.getState().equals(DeploymentStatus.STOP.name())) {
                throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_LOADBALANCER, "loadBalancer status is not stop");
            }
            //delete node label of current versions
            NodeWrapper nodeWrapper = new NodeWrapper().init(lb.getClusterId(), lb.getNamespace());
            RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(lb.getClusterId());
            if (driver == null) {
                throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, " There is no RuntimeDriver for cluster whose id is " + lb.getClusterId());
            }
            List<Version> versions = versionBiz.getAllVersionByDeployId(deployId);
            if (versions != null && versions.size() != 0) {
                for (Version version : versions) {
                    for (String nodeIP : version.getHostList()) {
                        nodeWrapper.deleteNodeLabels(getNodeName(nodeIP, nodeWrapper), 
                                    Arrays.asList(GlobalConstant.WITH_NEWLB_PREFIX + deployId + "-" + lb.getName()));
                    }
                }
            }
            
            wrapper.deleteIngress(lb); 
            // about deploy
            deploymentBiz.removeById(GlobalConstant.DEPLOY_TABLE_NAME, deployId);
            versionBiz.disableAllVersion(deployId);
            eventService.deleteDeploymentEvent(lb.getClusterId(), deploy);
            lbBiz.removeLoadBalancer(lbId);
            lbBiz.removeLinkDeployByLoadBalancerId(lbId);
        }
        uniqPortBiz.removeUniqPortByLoadBalancerId(lbId);
        collectionBiz.deleteResourceByResourceIdAndResourceType(lbId, resourceType);
        operationHistory.insertRecord(new OperationRecord(
                lbId,
                resourceType,
                OperationType.DELETE,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        logger.info("delete loadBalancer succeed, lbId={}, userId={}", lbId, CurrentThreadInfo.getUserId());
    }
    
    @Override
    public void updateLoadBalancer(LoadBalancerDraft lbDraft) throws Exception {
        if (lbDraft == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, "loadBalancer is null");
        }
        checkLoadBalancerPermit(lbDraft.getId(), OperationType.MODIFY);
        
        if(lbDraft.getType() != LoadBalancerType.NGINX) {
            updateProxyLoadBalancer(lbDraft);
        } else {
            updateNginxLoadBalancer(lbDraft);
        }
        
        operationHistory.insertRecord(new OperationRecord(
                lbDraft.getId(),
                resourceType,
                OperationType.MODIFY,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        logger.info("update loadBalancer succeed, lbId={}, userId={}", lbDraft.getId(), CurrentThreadInfo.getUserId());
    }
    
    @Override
    public void updateLoadBalancerDescription(int lbId, String description) {
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "loadBalancer is not exist");
        }
        lb.setLastUpdateTime(System.currentTimeMillis());
        lb.setDescription(description);
        lbBiz.updateLoadBalancer(lb);
        operationHistory.insertRecord(new OperationRecord(
                lbId,
                resourceType,
                OperationType.MODIFY,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        logger.info("update loadBalancer succeed, lbId={}, userId={}", lbId, CurrentThreadInfo.getUserId());
    }
    
    @Override
    public List<LoadBalancerInfo> listLoadBalancer(int lbcId) throws Exception {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, lbcId, ResourceType.LOADBALANCER_COLLECTION, OperationType.GET);
        
        boolean deletable;
        try {
            AuthUtil.collectionVerify(userId, lbcId, ResourceType.LOADBALANCER_COLLECTION, OperationType.DELETE, -1);
            deletable = true;
        } catch (Exception ignore) {
            deletable = false;
        }
        Map<Integer, Boolean> deletableMap = new HashMap<>();
        deletableMap.put(lbcId, deletable);
        
        List<CollectionResourceMap> resourceMaps = collectionBiz.getResourcesByCollectionIdAndResourceType(lbcId, resourceType);
        return listLoadBalancer(resourceMaps, deletableMap);
    }
    
    @Override
    public List<LoadBalancerInfo> listLoadBalancer() throws Exception {
        int userId = CurrentThreadInfo.getUserId();
        List<CollectionAuthorityMap> authorityMaps = AuthUtil.getCollectionList(userId, ResourceType.LOADBALANCER_COLLECTION);
        Map<Integer, Boolean> deletableMap = new HashMap<>();
        boolean isAdmin = AuthUtil.isAdmin(userId);
        for (CollectionAuthorityMap authorityMap : authorityMaps) {
            if (isAdmin || authorityMap.getRole() == Role.MASTER) {
                deletableMap.put(authorityMap.getCollectionId(), true);
            } else {
                deletableMap.put(authorityMap.getCollectionId(), false);
            }
        }
        List<CollectionResourceMap> resources = collectionBiz.getResourcesByAuthorityMaps(ResourceType.LOADBALANCER, authorityMaps);
        return listLoadBalancer(resources, deletableMap);
    }
    
    private List<LoadBalancerInfo> listLoadBalancer(List<CollectionResourceMap> resourceMaps, Map<Integer, Boolean> deletableMap) throws IOException {
        if (resourceMaps == null || resourceMaps.size() == 0) {
            return new ArrayList<>(1);
        }
        int userId = AuthUtil.getUserId();
        List<LoadBalancerInfo> infos = null;
        List<GetLoadBalancerInfoTask> tasks = new LinkedList<GetLoadBalancerInfoTask>();
        for (CollectionResourceMap resourceMap : resourceMaps) {
            tasks.add(new GetLoadBalancerInfoTask(resourceMap, deletableMap, userId));
        }
        infos = ClientConfigure.executeCompletionService(tasks);
        Collections.sort(infos, new LoadBalancerInfo.LoadBalancerInfoComparator());
        return infos;
    }
    
    @Override
    public LoadBalancerDetail getLoadBalancer(int lbId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.GET);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "loadBalancer is not exist");
        }
        
        Cluster cluster = clusterBiz.getClusterById(lb.getClusterId());
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST,
                    "loadBalancer " + lb.getName() + " requires the cluster (clusterId: " + lb.getClusterId() + ") information");
        }
        
        LoadBalancerDetail lbDetail = new LoadBalancerDetail(lb);
        lbDetail.setClusterName(cluster.getName());
        if (lb.getType() == LoadBalancerType.NGINX) {
            NginxDetailDraft nginxDraft = new NginxDetailDraft();
            Deployment deployment = deploymentBiz.getDeployment(lb.getNginxDraft().getDeployIdForLB());
            if (deployment != null) {
                lbDetail.setState(deployment.getState());
            }
            //set linkedDeploy stat
            List<ForwardingRule> rules = lb.getNginxDraft().getRules();
            if (rules != null) {
                for (ForwardingRule rule : rules) {
                    Deployment linkDeploy = deploymentBiz.getDeployment(rule.getDeployId());
                    if (linkDeploy != null) {
                        rule.setDeployStatus(linkDeploy.getState());
                    } else {
                        rule.setDeployStatus(DeploymentStatus.DELETED.name());
                    }
                }
            }
            nginxDraft.setRules(rules);
            nginxDraft.setDeployIdForLB(lb.getNginxDraft().getDeployIdForLB());
            
            // set current replicas
            long currentReplicas;
            RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
            if (driver == null) {
                throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, " There is no RuntimeDriver for cluster(" + cluster.toString() + ").");
            }
            currentReplicas = driver.getTotalReplicasByDeployment(deployment);
            nginxDraft.setCurrentReplicas(currentReplicas);

            // get current versions
            List<Version> versions = driver.getCurrnetVersionsByDeployment(deployment);
            if (versions == null || versions.isEmpty()) {
                nginxDraft.setCurrentVersions(null);
            } else {
                List<NginxVersionDraft> versionDetails = new ArrayList<>(versions.size());
                for (Version version : versions) {
                    NginxVersionDraft versionDraft = new NginxVersionDraft(version);
                    versionDetails.add(versionDraft);
                }
                nginxDraft.setCurrentVersions(versionDetails);
            }
            lbDetail.setNginxDraft(nginxDraft);
        } else {
            KubeServiceDraft serviceDraft = lb.getServiceDraft();
            if (serviceDraft != null) {
                Deployment linkDeploy = deploymentBiz.getDeployment(serviceDraft.getDeployId());
                if (linkDeploy != null) {
                    serviceDraft.setDeployStatus(linkDeploy.getState());
                } else {
                    serviceDraft.setDeployStatus(DeploymentStatus.DELETED.name());
                }
            }
            lbDetail.setDnsName(CommonUtil.generateServiceDnsName(lb.getNamespace(), cluster.getDomain(), lb.getName()));
        }
        
        Role role = AuthUtil.getUserRoleInResource(resourceType, lbId, CurrentThreadInfo.getUserId());
        lbDetail.setRole(role);
        
        return lbDetail;
    }
    
    @Override
    public void startLoadBalancer(int lbId, int versionId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.VERSION_NOT_EXIST, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, lb.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lb.getClusterId());
        }
        
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + deployId);
        }
        
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        
        if (!isClusterWatcherOK(lb.getClusterId())) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_WATCHER_NOT_READY);
        }
        
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.DEPLOYING);
        //handle node label
        NodeWrapper nodeWrapper = new NodeWrapper().init(cluster, null);
        handleNodeLabels(version.getHostList(), lb, nodeWrapper);
        List<String> nodes = version.getHostList();
        if (nodes != null) {
            deployment.setDefaultReplicas(nodes.size());
        }
        
        lb.setState(DeploymentStatus.DEPLOYING.name());
        lb.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(DeploymentStatus.DEPLOYING.name());
        deployment.setLastUpdateTime(lb.getLastUpdateTime());
        
        lbBiz.updateLoadBalancer(lb);
        deploymentBiz.update(deployment);

        try {
            driver.startDeploy(deployment, version, CurrentThreadInfo.getUser(), null);
            // add operation record
            operationHistory.insertRecord(new OperationRecord(
                    lbId,
                    resourceType,
                    OperationType.START,
                    CurrentThreadInfo.getUserId(),
                    CurrentThreadInfo.getUserName(),
                    "OK",
                    "",
                    System.currentTimeMillis()
            ));
        } catch (DriverException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_START_FAILED, e.getMessage());
        }
        logger.info("start loadBalancer succeed, lbId={}, userId={}", lb.getId(), CurrentThreadInfo.getUserId());
    }

    @Override
    public void stopLoadBalancer(int lbId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + deployId);
        }
        
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, lb.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lb.getClusterId());
        }
        
        if (!isClusterWatcherOK(lb.getClusterId())) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_WATCHER_NOT_READY);
        }
        
        DeployEvent deployEvent = deployEventBiz.getNewestEventByDeployId(deployId);
        if (!deployEvent.eventTerminated() && deployEvent.getOperation() != DeployOperation.STOP) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, "Fail the current event");
        } else if (deployEvent.getOperation() == DeployOperation.STOP) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_STOP_FAILED, "You are already in stop status");
        }
        
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        try {
            deploymentBiz.updateState(GlobalConstant.DEPLOY_TABLE_NAME, DeploymentStatus.STOPPING.name(), deployId);
            lbBiz.updateState(GlobalConstant.LOADBALANCER_TABLE_NAME, DeploymentStatus.STOPPING.name(), lbId);
            driver.stopDeploy(deployment, CurrentThreadInfo.getUser());
            // add operation record
            operationHistory.insertRecord(new OperationRecord(
                    lbId,
                    resourceType,
                    OperationType.STOP,
                    CurrentThreadInfo.getUserId(),
                    CurrentThreadInfo.getUserName(),
                    "OK",
                    "",
                    System.currentTimeMillis()
            ));
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_STOP_FAILED, e.getMessage());
        }
        logger.info("stop loadBalancer succeed, lbId={}, userId={}", lb.getId(), CurrentThreadInfo.getUserId());
    }
    
    @Override
    public void abortLoadBalancerOperation(int lbId) throws Exception {
        //just can abort start operation
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + deployId);
        }
        
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, lb.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lb.getClusterId());
        }
        
        if (!isClusterWatcherOK(lb.getClusterId())) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_WATCHER_NOT_READY);
        }
        
        DeployEvent deployEvent = deployEventBiz.getNewestEventByDeployId(deployId);
        if (!deployEvent.eventTerminated() && deployEvent.getOperation() != DeployOperation.STOP) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, "Fail the current event");
        } else if (deployEvent.getOperation() == DeployOperation.STOP) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_STOP_FAILED, "You are already in stop status");
        }
        
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        
        driver.abortDeployOperation(deployment, CurrentThreadInfo.getUser());
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                lbId,
                resourceType,
                OperationType.ABORT,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        
        logger.info("abort loadBalancer succeed, lbId={}, userId={}", lb.getId(), CurrentThreadInfo.getUserId());
    }
    
    @Override
    public void startUpdate(int lbId, int versionId) throws Exception {
        //running stat
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        
        if (!isClusterWatcherOK(lb.getClusterId())) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_WATCHER_NOT_READY);
        }
        
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + deployId);
        }
        
        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.VERSION_NOT_EXIST, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, lb.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lb.getClusterId());
        }
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.UPDATING);
        
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        List<String> hosts = version.getHostList();
        NodeWrapper nodeWrapper = new NodeWrapper().init(cluster, null);
        if (hosts != null) {
            deployment.setDefaultReplicas(hosts.size());
        }
        
        try {
            driver.startUpdate(deployment, versionId, null, CurrentThreadInfo.getUser(), null);
            //handle node label
            handleNodeLabels(version.getHostList(), lb, nodeWrapper);
        } catch (DeploymentEventException e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_UPDATE_FAILED, e.getMessage());
        }
        
        lb.setLastUpdateTime(System.currentTimeMillis());
        lb.setState(DeploymentStatus.UPDATING.name());
        deployment.setLastUpdateTime(lb.getLastUpdateTime());
        deployment.setState(DeploymentStatus.UPDATING.name());
        deploymentBiz.update(deployment);
        lbBiz.updateLoadBalancer(lb);
        
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                lbId,
                resourceType,
                OperationType.UPDATE,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        logger.info("update loadBalancer succeed, lbId={}, userId={}", lb.getId(), CurrentThreadInfo.getUserId());
    }
    
    @Override
    public void startRollback(int lbId, int versionId) throws Exception {
        //running stat
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        
        if (!isClusterWatcherOK(lb.getClusterId())) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_WATCHER_NOT_READY);
        }
        
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + deployId);
        }
        
        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.VERSION_NOT_EXIST, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, lb.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lb.getClusterId());
        }
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), DeploymentStatus.BACKROLLING);
        
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        NodeWrapper nodeWrapper = new NodeWrapper().init(cluster, null);
        List<String> hosts = version.getHostList();
        if (hosts != null) {
            deployment.setDefaultReplicas(hosts.size());
        }
        
        try {
            driver.rollbackDeploy(deployment, versionId, null, CurrentThreadInfo.getUser(), null);
            //handle node label
            handleNodeLabels(version.getHostList(), lb, nodeWrapper);
        } catch (Exception e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_UPDATE_FAILED, e.getMessage());
        }
        
        lb.setLastUpdateTime(System.currentTimeMillis());
        lb.setState(DeploymentStatus.BACKROLLING.name());
        deployment.setLastUpdateTime(lb.getLastUpdateTime());
        deployment.setState(DeploymentStatus.BACKROLLING.name());
        deploymentBiz.update(deployment);
        lbBiz.updateLoadBalancer(lb);
        
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                lbId,
                resourceType,
                OperationType.ROLLBACK,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        logger.info("update loadBalancer succeed, lbId={}, userId={}", lb.getId(), CurrentThreadInfo.getUserId());
    }
    
    @Override
    public void scaleUpAndDown(int lbId, int versionId, List<NodeInfo> nodes) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        
        if (nodes == null || nodes.size() == 0) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "nodes list is blank");
        }
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        
        if (!isClusterWatcherOK(lb.getClusterId())) {
            throw ApiException.wrapResultStat(ResultStat.CLUSTER_WATCHER_NOT_READY);
        }
        
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + deployId);
        }
        
        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.VERSION_NOT_EXIST, "no such version:" + versionId);
        }

        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, lb.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lb.getClusterId());
        }
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(cluster.getId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster: " + cluster.toString());
        }
        
        DeploymentStatus deploymentStatus;
        OperationType operationType;
        List<String> nodeIPs = getNodeIPs(nodes);
        //check host port used or not
        int listenPort = getListenPort(version);
        for (String ip : nodeIPs) {
            UniqPort uniqPort = uniqPortBiz.getUniqPort(ip, listenPort, lb.getClusterId());
            if (uniqPort != null && uniqPort.getLoadBalancerId() != lb.getId()) {
                throw ApiException.wrapMessage(ResultStat.LOADBALANCER_PORT_USED, "ip: "+ ip + " port: " + listenPort + " has been used.");
            }
        }
        int checkresult = checkScale(nodeIPs, version);
        if (checkresult < 0) {
            deploymentStatus = DeploymentStatus.UPSCALING;
            operationType = OperationType.SCALEUP;
        } else if (checkresult > 0) {
            deploymentStatus = DeploymentStatus.DOWNSCALING;
            operationType = OperationType.SCALEDOWN;
        } else {
            return;
        }
        
        deploymentStatusManager.checkStateAvailable(DeploymentStatus.valueOf(deployment.getState()), deploymentStatus);
        if (nodes != null && nodes.size() != 0) {
            deployment.setDefaultReplicas(nodes.size());
        }
        
        try {
            if (deploymentStatus == DeploymentStatus.UPSCALING) {
                driver.scaleUpDeployment(deployment, versionId, deployment.getDefaultReplicas(), null, CurrentThreadInfo.getUser());
            } else {
                driver.scaleDownDeployment(deployment, versionId, deployment.getDefaultReplicas(), null, CurrentThreadInfo.getUser());
            }
            //handle node label
            NodeWrapper nodeWrapper = new NodeWrapper().init(cluster, null);
            handleNodeLabels(nodeIPs, lb, nodeWrapper);
        } catch (Exception e) {
            deploymentStatusManager.failedEventForDeployment(deployId, null, e.getMessage());
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_UPDATE_FAILED, e.getMessage());
        }
        
        //add used port
        for (String ip : nodeIPs) {
            UniqPort uniqPort = uniqPortBiz.getUniqPort(ip, listenPort, lb.getClusterId());
            if (uniqPort == null) {
                uniqPortBiz.insertUniqPort(new UniqPort(listenPort, lb.getId(), lb.getClusterId(), ip, System.currentTimeMillis()));
            }
        }
        
        lb.setState(deploymentStatus.name());
        lb.setLastUpdateTime(System.currentTimeMillis());
        deployment.setState(deploymentStatus.name());
        deployment.setLastUpdateTime(lb.getLastUpdateTime());
        version.setHostList(nodeIPs);
        versionBiz.updateVersion(version);
        
        lbBiz.updateLoadBalancer(lb);
        deploymentBiz.update(deployment);
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                lbId,
                resourceType,
                operationType,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
        
        logger.info("scale up or down loadBalancer succeed, lbId={}, userId={}", lb.getId(), CurrentThreadInfo.getUserId());
    }

    @Override
    public List<Instance> listLoadBalancerInstance(int lbId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.GET);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + deployId);
        }
        
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, lb.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lb.getClusterId());
        }
        
        Map<String, String> labels = new HashMap<>();
        labels.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        NodeWrapper nodeWrapper = new NodeWrapper().init(cluster.getId(), deployment.getNamespace());
        PodList podList = nodeWrapper.getPods(labels);
        List<Instance> instances = new ArrayList<>();
        if (podList != null && podList.getItems() != null) {
            for (Pod pod : podList.getItems()) {
                Instance instance = new Instance();
                instance.setDeloyId(deployId);
                instance.setDeployName(deployment.getName());
                instance.setNamespace(pod.getMetadata().getName());
                if (pod.getMetadata() != null) {
                    instance.setInstanceName(pod.getMetadata().getName());
                    if (pod.getMetadata().getLabels() != null && pod.getMetadata().getLabels().containsKey(GlobalConstant.VERSION_STR)) {
                        instance.setVersionId(Integer.valueOf(pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR)));
                    }
                }
                if (pod.getSpec() != null) {
                    instance.setHostName(pod.getSpec().getNodeName());
                }
                if (pod.getStatus() != null) {
                    instance.setStartTime(DateUtil.string2timestamp(pod.getStatus().getStartTime(), TimeZone.getTimeZone(GlobalConstant.UTC_TIME)));
                    instance.setPodIp(pod.getStatus().getPodIP());
                    instance.setHostIp(pod.getStatus().getHostIP());
                    if (pod.getStatus().getContainerStatuses() != null) {
                        for (ContainerStatus containerStatus : pod.getStatus().getContainerStatuses()) {
                            if (StringUtils.isBlank(containerStatus.getContainerID())) {
                                continue;
                            }
                            String containerId = containerStatus.getContainerID().split("docker://")[1];
                            instance.addContainer(new Container(containerId, containerStatus.getName(), containerStatus.getImage()));
                        }
                    }
                }
                instance.setStatus(PodUtils.getPodStatus(pod));
                instances.add(instance);
            }
        }
        return instances;
    }

    @Override
    public List<DeployEvent> listLoadBalancerEvent(int lbId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.GET);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + deployId);
        }
        
        Cluster cluster = clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, lb.getClusterId(), Cluster.class);
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "no such clusterId: " + lb.getClusterId());
        }
        
        List<DeployEvent> events = new LinkedList<>();
        List<DeployEvent> deployEvents = deployEventBiz.getEventByDeployId(deployId);
        if (deployEvents != null) {
            events.addAll(deployEvents);
        }

        List<Event> eventList = k8SEventBiz.getEventsByDeployId(deployment.getClusterId(), deployment.getId());
        List<EventInfo> eventInfos = k8SEventBiz.translateEvent(eventList);
        List<DeployEvent> transEvents = translateK8sEvents(deployId, eventInfos);
        if (transEvents != null) {
            events.addAll(transEvents);
        }

        // sort by startTime
        if (events.size() != 0) {
            Collections.sort(events, new Comparator<DeployEvent>() {
                @Override
                public int compare(DeployEvent o1, DeployEvent o2) {
                    return ((Long) o2.getStartTime()).compareTo(o1.getStartTime());
                }
            });
        }
        return events;
    }
    
    @Override
    public List<LinkedDeployDraft> listDeploy(int clusterId, String namespace, LoadBalancerType lbType) throws Exception {
        if (clusterId <= 0) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "clusterid is less than 0; ");
        }
        if (StringUtils.isBlank(namespace)) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "namespace is blank; ");
        }
        if (lbType == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "lbType is blank; ");
        }
        int userId = CurrentThreadInfo.getUserId();
        List<CollectionAuthorityMap> authorityMaps = AuthUtil.getCollectionList(userId, ResourceType.DEPLOY_COLLECTION);
        List<CollectionResourceMap> resources = collectionBiz.getResourcesByAuthorityMaps(ResourceType.DEPLOY, authorityMaps);
        
        List<LinkedDeployDraft> deploys = new ArrayList<>();
        if (resources == null || resources.size() == 0) {
            return deploys;
        }
        List<GetLinkedDeploymentTask> deployTasks = new LinkedList<>();
        for (CollectionResourceMap resourceMap : resources) {
            deployTasks.add(new GetLinkedDeploymentTask(resourceMap, clusterId, namespace, lbType, userId));
        }
        deploys = ClientConfigure.executeCompletionService(deployTasks);
        return deploys;
    }
    
    @Override
    public void deletePodByLbIdAndInsName(int lbId, String insName) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "no such loadBalancer:" + lbId);
        }
        Deployment deployment = deploymentBiz.getDeployment(lb.getNginxDraft().getDeployIdForLB());
        if (deployment == null) {
            throw ApiException.wrapMessage(ResultStat.DEPLOYMENT_NOT_EXIST, "no such deployment:" + lb.getNginxDraft().getDeployIdForLB());
        }
        if (StringUtils.isBlank(insName)) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_INSTANCE, "instanceName is null");
        }
        
        RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(lb.getClusterId());
        if (driver == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster id: " + lb.getClusterId());
        }
        boolean deletedPod = false;
        try {
            Map<String, String> labels = new HashMap<>();
            labels.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(lb.getNginxDraft().getDeployIdForLB()));
            NodeWrapper nodeWrapper = new NodeWrapper().init(lb.getClusterId(), lb.getNamespace());
            PodList podList = nodeWrapper.getPods(labels);
            List<String> statusList = Arrays.asList("Pending", "Terminating", "ContainerCreating");
            if (podList != null && podList.getItems() != null) {
                for (Pod pod : podList.getItems()) {
                    ObjectMeta meta = pod.getMetadata();
                    if (meta != null && meta.getName().equals(insName) && !statusList.contains(PodUtils.getPodStatus(pod))) {
                        driver.deletePodByDeployIdAndInsName(deployment, insName);
                        deletedPod = true;
                    }
                }
            }
        } catch (DeploymentEventException | K8sDriverException e) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_INSTANCE, e.getMessage());
        }
        if (!deletedPod) {
            throw ApiException.wrapMessage(ResultStat.CANNOT_DELETE_INSTANCE, "instance seem not in the deploy");
        }
        // add operation record
        operationHistory.insertRecord(new OperationRecord(
                lbId,
                resourceType,
                OperationType.DELETEINSTANCE,
                CurrentThreadInfo.getUserId(),
                CurrentThreadInfo.getUserName(),
                "OK",
                "",
                System.currentTimeMillis()
        ));
    }
    
    public void updateProxyLoadBalancer(LoadBalancerDraft lbDraft) throws Exception {
        LoadBalancer lb = lbBiz.getLoadBalancer(lbDraft.getId());
        if (lb == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "loadBalancer is not exist");
        }
        String error = lbDraft.checkLegality();
        if (!StringUtils.isBlank(error)) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, error);
        }
        LoadBalancerWrapper wrapper = new LoadBalancerWrapper().init(lb.getClusterId(), lb.getNamespace());
        LoadBalancer newLB = lbDraft.toLoadBalancer();
        // check port is used or not
        KubeServiceDraft serviceDraft = lbDraft.getServiceDraft();
        for (String ip : lbDraft.getExternalIPs()) {
            for (LoadBalancerPort lbPort : serviceDraft.getLbPorts()) {
                int port = lbPort.getPort();
                UniqPort uniqPort = uniqPortBiz.getUniqPort(ip, port, lbDraft.getClusterId());
                if (uniqPort != null && uniqPort.getLoadBalancerId() != lbDraft.getId()) {
                    throw ApiException.wrapMessage(ResultStat.LOADBALANCER_PORT_USED, "ip: " + ip + " port: " + port + " has been used.");
                }
            }
        }

        wrapper.updateLoadBalanceService(newLB);
        lbBiz.updateLoadBalancer(newLB);
        // handle linkMap
        if (lbDraft.getServiceDraft().getDeployId() != lb.getServiceDraft().getDeployId()) {
            lbBiz.updateLinkDeploy(new DeployLoadBalancerMap(lbDraft.getServiceDraft().getDeployId(), lbDraft.getId(), System.currentTimeMillis()));
        }
        // handle uniq port
        uniqPortBiz.removeUniqPortByLoadBalancerId(lbDraft.getId());
        for (String ip : lbDraft.getExternalIPs()) {
            for (LoadBalancerPort lbPort : serviceDraft.getLbPorts()) {
                uniqPortBiz.insertUniqPort(new UniqPort(lbPort.getPort(), lbDraft.getId(), lbDraft.getClusterId(), ip, System.currentTimeMillis()));
            }
        }
    }
    
    public void updateNginxLoadBalancer(LoadBalancerDraft lbDraft) throws Exception {
        LoadBalancer lb = lbBiz.getLoadBalancer(lbDraft.getId());
        if (lb == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "loadBalancer is not exist");
        }
        NginxDraft nginxDraft = lbDraft.getNginxDraft();
        if(nginxDraft  == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, "loadBalancer's nginxDraft is blank");
        }
        List<ForwardingRule> rules = nginxDraft.getRules();
        LoadBalancerWrapper wrapper = new LoadBalancerWrapper().init(lb.getClusterId(), lb.getNamespace());
        if (rules == null || rules.size() == 0) {
            lb.getNginxDraft().setRules(rules);
            wrapper.deleteIngress(lb);
            //handle linkMap
            lbBiz.removeLinkDeployByLoadBalancerId(lb.getId());
        } else {
            Set<String> set = new HashSet<String>();
            for (ForwardingRule rule : rules) {
                String error = rule.checkLegality();
                if (!StringUtils.isBlank(error)) {
                    throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, error);
                }
                set.add(rule.getDomain());
            }
            if (set.size() != rules.size()) {
                throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, "domain must be set different; ");
            }
            lb.getNginxDraft().setRules(rules);
            wrapper.updateIngress(lb);
            
            //handle linkMap
            lbBiz.removeLinkDeployByLoadBalancerId(lb.getId());
            for (ForwardingRule rule : rules) {
                Deployment linkDeploy = deploymentBiz.getDeployment(rule.getDeployId());
                if (linkDeploy != null && linkDeploy.getState().equals(DeploymentStatus.RUNNING.name())) {
                    //add link delpoy
                    lbBiz.createLinkDeploy(new DeployLoadBalancerMap(rule.getDeployId(), lb.getId(), System.currentTimeMillis()));
                }
            }
        }
        lb.setLastUpdateTime(System.currentTimeMillis());
        lbBiz.updateLoadBalancer(lb);
    }
    
    private class GetLinkedDeploymentTask implements Callable<LinkedDeployDraft> {
        CollectionResourceMap collectionResourceMap;
        int clusterId;
        String namespace;
        LoadBalancerType lbType;
        int userId;
        private GetLinkedDeploymentTask(CollectionResourceMap collectionResourceMap, int clusterId, 
                                        String namespace, LoadBalancerType lbType, int userId) {
            this.collectionResourceMap = collectionResourceMap;
            this.clusterId = clusterId;
            this.namespace = namespace;
            this.lbType = lbType;
            this.userId = userId;
        }

        @Override
        public LinkedDeployDraft call() throws Exception {
            int resourceId = collectionResourceMap.getResourceId();
            try {
                AuthUtil.verify(this.userId, resourceId, ResourceType.DEPLOY, OperationType.MODIFY);
            } catch (Exception e) {
                return null;
            }
            Deployment deployment = deploymentBiz.getDeployment(collectionResourceMap.getResourceId());
            if (deployment == null ||  deployment.getNetworkMode() == NetworkMode.HOST) {
                return null;
            }
            if (deployment.getClusterId() == this.clusterId && deployment.getNamespace().equals(this.namespace)) {
                if (lbType != LoadBalancerType.NGINX) {
                    return new LinkedDeployDraft(deployment.getId(), deployment.getName(), deployment.getState());
                }
                if (lbType == LoadBalancerType.NGINX && deployment.getState().equals(DeploymentStatus.RUNNING.name())) {
                    List<LoadBalancer> lbs = lbBiz.getInnerAndExternalLoadBalancerByDeployId(deployment.getId());
                    if (lbs != null) {
                        for (LoadBalancer lb : lbs) {
                            if (lb.getName().equals(deployment.getName())) {
                                KubeServiceDraft serviceDraft = lb.getServiceDraft();
                                if (serviceDraft != null) {
                                    List<LoadBalancerPort> lbPorts= serviceDraft.getLbPorts();
                                    List<Integer> ports = new ArrayList<Integer>();
                                    for (LoadBalancerPort port : lbPorts) {
                                        ports.add(port.getPort());
                                    }
                                    return new LinkedDeployDraft(deployment.getId(), deployment.getName(), deployment.getState(), 
                                            GlobalConstant.RC_NAME_PREFIX + deployment.getName(), ports);
                                }
                            }
                        }
                    }
                }
            }
            return null;
        }
    }
    
    private class GetLoadBalancerInfoTask implements Callable<LoadBalancerInfo> {
        CollectionResourceMap resourceMap;
        Map<Integer, Boolean> deletableMap;
        int userId;

        private GetLoadBalancerInfoTask(CollectionResourceMap resourceMap, Map<Integer, Boolean> deletableMap, int userId) {
            this.resourceMap = resourceMap;
            this.deletableMap = deletableMap;
            this.userId = userId;
        }

        @Override
        public LoadBalancerInfo call() throws Exception {
            LoadBalancer lb = lbBiz.getLoadBalancer(resourceMap.getResourceId());
            if (lb == null) {
                return null;
            }
            Cluster cluster = clusterBiz.getClusterById(lb.getClusterId());
            if (cluster == null) {
                throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST,
                        "loadBalancer " + lb.getName() + " requires the cluster (clusterId: " + lb.getClusterId() + ") information");
            }
            LoadBalancerInfo lbInfo = new LoadBalancerInfo(lb, cluster);
            if (lb.getType() == LoadBalancerType.NGINX) {
                Deployment deployment = deploymentBiz.getDeployment(lb.getNginxDraft().getDeployIdForLB());
                if (deployment != null) {
                    lbInfo.setState(deployment.getState());
                    DeployResourceStatus deployResourceStatus = resourceStatus.getDeployResourceStatusById(deployment.getId());
                    if (deployResourceStatus != null) {
                        lbInfo.setCpuTotal(deployResourceStatus.getCpuTotal());
                        lbInfo.setCpuUsed(deployResourceStatus.getCpuUsed());
                        lbInfo.setMemoryTotal(deployResourceStatus.getMemTotal());
                        lbInfo.setMemoryUsed(deployResourceStatus.getMemUsed());
                    }
                }
            }
            boolean deletable = deletableMap.get(resourceMap.getCollectionId()) || userId == resourceMap.getCreatorId();
            lbInfo.setDeletable(deletable);
            return lbInfo;
        }
    }
    
    private int checkScale(List<String> nodes, Version version) {
        List<String> hostList = version.getHostList();
        if (nodes == null || nodes.size() == 0 || hostList == null) {
            return 0;
        } else {
            int result = hostList.size() - nodes.size();
            if (result > 0 ) {
                return 1;
            } else if (result < 0) {
                return -1;
            } else if (compareNodes(hostList, nodes)) {
                return 0;
            } else {
                return 1;
            }
        }
    }
    
    private boolean compareNodes(List<String> currentNodes, List<String> targetNodes) {
        for (String currentNode : currentNodes) {
            for (String targetNode : targetNodes) {
                if (!currentNode.equals(targetNode)) {
                    return false;
                }
            }
        }
        return true;
    }
    
    public void handleNodeLabels(List<String> targetNodes, LoadBalancer lb, NodeWrapper wrapper) throws Exception {
        NginxDraft nginx = lb.getNginxDraft();
        if (targetNodes != null && nginx != null) {
            Map<String, String> labelMap = new K8sLabel(GlobalConstant.WITH_NEWLB_PREFIX + nginx.getDeployIdForLB() + "-" + lb.getName(), 
            GlobalConstant.LB_NODE_LABEL);
            List<NodeInfo> nodeInfos = wrapper.getNodeListByLabel(labelMap);
            for (String nodeIp : targetNodes) {
                boolean exist = false;
                if (nodeInfos != null) {
                    for (NodeInfo nodeInfo : nodeInfos) {
                        if (nodeIp.equals(nodeInfo.getIp())) {
                            exist = true;
                            break;
                        }
                    }
                }
                if (!exist) {
                    String nodeName = getNodeName(nodeIp, wrapper);
                    if (!StringUtils.isBlank(nodeName)) {
                        wrapper.setNodeLabels(nodeName, labelMap);
                    }
                }
            }
            
            if (nodeInfos != null) {
                for (NodeInfo nodeInfo : nodeInfos) {
                    boolean exist = false;
                    for (String nodeIp : targetNodes) {
                        if (nodeInfo.getIp().equals(nodeIp)) {
                            exist = true;
                            break;
                        }
                    }
                    if (!exist) {
                        wrapper.deleteNodeLabels(nodeInfo.getName(), 
                                Arrays.asList(GlobalConstant.WITH_NEWLB_PREFIX + nginx.getDeployIdForLB() + "-" + lb.getName()));
                    }
                }
            }
        }
    }
    
    private List<DeployEvent> translateK8sEvents(int deployId, List<EventInfo> eventInfos) {
        List<DeployEvent> deployEvents = new LinkedList<>();
        int i = 0;
        for (EventInfo eventInfo : eventInfos) {
            deployEvents.add(translateK8sEvent(deployId, eventInfo));
            i++;
            // at most 20 events
            if (i >= 20) {
                break;
            }
        }
        return deployEvents;
    }

    private DeployEvent translateK8sEvent(int deployId, EventInfo eventInfo) {
        DeployEvent deployEvent = new DeployEvent();
        deployEvent.setDeployId(deployId);
        deployEvent.setLastModify(eventInfo.getLastTS());
        String message = String.format("reason:%s, count:%d, message:%s", eventInfo.getReason(), eventInfo.getCount(), eventInfo.getMessage());
        deployEvent.setMessage(message);
        deployEvent.setStartTime(eventInfo.getLastTS());
        deployEvent.setOperation(DeployOperation.KUBERNETES);
        deployEvent.setUserName("system");
        return deployEvent;
    }
    
    private boolean isClusterWatcherOK(int clusterId) {
        ClusterWatcherDeployMap watcherDeployMap = clusterBiz.getWacherDeployMapByClusterId(clusterId);
        if (watcherDeployMap == null) {
            return false;
        }
        Deployment deployment = deploymentBiz.getDeployment(watcherDeployMap.getDeployId());
        if (!deployment.deployTerminated()) {
            try {
                DeployEvent event = deployEventBiz.getNewestEventByDeployId(watcherDeployMap.getDeployId());
                EventChecker eventChecker = new EventChecker(deployment, event);
                eventChecker.checkEvent();
                deployment = deploymentBiz.getDeployment(watcherDeployMap.getDeployId());
            } catch (IOException e) {
                logger.warn("get newest event by deploy id error, deployId=" + watcherDeployMap.getDeployId() + ", message: " + e.getMessage());
            } catch (DataBaseContentException e) {
                logger.warn("event or deploy is null, deployId=" + watcherDeployMap.getDeployId());
            }
        }
        return DeploymentStatus.RUNNING.name().equals(deployment.getState());
    }
    
    private List<String> getNodeIPs(List<NodeInfo> infos) {
        List<String> nodeIPs = new ArrayList<String>();
        for (NodeInfo info : infos) {
            nodeIPs.add(info.getIp());
        }
        return nodeIPs;
    }
    
    private int getListenPort(Version version) {
        List<ContainerDraft> containers = version.getContainerDrafts();
        if (containers != null) {
            ContainerDraft container = containers.get(0);
            if (container != null && container.getEnvs() != null) {
                for (EnvDraft env : container.getEnvs()) {
                    if (env.getKey().equals("LISTENPORT")) {
                        return Integer.parseInt(env.getValue());
                    }
                }
            }
        }
        return 80;
    }
    
    private String getNodeName(String nodeIp, NodeWrapper wrapper) {
        List<NodeInfo> nodeInfos = wrapper.getNodeListByClusterId();
        if (nodeInfos != null && !StringUtils.isBlank(nodeIp)) {
            for (NodeInfo info : nodeInfos) {
                if (nodeIp.equals(info.getIp())) {
                    return info.getName();
                }
            }
        }
        return null;
    }

}
