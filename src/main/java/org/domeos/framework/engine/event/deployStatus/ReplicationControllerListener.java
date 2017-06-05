package org.domeos.framework.engine.event.deployStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.domeos.exception.DataBaseContentException;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.impl.DeployEventBizImpl;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.engine.event.SimpleEventListener;
import org.domeos.framework.engine.event.UpdateDeployStatusTask;
import org.domeos.framework.engine.event.k8sEvent.K8sEventDetail;
import org.domeos.framework.engine.event.k8sEvent.K8sReplicationControllerEvent;
import org.domeos.framework.engine.k8s.updater.EventChecker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Created by feiliu206363 on 2016/10/11.
 */
@Component
public class ReplicationControllerListener extends SimpleEventListener<K8sReplicationControllerEvent> implements UpdateDeployStatusTask {

    private static Logger logger = LoggerFactory.getLogger(ReplicationControllerListener.class);

    @Autowired
    private DeployEventBizImpl eventBiz;

    @Autowired
    private DeploymentBiz deploymentBiz;

    @Override
    public void onEvent(K8sReplicationControllerEvent k8sReplicationControllerEvent) {
        // DomeOS create rc in k8s for this deployment, update deployment status here
        K8sEventDetail k8sEventDetail = k8sReplicationControllerEvent.getSource();

        if (k8sEventDetail == null) {
            return;
        }

        DeployEvent event = null;
        Deployment deployment = null;
        try {
            deployment = deploymentBiz.getDeployment(k8sEventDetail.getDeployId());
            event = eventBiz.getNewestEventByDeployId(k8sEventDetail.getDeployId());
            if (deployment == null || event == null) {
                return;
            }
            EventChecker eventChecker = new EventChecker(deployment, event);
            if (event.getStatusExpire() < System.currentTimeMillis() && !event.eventTerminated()) {
                event.setMessage(k8sEventDetail.eventInfo());
                eventChecker.checkExpireEvent();
            } else {
                eventChecker.checkEvent();
            }
        } catch (JsonProcessingException e) {
            logger.warn("catch json exception from k8s event, deployId={}, message={}", k8sEventDetail.getDeployId(), e.getMessage());
        } catch (IOException e) {
            logger.warn("catch io exception when search event, deployId={}, message={}", k8sEventDetail.getDeployId(), e.getMessage());
        } catch (DataBaseContentException e) {
            logger.warn("catch io exception when create event checker, deployId={}, message={}", k8sEventDetail.getDeployId(), e.getMessage());
        }

        UPDATE_DEPLOY_TASK.remove(k8sEventDetail.getDeployId());
    }
}
