package org.domeos.framework.engine.k8s.updater;

import io.fabric8.kubernetes.api.model.PodList;
import org.domeos.framework.engine.k8s.model.UpdatePolicy;
import org.domeos.framework.engine.k8s.model.UpdateReplicationCount;


/**
 * Created by anningluo on 2015/12/15.
 */
public interface UpdateStrategy {
    UpdatePolicy scheduleUpdate(UpdateReplicationCount desireCount, PodList oldPods, PodList newPods);
}
