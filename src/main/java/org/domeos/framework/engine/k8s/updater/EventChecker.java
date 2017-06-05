package org.domeos.framework.engine.k8s.updater;

import org.domeos.exception.DataBaseContentException;
import org.domeos.exception.DeploymentEventException;
import org.domeos.exception.DeploymentTerminatedException;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.engine.ClusterRuntimeDriver;
import org.domeos.framework.engine.RuntimeDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * Created by feiliu206363 on 2016/10/20.
 */
public class EventChecker {
    private static Logger logger = LoggerFactory.getLogger(EventChecker.class);

    private DeployEvent event;

    private Deployment deployment;

    public EventChecker() {
    }

    public EventChecker(Deployment deployment, DeployEvent event) throws DataBaseContentException {
        if (deployment == null || event == null) {
            throw new DataBaseContentException("deployment or event is null for event checker!!!");
        }
        this.deployment = deployment;
        this.event = event;
    }

    public void checkEvent() {
        try {
            RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(deployment.getClusterId());
            if (driver == null) {
                return;
            }
            switch (event.getOperation()) {
                case START:
                case SCALE_DOWN:
                case SCALE_UP:
                case UPDATE:
                case ROLLBACK:
                    driver.checkBasicEvent(deployment, event);
                    break;
                case STOP:
                    driver.checkStopEvent(deployment, event);
                    break;
                case ABORT_START:
                case ABORT_UPDATE:
                case ABORT_ROLLBACK:
                case ABORT_SCALE_UP:
                case ABORT_SCALE_DOWN:
                    driver.checkAbortEvent(deployment, event);
                    break;
            }
        } catch (IOException | DeploymentEventException e) {
            logger.error("Check deploy event status error: " + e.getMessage());
        } catch (DataBaseContentException e) {
            logger.error("Data base content error:" + e.getMessage());
        } catch (DeploymentTerminatedException e) {
            logger.debug("catch event terminal error, message = " + e.getMessage());
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }

    public void checkExpireEvent() {
        try {
            RuntimeDriver driver = ClusterRuntimeDriver.getClusterDriver(deployment.getClusterId());
            if (driver == null) {
                return;
            }
            driver.expiredEvent(deployment, event);
        } catch (IOException | DeploymentEventException e) {
            logger.error("change expired event status failed, eid="
                    + event.getEid() + ", deploymentId=" + event.getDeployId()
                    + ", error message=" + e.getMessage());
        } catch (Exception e) {
            logger.error("get unhandled excption:" + e.getMessage());
        }
    }
}
