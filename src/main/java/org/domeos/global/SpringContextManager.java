package org.domeos.global;

import org.domeos.framework.engine.event.DMEvent;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

/**
 * Created by xupeng on 16-5-6.
 */
@Component("springContextManager")
@Lazy(false)
public class SpringContextManager implements ApplicationContextAware {

    private static SpringContextManager instance;

    private ApplicationContext context;

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        context = applicationContext;
        instance = context.getBean(SpringContextManager.class);
    }

    public static <T> T getBean(Class<T> clazz) {
        return instance.context.getBean(clazz);
    }

    public static void publishEvent(DMEvent event) {
        instance.context.publishEvent(event);
    }
}
