package org.domeos.framework.api.biz.event.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.fabric8.kubernetes.api.model.Event;
import io.fabric8.kubernetes.api.model.ObjectReference;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.mapper.domeos.event.EventMapper;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.api.model.event.releated.EventDBProto;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;


/**
 * Created by xupeng on 16-3-28.
 */
@Service("k8sEventBiz")
public class K8SEventBizImpl implements K8SEventBiz {

    @Autowired
    EventMapper eventMapper;

    @Autowired
    CustomObjectMapper objectMapper;

    @Override
    public void createEvent(int clusterId, int deployId, Event event) throws IOException {
        EventDBProto proto = toProto(event, clusterId, deployId);
        eventMapper.createEvent(proto);
    }

    @Override
    public String getLatestResourceVersion(int clusterId) {
        return eventMapper.getNewestResourceVersion(clusterId);
    }

    @Override
    public List<Event> getEventsByHost(String host) throws IOException {
        List<EventDBProto> protos = eventMapper.getEventsByHost(host);
        List<Event> events = new LinkedList<>();
        for (EventDBProto proto : protos) {
            events.add(toEvent(proto));
        }
        return postProcess(events);
    }

    @Override
    public List<Event> getEventsByNamespace(int clusterId, String ns) throws IOException {
        List<EventDBProto> protos = eventMapper.getEventsByNamespace(clusterId, ns);
        List<Event> events = new LinkedList<>();
        for (EventDBProto proto : protos) {
            events.add(toEvent(proto));
        }
        return postProcess(events);
    }

    @Override
    public List<Event> getEventsByKindAndNamespace(int clusterId, String ns, EventKind kind) throws IOException {
        List<EventDBProto> protos = eventMapper.getEventsByKindAndNamespace(clusterId, ns, kind);
        List<Event> events = new LinkedList<>();
        for (EventDBProto proto : protos) {
            events.add(toEvent(proto));
        }
        return postProcess(events);
    }

    @Override
    public List<Event> getEventsByDeployId(int clusterId, int deployId) throws IOException {
        List<EventDBProto> protos = eventMapper.getEventsByDeployId(clusterId, deployId);
        List<Event> events = new LinkedList<>();
        for (EventDBProto proto : protos) {
            events.add(toEvent(proto));
        }
        return postProcess(events);
    }

    @Override
    public List<EventInfo> translateEvent(List<Event> events) {
        List<EventInfo> eventInfos = new LinkedList<>();
        for (Event event : events) {
            eventInfos.add(EventInfo.fromK8sEvent(event));
        }
        return eventInfos;
    }

    @Override
    public void clearDeployEvents(int clusterId, int deployId) {
        eventMapper.clearDeployEvents(clusterId, deployId);
    }

    @Override
    public long deleteOldDeployEvents(int clusterId, int deployId) {
        return eventMapper.deleteOldDeployEvents(clusterId, deployId, 100);
    }

    @Override
    public long deleteOldDeployEvents(int clusterId, int deployId, int remaining) {
        return eventMapper.deleteOldDeployEvents(clusterId, deployId, remaining);
    }

    private Event toEvent(@NotNull EventDBProto proto) throws IOException {
        return objectMapper.readValue(proto.getContent(), Event.class);
    }

    private EventDBProto toProto(@NotNull Event event, int clusterId, int deployId) throws JsonProcessingException {
        EventDBProto proto = new EventDBProto();
        proto.setClusterId(clusterId);
        proto.setVersion(event.getMetadata().getResourceVersion());
        proto.setEventKind(event.getInvolvedObject().getKind());
        proto.setHost(event.getSource().getHost());
        proto.setDeployId(deployId);
        proto.setNamespace(event.getMetadata().getNamespace());
        proto.setName(event.getMetadata().getName());
        String content = objectMapper.writeValueAsString(event);
        proto.setContent(content);
        return proto;
    }

    // do not need merge events now
    private static List<Event> postProcess(List<Event> events) {
        return events;
    }

    private static String getCharacter(@NotNull Event event) {
        String character = null;
        ObjectReference object = event.getInvolvedObject();
        if (object.getUid() != null) {
            character = object.getUid();
        } else {
            character = String.format("%s:%s:%s", object.getNamespace(), object.getKind(), object.getName());
        }
        return character + ":" + event.getReason() + ":" + event.getMessage();
    }

}