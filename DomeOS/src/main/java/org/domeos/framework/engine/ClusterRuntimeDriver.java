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

    @Autowired
    ClusterBiz clusterBiz;

    @PostConstruct
    public void init() {
        // TODO: add init, read cluster from database here
        List<Cluster> clusters = clusterBiz.listClusters();

        if (clusters != null) {
            for (Cluster cluster : clusters) {
                if (cluster.getVer() == 1) {
//                    clusterDriverMap.put(cluster.getId(), new K8sDriver().init(cluster));
                    clusterDriverMap.put(cluster.getId(), RuntimeDriverFactory.getRuntimeDriver(K8sDriver.class, cluster));
                }
            }
        }
    }

    public static RuntimeDriver getClusterDriver(int clusterId) {
        return clusterDriverMap.get(clusterId);
    }

    public static void addClusterDriver(int clusterId, RuntimeDriver driver) {
        clusterDriverMap.putIfAbsent(clusterId, driver);
    }

    public static void removeClusterDriver(int clusterId) {
        clusterDriverMap.remove(clusterId);
    }

    public static void updateClusterDriver(int clusterId, RuntimeDriver driver) {
        clusterDriverMap.put(clusterId, driver);
    }
}
