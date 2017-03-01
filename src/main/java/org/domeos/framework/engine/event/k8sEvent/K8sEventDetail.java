package org.domeos.framework.engine.event.k8sEvent;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.fabric8.kubernetes.api.model.Event;
import org.domeos.util.StringUtils;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.global.GlobalConstant;
import org.domeos.util.DateUtil;

import java.text.ParseException;
import java.util.TimeZone;

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

    public long eventTime() {
        if (event == null) {
            return -1;
        }
        String timestamp = event.getLastTimestamp();
        if (StringUtils.isBlank(timestamp)) {
            return -1;
        }
        try {
            return DateUtil.string2timestamp(timestamp, TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
        } catch (ParseException e) {
            return -1;
        }
    }
}
