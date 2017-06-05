package org.domeos.framework.api.service.loadBalancer.impl;

import java.util.*;

import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerBiz;
import org.domeos.framework.api.biz.loadBalancer.UniqPortBiz;
import org.domeos.framework.api.consolemodel.deployment.VersionInfo;
import org.domeos.framework.api.consolemodel.loadBalancer.NginxVersionDraft;
import org.domeos.framework.api.controller.exception.ApiException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.UniqPort;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.service.loadBalancer.LoadBalancerVersionService;
import org.domeos.framework.engine.*;
import org.domeos.global.CurrentThreadInfo;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;
import org.domeos.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by jackfan on 17/3/6.
 */
@Service
public class LoadBalancerVersionServiceImpl implements LoadBalancerVersionService {
    @Autowired
    VersionBiz versionBiz;
    
    @Autowired
    LoadBalancerBiz lbBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    ClusterBiz clusterBiz;
    
    @Autowired
    UniqPortBiz uniqPortBiz;
    
    private static Logger logger = LoggerFactory.getLogger(LoadBalancerServiceImpl.class);
    private final ResourceType resourceType = ResourceType.LOADBALANCER;
    
    private void checkLoadBalancerPermit(int lbId, OperationType operationType) {
        int userId = CurrentThreadInfo.getUserId();
        AuthUtil.verify(userId, lbId, resourceType, operationType);
    }
    
    @Override
    public NginxVersionDraft createVersion(NginxVersionDraft versionDraft, int lbId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.MODIFY);
        if (versionDraft == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, "nginx version is null");
        }
        String versionLegality = versionDraft.checkLegality();
        if (!StringUtils.isBlank(versionLegality)) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_LEGAL, versionLegality);
        }
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "loadBalancer is not exist");
        }
        Cluster cluster = clusterBiz.getClusterById(lb.getClusterId());
        if (cluster == null) {
            throw ApiException.wrapMessage(ResultStat.CLUSTER_NOT_EXIST, "cluster is not exist");
        }
        
        //check host port used or not
        int listenPort = versionDraft.getListenPort();
        for (String ip : versionDraft.getExternalIPs()) {
            UniqPort uniqPort = uniqPortBiz.getUniqPort(ip, listenPort, lb.getClusterId());
            if (uniqPort != null && uniqPort.getLoadBalancerId() != lb.getId()) {
                throw ApiException.wrapMessage(ResultStat.LOADBALANCER_PORT_USED, "ip: "+ ip + " port: " + listenPort + " has been used.");
            }
        }
        
        Version version = versionDraft.toVersion(CommonUtil.fullUrl(cluster.getApi()), lb);
        try {
            versionDraft.setVersion(versionBiz.insertVersionWithLogCollect(version, cluster));
            versionDraft.setId(version.getId());
        } catch (Exception e) {
            versionBiz.removeById(GlobalConstant.VERSION_TABLE_NAME, version.getId());
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, e.getMessage());
        }
        
        //add used port
        for (String ip : versionDraft.getExternalIPs()) {
            UniqPort uniqPort = uniqPortBiz.getUniqPort(ip, listenPort, lb.getClusterId());
            if (uniqPort == null) {
                uniqPortBiz.insertUniqPort(new UniqPort(listenPort, lb.getId(), lb.getClusterId(), ip, System.currentTimeMillis()));
            }
        }
        
        logger.info("create loadBalancer version succeed, lbId={}, creatorId={}, versionId={}",
                lbId, CurrentThreadInfo.getUserId(), version.getId());
        return versionDraft;
    }

    @Override
    public NginxVersionDraft getVersionByLbIdAndVersionId(int lbId, int versionId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.GET);
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "loadBalancer is not exist");
        }
        int deployId = lb.getNginxDraft().getDeployIdForLB();
        Version version = versionBiz.getVersion(deployId, versionId);
        if (version == null) {
            throw ApiException.wrapMessage(ResultStat.VERSION_NOT_EXIST, "cluster is not exist");
        }
         
        return new NginxVersionDraft(version);
    }
    
    @Override
    public List<VersionInfo> listVersionByLbId(int lbId) throws Exception {
        checkLoadBalancerPermit(lbId, OperationType.GET);
        LoadBalancer lb = lbBiz.getLoadBalancer(lbId);
        if (lb == null || lb.getNginxDraft() == null) {
            throw ApiException.wrapMessage(ResultStat.LOADBALANCER_NOT_EXIST, "loadBalancer is not exist");
        }
        
        List<Version> versions = versionBiz.getAllVersionByDeployId(lb.getNginxDraft().getDeployIdForLB());
        if (versions == null) {
            throw ApiException.wrapMessage(ResultStat.PARAM_ERROR, "does not have version for deploy " + lb.getNginxDraft().getDeployIdForLB());
        }
        List<VersionInfo> versionInfos = new ArrayList<>(versions.size());
        for (Version version : versions) {
            VersionInfo versionInfo = new VersionInfo(version);
            versionInfos.add(versionInfo);
        }
        Collections.sort(versionInfos, new Comparator<VersionInfo>() {
            @Override
            public int compare(VersionInfo o1, VersionInfo o2) {
                return ((Long) o2.getVersion()).compareTo(o1.getVersion());
            }
        });

        return versionInfos;
    }
}
