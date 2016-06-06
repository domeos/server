package org.domeos.framework.api.service.event.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.api.service.event.EventService;
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
@Service("eventService")
public class EventServiceImpl implements EventService{

    private static Logger logger = LoggerFactory.getLogger(EventServiceImpl.class);

    @Autowired
    K8SEventBiz k8SEventBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    private static Pattern deployNamePattern = Pattern.compile("dmo-(.+)-v[0-9]+-");

    private ConcurrentHashMap<String, Integer> deployNameIdMap = new ConcurrentHashMap<>();

    @Override
    public void createEvent(int clusterId, Event event) throws IOException {
        k8SEventBiz.createEvent(clusterId, getDeployIdByEvent(clusterId, event), event);
    }

    @Override
    public int getDeployIdByEvent(int clusterId, Event event) {
        String eventName = event.getMetadata().getName();
        String namspace = event.getMetadata().getNamespace();
        if (eventName != null) {
            Matcher matcher = deployNamePattern.matcher(eventName);
            if (matcher.find()) {
                String deployName = matcher.group(1);
                String key = buildCacheKey(clusterId, namspace, deployName);
                Integer deployId = deployNameIdMap.get(key);
                if (deployId != null) {
                    return deployId;
                }
                List<Deployment> deployments = deploymentBiz.getDeployment(clusterId, deployName);
                if (deployments != null && deployments.size() > 0) {
                    for (Deployment deployment : deployments) {
                        if (namspace.equals(deployment.getNamespace())) {
                            deployNameIdMap.putIfAbsent(key, deployment.getId());
                            return deployment.getId();
                        }
                    }
                }
            }
        }
        return -1;
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

}
