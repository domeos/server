package org.domeos.framework.engine.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;

/**
 * Created by xupeng on 16-5-6.
 */
public abstract class SimpleEventListener<E extends DMEvent> implements ApplicationListener<E> {

    private static Logger logger = LoggerFactory.getLogger(SimpleEventListener.class);

    abstract public void onEvent(E e);

    public void onRuntimeException(RuntimeException ex, E e){
        logger.error("Unexpected runtime Exception, event:" + e.toString() + " message:" + ex.getMessage(), ex);
    }

    @Override
    public final void onApplicationEvent(E e) {
        try {
            onEvent(e);
        } catch (RuntimeException t) {
            onRuntimeException(t, e);
        }
    }
}
