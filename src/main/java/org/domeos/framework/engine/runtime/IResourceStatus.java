package org.domeos.framework.engine.runtime;

import org.domeos.framework.api.model.deployment.related.DeployResourceStatus;

/**
 * Created by sparkchen on 16/4/6.
 */
public interface IResourceStatus {
    DeployResourceStatus getDeployResourceStatusById(long deploymentId);
}
