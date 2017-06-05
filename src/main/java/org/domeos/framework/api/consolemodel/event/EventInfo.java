package org.domeos.framework.api.consolemodel.event;

import io.fabric8.kubernetes.api.model.Event;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.TimeZone;

/**
 * Created by xupeng on 16-4-6.
 */
public class EventInfo {

    private String namespace;
    private String eventKind;
    private String reason;
    private String message;
    private long firstTS;
    private long lastTS;
    private int count;

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getEventKind() {
        return eventKind;
    }

    public void setEventKind(String eventKind) {
        this.eventKind = eventKind;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getFirstTS() {
        return firstTS;
    }

    public void setFirstTS(long firstTS) {
        this.firstTS = firstTS;
    }

    public long getLastTS() {
        return lastTS;
    }

    public void setLastTS(long lastTS) {
        this.lastTS = lastTS;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public static EventInfo fromK8sEvent(Event event) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT"));
        EventInfo eventInfo = new EventInfo();
        eventInfo.namespace = event.getMetadata().getNamespace();
        eventInfo.eventKind = event.getInvolvedObject().getKind();
        eventInfo.reason = event.getReason();
        eventInfo.message = event.getMessage();
        try {
            eventInfo.firstTS = sdf.parse(event.getFirstTimestamp()).getTime();
            eventInfo.lastTS = sdf.parse(event.getLastTimestamp()).getTime();
        } catch (ParseException ignored) {
        }
        eventInfo.count = event.getCount();
        return eventInfo;
    }

//    public static void main(String[] args) throws ParseException {
//
//        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
//        long time = sdf.parse("2016-03-30T09:01:22Z").getTime();
//        Date date = new Date(time);
//        System.out.println(date.toString());
//    }
}


//kind: Event
//        apiVersion: v1
//        metadata:
//        name: dmo-mytest-1-v1.14409385ef233a77
//        namespace: default
//selfLink: /api/v1/namespaces/default/events/dmo-mytest-1-v1.14409385ef233a77
//        uid: f9bd5d67-f655-11e5-99d7-848f69dc84eb
//        resourceVersion: 6727523
//        generation: 0
//        creationTimestamp: 2016-03-30T09:01:22Z
//        deletionTimestamp: 2016-03-30T10:01:22Z
//        deletionGracePeriodSeconds: 0
//        involvedObject:
//        kind: ReplicationController
//        namespace: default
//name: dmo-mytest-1-v1
//        uid: f9ba5444-f655-11e5-99d7-848f69dc84eb
//        apiVersion: v1
//        resourceVersion: 6727515
//        reason: SuccessfulCreate
//        message: Created pod: dmo-mytest-1-v1-fjw2a
//        source:
//        component: replication-controller
//        firstTimestamp: 2016-03-30T09:01:22Z
//        lastTimestamp: 2016-03-30T09:01:22Z
//        count: 1