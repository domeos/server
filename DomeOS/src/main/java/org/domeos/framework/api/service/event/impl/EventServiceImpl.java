package org.domeos.framework.api.service.event.impl;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.api.service.event.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

/**
 * Created by xupeng on 16-3-29.
 */
@Service("eventService")
public class EventServiceImpl implements EventService{

    @Autowired
    K8SEventBiz k8SEventBiz;

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
    public HttpResponseTemp<List<EventInfo>> getEventsByDeployName(int clusterId, String deployName) throws IOException {
        List<Event> events = k8SEventBiz.getEventsByDeployName(clusterId, deployName);
        return ResultStat.OK.wrap(k8SEventBiz.translateEvent(events));
    }

}
