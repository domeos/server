package org.domeos.kubeutils.updater;

import org.domeos.api.model.deployment.UpdatePolicy;
import org.domeos.api.model.deployment.UpdateReplicationCount;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;

/**
 * Created by anningluo on 2015/12/15.
 */
public interface UpdateStrategy {
    UpdatePolicy scheduleUpdate(UpdateReplicationCount desireCount, PodList oldPods, PodList newPods);
}
