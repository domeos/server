package org.domeos.framework.api.biz.event;

import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.model.event.EventKind;

import java.io.IOException;
import java.util.List;

/**
 * Created by xupeng on 16-3-28.
 */
public interface K8SEventBiz {

    void createEvent(int clusterName, Event event) throws IOException;

    String getLatestResourceVersion(int clusterId);

    List<Event> getEventsByHost(String host) throws IOException;

    List<Event> getEventsByNamespace(int clusterId, String ns) throws IOException;

    List<Event> getEventsByKindAndNamespace(int clusterId, String ns, EventKind kind) throws IOException;

    List<Event> getEventsByDeployName(int clusterId, String deployName) throws IOException;

    List<EventInfo> translateEvent(List<Event> events);
}
