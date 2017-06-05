package org.domeos.framework.api.biz.event;

import io.fabric8.kubernetes.api.model.Event;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.model.event.EventKind;

import java.io.IOException;
import java.util.List;

/**
 * Created by xupeng on 16-3-28.
 */
public interface K8SEventBiz {

    void createEvent(int clusterId, int deployId, Event event) throws IOException;

    String getLatestResourceVersion(int clusterId);

    List<Event> getEventsByHost(String host) throws IOException;

    List<Event> getEventsByNamespace(int clusterId, String ns) throws IOException;

    List<Event> getEventsByKindAndNamespace(int clusterId, String ns, EventKind kind) throws IOException;

    List<Event> getEventsByDeployId(int clusterId, int deployId) throws IOException;

    List<EventInfo> translateEvent(List<Event> events);

    void clearDeployEvents(int clusterId, int deployId);

    long deleteOldDeployEvents(int clusterId, int deployId);

    long deleteOldDeployEvents(int clusterId, int deployId, int remaining);
}
