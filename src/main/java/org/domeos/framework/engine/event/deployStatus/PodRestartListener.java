package org.domeos.framework.engine.event.deployStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.related.DeployEventStatus;
import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.engine.event.SimpleEventListener;
import org.domeos.framework.engine.event.k8sEvent.K8sEventDetail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Created by xupeng on 16-5-10.
 */
@Component
public class PodRestartListener extends SimpleEventListener<PodRestartTooMuchEvent> {

    private static Logger logger = LoggerFactory.getLogger(PodRestartListener.class);

    @Autowired
    DeploymentStatusManager manager;

    @Autowired
    DeploymentStatusBiz statusBiz;

    @Autowired
    DeployEventBiz eventBiz;

    @Override
    public void onEvent(PodRestartTooMuchEvent podRestartTooMuchEvent) {
        K8sEventDetail detail = podRestartTooMuchEvent.getSource();
        int deployId = detail.getDeployId();
        if (deployId > 0 && statusBiz.getDeploymentStatus(deployId) == DeploymentStatus.RUNNING) {
            long latestTime = detail.eventTime();
            logger.info("found running deployment id:{} restarts too much, event latest time:{}", deployId, latestTime);

            try {
                if (latestTime <= 0) {
                    return;
                }
                DeployEvent newestEvent = eventBiz.getNewestEventByDeployId(deployId);
                long startTime = newestEvent.getStartTime();
                long lastModify = newestEvent.getLastModify();
                if (lastModify > 0) { // judge if k8s event out of date
                    if (latestTime < lastModify) {
                        return;
                    }
                } else if (startTime > 0) {
                    if (latestTime < startTime) {
                        return;
                    }
                }
                // insert operation into event table
                DeployEvent event = new DeployEvent();
                try {
                    event.setMessage("Pod restart too many times. DomeOS set deploy status to ERROR." + detail.eventInfo());
                } catch (JsonProcessingException e) {
                    logger.warn("k8s event to json error, deployId = {}", deployId);
                }
                event.setDeployId(deployId);
                long time = System.currentTimeMillis();
                event.setLastModify(time);
                event.setStartTime(time);
                event.setOperation(DeployOperation.KUBERNETES);
                event.setEventStatus(DeployEventStatus.FAILED);
                event.setUserName("DomeOS");
                eventBiz.createEvent(event);

                statusBiz.setDeploymentStatus(deployId, DeploymentStatus.ERROR);
            } catch (IOException e) {
                logger.error("get newest event for deploy id:" + deployId + " error, message is " + e.getMessage());
            }
        }
    }
}
