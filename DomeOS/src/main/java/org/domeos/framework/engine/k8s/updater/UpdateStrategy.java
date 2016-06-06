package org.domeos.framework.engine.k8s.updater;

import org.domeos.framework.engine.k8s.model.UpdatePolicy;
import org.domeos.framework.engine.k8s.model.UpdateReplicationCount;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;

/**
 * Created by anningluo on 2015/12/15.
 */
public interface UpdateStrategy {
    UpdatePolicy scheduleUpdate(UpdateReplicationCount desireCount, PodList oldPods, PodList newPods);
}
