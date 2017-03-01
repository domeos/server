package org.domeos.framework.engine;

import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.engine.k8s.K8sDriver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by feiliu206363 on 2016/4/26.
 */
@Component
@DependsOn("springContextManager")
public class ClusterRuntimeDriver {
    private static ConcurrentHashMap<Integer, RuntimeDriver> clusterDriverMap = new ConcurrentHashMap<>();

    static ClusterBiz clusterBiz;

    @Autowired
    public void setClusterBiz(ClusterBiz clusterBiz) {
        ClusterRuntimeDriver.clusterBiz = clusterBiz;
    }

    @PostConstruct
    public static void init() {
        // TODO: add init, read cluster from database here
        List<Cluster> clusters = clusterBiz.listClusters();

        if (clusters != null) {
            for (Cluster cluster : clusters) {
                if (cluster.getVer() == 1) {
                    clusterDriverMap.putIfAbsent(cluster.getId(), RuntimeDriverFactory.getRuntimeDriver(K8sDriver.class, cluster));
                }
            }
        }
    }

    public static RuntimeDriver getClusterDriver(int clusterId) {
        RuntimeDriver driver = clusterDriverMap.get(clusterId);
        Cluster cluster = clusterBiz.getClusterById(clusterId);
        if (cluster == null) {
            clusterDriverMap.remove(clusterId);
            return null;
        }
        if (driver == null) {
            driver = clusterDriverMap.putIfAbsent(clusterId, RuntimeDriverFactory.getRuntimeDriver(K8sDriver.class, cluster));
        } else {
            if (!driver.isDriverLatest(cluster)) {
                driver = RuntimeDriverFactory.getRuntimeDriver(K8sDriver.class, cluster);
                clusterDriverMap.put(clusterId, driver);
            }
        }
        return driver;
    }
}
