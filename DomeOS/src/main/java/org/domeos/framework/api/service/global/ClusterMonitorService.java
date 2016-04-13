package org.domeos.framework.api.service.global;

import org.domeos.framework.api.model.global.ClusterMonitor;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2016/1/5.
 */
public interface ClusterMonitorService {
    /**
     *
     * @return
     */
    HttpResponseTemp<?> getClusterMonitorInfo();

    /**
     *
     * @param clusterMonitor
     * @return
     */
    HttpResponseTemp<?> setClusterMonitorInfo(ClusterMonitor clusterMonitor);

    /**
     *
     * @param clusterMonitor
     * @return
     */
    HttpResponseTemp<?> modifyClusterMonitorInfo(ClusterMonitor clusterMonitor);

    /**
     *
     * @return
     */
    HttpResponseTemp<?> deleteClusterMonitorInfo();

    /**
     *
     * @return
     */
    HttpResponseTemp<?> getNormalClusterMonitorInfo();
}
