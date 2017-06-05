package org.domeos.framework.api.service.event.impl;

import io.fabric8.kubernetes.api.model.Event;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.api.model.event.ReportEvent;
import org.domeos.framework.api.service.event.EventService;
import org.domeos.framework.engine.event.DMEventSender;
import org.domeos.framework.engine.event.k8sEvent.K8SEventReceivedEvent;
import org.domeos.framework.engine.event.k8sEvent.K8sEventDetail;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by xupeng on 16-3-29.
 */
@Service
public class EventServiceImpl implements EventService{

    private static Logger logger = LoggerFactory.getLogger(EventServiceImpl.class);

    @Autowired
    K8SEventBiz k8SEventBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    ClusterBiz clusterBiz;

    // for deploy rc, daemon set, pet set
    private static Pattern deployNamePattern = Pattern.compile("dmo-(.+)-v[0-9]+[-\\.]");

    // for deploy rc, daemon set, pet set
    private static Pattern rcNamePattern = Pattern.compile("dmo-(.+)-rc+[-\\.]");

    // for deploy deployment(k8s)
    private static Pattern k8sDeploymentNamePattern = Pattern.compile("dmo-(.+)-(deploy)+[-\\.]");

    private ConcurrentHashMap<String, Integer> deployNameIdMap = new ConcurrentHashMap<>();

    @Override
    public void createEvent(int clusterId, Event event) throws IOException {
        K8sEventDetail detail = getDeployIdByEvent(clusterId, event);
        int deployId = -1;
        if (detail != null) {
            deployId = detail.getDeployId();
        }
        k8SEventBiz.createEvent(clusterId, deployId, event);
    }

    @Override
    public K8sEventDetail getDeployIdByEvent(int clusterId, Event event) {
        String eventName = event.getMetadata().getName();
        String namespace = event.getMetadata().getNamespace();
        if (eventName != null) {
            Matcher matcher = deployNamePattern.matcher(eventName);
            Matcher rcMatcher = rcNamePattern.matcher(eventName);
            Matcher k8sDeploymentMatcher = k8sDeploymentNamePattern.matcher(eventName);
            String deployName = null;
            if (matcher.find()) {
                deployName = matcher.group(1);
            } else if (k8sDeploymentMatcher.find()) {
                deployName = k8sDeploymentMatcher.group(1);
            } else if (rcMatcher.find()) {
                deployName = rcMatcher.group(1);
            }
            if (deployName != null) {
                String key = buildCacheKey(clusterId, namespace, deployName);
                Integer deployId = deployNameIdMap.get(key);
                if (deployId != null) {
                    return new K8sEventDetail(event, deployId, clusterId);
                }
                List<Deployment> deployments = deploymentBiz.getDeployment(clusterId, deployName);
                if (deployments != null && deployments.size() > 0) {
                    for (Deployment deployment : deployments) {
                        if (namespace.equals(deployment.getNamespace())) {
                            deployNameIdMap.putIfAbsent(key, deployment.getId());
                            return new K8sEventDetail(event, deployment.getId(), clusterId);
                        }
                    }
                }
            }
        }
        return null;
    }

    private String buildCacheKey(int clusterId, String namespace, String deployName) {
        return String.valueOf(clusterId) + ":" + namespace + ":" + deployName;
    }

    @Override
    public void deleteDeploymentEvent(int clusterId, Deployment deployment) {
        deployNameIdMap.put(buildCacheKey(clusterId, deployment.getNamespace(), deployment.getName()), -1);
        k8SEventBiz.clearDeployEvents(clusterId, deployment.getId());
        deployNameIdMap.remove(buildCacheKey(clusterId, deployment.getNamespace(), deployment.getName()));
    }

    @Override
    public HttpResponseTemp<List<Event>> getEventsByHost(String host) throws IOException {
        return ResultStat.OK.wrap(k8SEventBiz.getEventsByHost(host));
    }

    @Override
    public HttpResponseTemp<List<Event>> getEventsByNamespace(int clusterId, String namespace) throws IOException {
        return ResultStat.OK.wrap(k8SEventBiz.getEventsByNamespace(clusterId, namespace));
    }

    @Override
    public HttpResponseTemp<List<Event>> getEventsByKindAndNamespace(int clusterId, String namespace, EventKind kind) throws IOException {
        return ResultStat.OK.wrap(k8SEventBiz.getEventsByKindAndNamespace(clusterId, namespace, kind));
    }

    @Override
    public HttpResponseTemp<List<EventInfo>> getEventsByDeployId(int deployId) throws IOException {
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        if (deployment != null) {
            List<Event> events = k8SEventBiz.getEventsByDeployId(deployment.getClusterId(), deployId);
            return ResultStat.OK.wrap(k8SEventBiz.translateEvent(events));
        }
        return ResultStat.DEPLOYMENT_NOT_EXIST.wrap(null);
    }

    @Override
    public HttpResponseTemp<?> reportEvent(ReportEvent reportEvent) {
        if (reportEvent == null) {
            return ResultStat.OK.wrap(null);
        }
        int clusterId = reportEvent.getClusterId();
        Event event = reportEvent.getK8sEvent();

        if (clusterBiz.getById(GlobalConstant.CLUSTER_TABLE_NAME, clusterId, Cluster.class) == null) {
            return ResultStat.OK.wrap(null);
        }

        K8sEventDetail details = getDeployIdByEvent(clusterId, event);
        if (details == null || details.getDeployId() <= 0 || details.getClusterId() <= 0) {
            return ResultStat.OK.wrap(null);
        }
        DMEventSender.publishEvent(new K8SEventReceivedEvent(details));
        try {
            createEvent(clusterId, reportEvent.getK8sEvent());
        } catch (IOException e) {
            logger.warn("exception happened when create k8sevent into database, detail:" + e.getMessage(), e);
        }
        if (logger.isDebugEnabled()) {
            logger.debug("insert event name:{}, kind:{}, reason:{}, version:{}",
                    event.getMetadata().getName(), event.getInvolvedObject().getKind(),
                    event.getReason(), event.getMetadata().getResourceVersion());
        }
        return ResultStat.OK.wrap(null);
    }

}
