package org.domeos.api.service.global;

import org.domeos.api.model.cluster.ClusterMonitor;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2016/1/5.
 */
public interface ClusterMonitorService {
    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getClusterMonitorInfo(long userId);

    /**
     *
     * @param clusterMonitor
     * @param userId
     * @return
     */
    HttpResponseTemp<?> setClusterMonitorInfo(ClusterMonitor clusterMonitor, long userId);

    /**
     *
     * @param clusterMonitor
     * @param userId
     * @return
     */
    HttpResponseTemp<?> modifyClusterMonitorInfo(ClusterMonitor clusterMonitor, long userId);

    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteClusterMonitorInfo(long userId);

    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getNormalClusterMonitorInfo(long userId);
}
