package org.domeos.framework.engine.event.k8sEvent;

import org.apache.http.annotation.NotThreadSafe;
import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.framework.api.consolemodel.event.EventInfo;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.engine.event.DMEventSender;
import org.domeos.framework.engine.event.SimpleEventListener;
import org.domeos.framework.engine.event.deployStatus.PodRestartTooMuchEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Created by xupeng on 16-5-5.
 */
@Component
public class K8sEventParseListener extends SimpleEventListener<K8SEventReceivedEvent> {

    private static Logger logger = LoggerFactory.getLogger(K8sEventParseListener.class);

    EventCheckMap map = new EventCheckMap();

    private static HashSet<String> errors = new HashSet<>(Arrays.asList("Killing", "Backoff"));

    @Override
    public void onEvent(K8SEventReceivedEvent k8SEventReceivedEvent) {
        K8sEventDetail details = k8SEventReceivedEvent.getSource();
        Event event = details.getEvent();
        if (EventKind.Pod.name().equals(event.getInvolvedObject().getKind())) {
            int deployId = details.getDeployId();
            if (PodEvent.POD_RESTART_TOO_MUCH == map.checkEvent(deployId, event)) {
                //report error
                DMEventSender.publishEvent(new PodRestartTooMuchEvent(deployId));
            }
        }
    }

    public enum PodEvent {
        POD_RESTART_TOO_MUCH,
        NONE
    }

    @NotThreadSafe
    private class EventCheckMap {
        Map<Integer, LinkedList<Event>> errEventMap = new HashMap<>();
        private final int SIZE = 4;

        public PodEvent checkEvent(int deployId, Event event) {
            if (errors.contains(event.getReason()) && deployId > 0) {
                put(deployId, event);
                if (restartedTooMuch(deployId)) {
                    return PodEvent.POD_RESTART_TOO_MUCH;
                }
            }
            return PodEvent.NONE;
        }

        private boolean restartedTooMuch(int deployId) {
            LinkedList<Event> events = errEventMap.get(deployId);
            if (events == null || events.size() < SIZE) {
                return false;
            }
            Event last = events.getLast();
            Event first = events.getFirst();
            long lastTime = EventInfo.fromK8sEvent(last).getLastTS();
            long firstTime = EventInfo.fromK8sEvent(first).getFirstTS();
            // 3 minutes
            return firstTime - lastTime > 180000;
        }

        private void put(int deployId, Event event) {
            if (!errEventMap.containsKey(deployId)) {
                errEventMap.put(deployId, new LinkedList<Event>());
            }
            LinkedList<Event> queue = errEventMap.get(deployId);
            queue.addFirst(event);
            if (queue.size() > SIZE) {
                queue.removeLast();
            }
        }
    }
}
