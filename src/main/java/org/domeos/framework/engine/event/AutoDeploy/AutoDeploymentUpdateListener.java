package org.domeos.framework.engine.event.AutoDeploy;

import org.domeos.framework.api.service.deployment.DeploymentService;
import org.domeos.framework.engine.event.SimpleEventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created by feiliu206363 on 2016/11/4.
 */
@Component("autoDeploymentUpdateListener")
public class AutoDeploymentUpdateListener extends SimpleEventListener<AutoDeploymentUpdate> {
    private static Logger logger = LoggerFactory.getLogger(AutoDeploymentUpdateListener.class);

    @Autowired
    DeploymentService deploymentService;

    @Override
    public void onEvent(AutoDeploymentUpdate autoDeploymentUpdate) {
        AutoUpdateInfo autoUpdateInfo = autoDeploymentUpdate.getSource();
        try {
            deploymentService.startUpdate(autoUpdateInfo, false);
        } catch (Exception e) {
            logger.warn("!!! start auto update fail, message is " + e.getMessage() + ", info is " + autoUpdateInfo.toString());
            e.printStackTrace();
        }
    }
}
