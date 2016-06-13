package org.domeos.framework.api.service.event;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.event.EventKind;

import java.io.IOException;
import java.util.List;

/**
 * Created by xupeng on 16-3-29.
 */
public interface EventService {

    void createEvent(int clusterId, Event event) throws IOException;

    int getDeployIdByEvent(int clusterId, Event event);

    void deleteDeploymentEvent(int clusterId, Deployment deployment);

    HttpResponseTemp<List<Event>> getEventsByHost(String host) throws IOException;

    HttpResponseTemp<List<Event>> getEventsByNamespace(int clusterId, String ns) throws IOException;

    HttpResponseTemp<List<Event>> getEventsByKindAndNamespace(int clusterId, String namespace, EventKind kind) throws IOException;

    HttpResponseTemp<List<EventInfo>> getEventsByDeployId(int deployId) throws IOException;
}
