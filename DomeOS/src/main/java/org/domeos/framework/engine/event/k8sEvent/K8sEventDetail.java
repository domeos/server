package org.domeos.framework.engine.event.k8sEvent;

import org.domeos.client.kubernetesclient.definitions.v1.Event;

/**
 * Created by xupeng on 16-6-2.
 */
public class K8sEventDetail {

    Event event;
    int deployId;
    int clusterId;

    public K8sEventDetail(Event event, int deployId, int clusterId) {
        this.event = event;
        this.deployId = deployId;
        this.clusterId = clusterId;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public int getDeployId() {
        return deployId;
    }

    public void setDeployId(int deployId) {
        this.deployId = deployId;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }
}
