package org.domeos.framework.api.biz.deployment;

import org.domeos.framework.api.model.deployment.related.DeploymentStatus;

/**
 */

public interface DeploymentStatusBiz {

    DeploymentStatus getDeploymentStatus(int deployId);

    void setDeploymentStatus(int deployId,  DeploymentStatus status);

}
