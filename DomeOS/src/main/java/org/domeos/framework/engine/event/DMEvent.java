package org.domeos.framework.engine.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEvent;

/**
 * Created by xupeng on 16-5-6.
 */
public abstract class DMEvent<T> extends ApplicationEvent {

    private static final Logger logger = LoggerFactory.getLogger(DMEvent.class);

    private String fromClass;

    public DMEvent(T source) {
        super(source);

        // if debug enabled, record message create class by stacktrace
        if (logger.isDebugEnabled()) {
            StackTraceElement[] s = Thread.currentThread().getStackTrace();
            for (int i = 1; i < s.length; i++) {
                try {
                    Class clazz = Class.forName(s[i].getClassName());
                    if (!DMEvent.class.isAssignableFrom(clazz)) {
                        fromClass = clazz.getName();
                        break;
                    }
                } catch (ClassNotFoundException e) {
                    logger.warn("unable to find class in stacktrace in DMEvent", e);
                }
            }
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public final T getSource() {
        return (T) source;
    }

    @Override
    public String toString() {
        if (logger.isDebugEnabled()) {
            return super.toString() + "[from class:" + fromClass + "]";
        } else {
            return super.toString();
        }
    }

}
