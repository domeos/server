package org.domeos.framework.engine.event.deployStatus;

import org.domeos.framework.engine.event.DMEvent;

/**
 * Created by xupeng on 16-5-10.
 */
public class PodRestartTooMuchEvent extends DMEvent<Integer>{
    public PodRestartTooMuchEvent(Integer source) {
        super(source);
    }
}
