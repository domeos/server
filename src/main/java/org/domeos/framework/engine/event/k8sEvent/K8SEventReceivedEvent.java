package org.domeos.framework.engine.event.k8sEvent;

import org.domeos.framework.engine.event.DMEvent;

/**
 * Created by xupeng on 16-5-6.
 */
public class K8SEventReceivedEvent extends DMEvent<K8sEventDetail> {

    public K8SEventReceivedEvent(K8sEventDetail source) {
        super(source);
    }
}
