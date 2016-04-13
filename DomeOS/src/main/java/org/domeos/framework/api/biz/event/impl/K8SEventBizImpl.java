package org.domeos.framework.api.biz.event.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.client.kubernetesclient.definitions.v1.ObjectReference;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.mapper.event.EventMapper;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.api.model.event.releated.EventDBProto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.validation.constraints.NotNull;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
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
    ObjectMapper objectMapper;

    @Override
    public void createEvent(int clusterId, Event event) throws IOException {
        EventDBProto proto = toProto(event, clusterId);
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
        return mergeEvent(events);
    }

    @Override
    public List<Event> getEventsByNamespace(int clusterId, String ns) throws IOException {
        List<EventDBProto> protos = eventMapper.getEventsByNamespace(clusterId, ns);
        List<Event> events = new LinkedList<>();
        for (EventDBProto proto : protos) {
            events.add(toEvent(proto));
        }
        return mergeEvent(events);
    }

    @Override
    public List<Event> getEventsByKindAndNamespace(int clusterId, String ns, EventKind kind) throws IOException {
        List<EventDBProto> protos = eventMapper.getEventsByKindAndNamespace(clusterId, ns, kind);
        List<Event> events = new LinkedList<>();
        for (EventDBProto proto : protos) {
            events.add(toEvent(proto));
        }
        return mergeEvent(events);
    }

    @Override
    public List<Event> getEventsByDeployName(int clusterId, String deployName) throws IOException {
        List<EventDBProto> protos = eventMapper.getEventsByDeployName(clusterId, deployName);
        List<Event> events = new LinkedList<>();
        for (EventDBProto proto : protos) {
            events.add(toEvent(proto));
        }
        return mergeEvent(events);
    }

    @Override
    public List<EventInfo> translateEvent(List<Event> events) {
        List<EventInfo> eventInfos = new LinkedList<>();
        for (Event event : events) {
            eventInfos.add(EventInfo.fromK8sEvent(event));
        }
        return eventInfos;
    }

    private Event toEvent(@NotNull EventDBProto proto) throws IOException {
        return objectMapper.readValue(proto.getContent(), Event.class);
    }

    private EventDBProto toProto(@NotNull Event event, int clusterId) throws JsonProcessingException {
        EventDBProto proto = new EventDBProto();
        proto.setClusterId(clusterId);
        proto.setVersion(event.getMetadata().getResourceVersion());
        proto.setEventKind(event.getInvolvedObject().getKind());
        proto.setHost(event.getSource().getHost());
        proto.setNamespace(event.getMetadata().getNamespace());
        proto.setName(event.getMetadata().getName());
        String content = objectMapper.writeValueAsString(event);
        proto.setContent(content);
        return proto;
    }

    private static List<Event> mergeEvent(List<Event> events) {
        LinkedHashMap<String, Event> eventMap = new LinkedHashMap<>();
        for (Event event : events) {
            String character = getCharacter(event);
            eventMap.put(character, event);
        }
        events = new ArrayList<>(eventMap.values().size());
        events.addAll(eventMap.values());
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

//    public static void main(String[] args) {
//        ObjectReference object = new ObjectReference();
//        object.setKind("Pod");
//        object.setNamespace("default");
//        object.setName("dmo-mytest-1-v1-fjw2a");
////        object.setUid("f9bb91db-f655-11e5-99d7-848f69dc84eb");
//        object.setApiVersion("v1");
//        object.setResourceVersion("6727526");
//        object.setFieldPath("spec.containers{mytest-1-0}");
//        List<Event> events = new ArrayList<>();
//        events.add(buildEvent(object, 1, "Reason1"));
//        events.add(buildEvent(object, 3, "Reason2"));
//        events.add(buildEvent(object, 2, "Reason1"));
//        events = mergeEvent(events);
//        System.out.println(events);
//
//    }
//
//    private static Event buildEvent(ObjectReference object, int count, String reason) {
//        Event event = new Event();
//        event.setInvolvedObject(object);
//        event.setReason(reason);
//        event.setMessage("just a test message");
//        event.setCount(count);
//        return event;
//    }
}
