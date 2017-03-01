package org.domeos.framework.engine.event.deployStatus;

import org.domeos.framework.engine.event.DMEvent;
import org.domeos.framework.engine.event.k8sEvent.K8sEventDetail;

/**
 * Created by xupeng on 16-5-10.
 */
public class PodRestartTooMuchEvent extends DMEvent<K8sEventDetail>{
    public PodRestartTooMuchEvent(K8sEventDetail source) {
        super(source);
    }
}
