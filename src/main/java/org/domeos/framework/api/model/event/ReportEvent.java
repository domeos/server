package org.domeos.framework.api.model.event;

import io.fabric8.kubernetes.api.model.Event;

/**
 * Created by feiliu206363 on 2016/12/27.
 */
public class ReportEvent {
    private int clusterId;
    private String clusterApi;
    private String eventType;
    private Event k8sEvent;

    public int getClusterId() {
        return clusterId;
    }

    public ReportEvent setClusterId(int clusterId) {
        this.clusterId = clusterId;
        return this;
    }

    public String getClusterApi() {
        return clusterApi;
    }

    public ReportEvent setClusterApi(String clusterApi) {
        this.clusterApi = clusterApi;
        return this;
    }

    public String getEventType() {
        return eventType;
    }

    public ReportEvent setEventType(String eventType) {
        this.eventType = eventType;
        return this;
    }

    public Event getK8sEvent() {
        return k8sEvent;
    }

    public ReportEvent setK8sEvent(Event k8sEvent) {
        this.k8sEvent = k8sEvent;
        return this;
    }
}
