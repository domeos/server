package org.domeos.framework.engine.event.k8sEvent;

import io.fabric8.kubernetes.api.model.Event;
import org.domeos.framework.api.model.event.EventKind;
import org.domeos.framework.engine.event.DMEventSender;
import org.domeos.framework.engine.event.SimpleEventListener;
import org.domeos.framework.engine.event.UpdateDeployStatusTask;
import org.domeos.framework.engine.event.deployStatus.PodRestartTooMuchEvent;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;

/**
 * Created by xupeng on 16-5-5.
 */
@Component
public class K8sEventParseListener extends SimpleEventListener<K8SEventReceivedEvent> implements UpdateDeployStatusTask {

    private static Logger logger = LoggerFactory.getLogger(K8sEventParseListener.class);

    private static HashSet<String> errors = new HashSet<>(Arrays.asList("Backoff", "FailedSync", "Failed"));
    private static HashSet<String> podReason = new HashSet<>(Arrays.asList("Created", "Started", "Pulled", "Scheduled", "Failed", "FailedSync", "Killing"));
    private static HashSet<String> rcReason = new HashSet<>(Arrays.asList("SuccessfulCreate", "SuccessfulDelete"));


    @Override
    public void onEvent(K8SEventReceivedEvent k8SEventReceivedEvent) {
        K8sEventDetail details = k8SEventReceivedEvent.getSource();
        Event event = details.getEvent();
        if (event == null || event.getInvolvedObject() == null) {
            return;
        }

        if (EventKind.ReplicationController.name().equals(event.getInvolvedObject().getKind())) {
            if (rcReason.contains(event.getReason())) {
                if (UPDATE_DEPLOY_TASK.add(details.getDeployId())) {
                    DMEventSender.publishEvent(new K8sReplicationControllerEvent(details));
                }
            }
        }

        if (EventKind.Pod.name().equals(event.getInvolvedObject().getKind())) {
            int deployId = details.getDeployId();
            if (event.getCount() > GlobalConstant.K8S_POD_COUNTS) {
                DMEventSender.publishEvent(new PodRestartTooMuchEvent(details));
            } else if (podReason.contains(event.getReason())) {
                if (UPDATE_DEPLOY_TASK.add(deployId)) {
                    DMEventSender.publishEvent(new K8sReplicationControllerEvent(details));
                } else {
                    // retry once here
                    try {
                        Thread.sleep(2000);
                        if (UPDATE_DEPLOY_TASK.add(deployId)) {
                            DMEventSender.publishEvent(new K8sReplicationControllerEvent(details));
                        }
                    } catch (InterruptedException e) {
                        logger.warn("thread for k8s event trigger interrupted, message={}" + e.getMessage());
                    }
                }
            }
        }
    }
}
