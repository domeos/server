package org.domeos.framework.engine.event.k8sEvent;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.fabric8.kubernetes.api.model.Event;
import org.domeos.framework.engine.model.CustomObjectMapper;

/**
 * Created by xupeng on 16-6-2.
 */
public class K8sEventDetail {

    private Event event;
    private int deployId;
    private int clusterId;
    private CustomObjectMapper mapper = new CustomObjectMapper();

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

    public String eventInfo() throws JsonProcessingException {
        if (this.event != null) {
            return mapper.writeValueAsString(event);
        }
        return null;
    }
}
