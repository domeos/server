package org.domeos.framework.engine.event.deployStatus;

import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.service.deployment.DeploymentStatusManager;
import org.domeos.framework.engine.event.SimpleEventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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

    @Override
    public void onEvent(PodRestartTooMuchEvent podRestartTooMuchEvent) {
        int deployId = podRestartTooMuchEvent.getSource();
        if (deployId > 0 && statusBiz.getDeploymentStatus(deployId) == DeploymentStatus.RUNNING) {
            logger.info("found running deployment id:{} restarts too much", podRestartTooMuchEvent.getSource());
            statusBiz.setDeploymentStatus(podRestartTooMuchEvent.getSource(), DeploymentStatus.ERROR);
        }
//        logger.warn("failed to change status of deployment {} to fail, detail:{}",
//                podRestartTooMuchEvent.getSource());
    }
}
