package org.domeos.framework.engine;

import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.global.SpringContextManager;

/**
 * Created by xupeng on 16-5-6.
 */
public class RuntimeDriverFactory {

    /**
     * create a runtime driver with init called
     * @param clazz
     * @param cluster
     * @param <T>
     * @return
     */
    @SuppressWarnings("unchecked")
    public static <T extends RuntimeDriver> T getRuntimeDriver(Class<T> clazz, Cluster cluster) {
        return (T) SpringContextManager.getBean(clazz).init(cluster);
    }
}
