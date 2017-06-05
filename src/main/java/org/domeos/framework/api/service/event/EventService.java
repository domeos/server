package org.domeos.framework.api.service.event;

import io.fabric8.kubernetes.api.model.Event;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.api.model.event.ReportEvent;
import org.domeos.framework.engine.event.k8sEvent.K8sEventDetail;

import java.io.IOException;
import java.util.List;

/**
 * Created by xupeng on 16-3-29.
 */
public interface EventService {

    void createEvent(int clusterId, Event event) throws IOException;

    K8sEventDetail getDeployIdByEvent(int clusterId, Event event);

    void deleteDeploymentEvent(int clusterId, Deployment deployment);

    HttpResponseTemp<List<Event>> getEventsByHost(String host) throws IOException;

    HttpResponseTemp<List<Event>> getEventsByNamespace(int clusterId, String ns) throws IOException;

    HttpResponseTemp<List<Event>> getEventsByKindAndNamespace(int clusterId, String namespace, EventKind kind) throws IOException;

    HttpResponseTemp<List<EventInfo>> getEventsByDeployId(int deployId) throws IOException;

    /**
     * receive k8s event from watcher
     * @param reportEvent
     * @return
     */
    HttpResponseTemp<?> reportEvent(ReportEvent reportEvent);
}
