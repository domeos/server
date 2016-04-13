package org.domeos.framework.engine.k8s.updater;

import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.TimeoutResponseHandler;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Created by xupeng on 16-3-30.
 */
public class EventUpdater {

    @Autowired
    K8SEventBiz k8SEventBiz;

    @Autowired
    ClusterBiz clusterBiz;

    private ConcurrentHashMap<Integer, Future> processingClusterMap = new ConcurrentHashMap<>();

    private ExecutorService executors = Executors.newCachedThreadPool();

    private ScheduledExecutorService scheduledExecutor = Executors.newScheduledThreadPool(1);

    private static AtomicBoolean started = new AtomicBoolean(false);

    private static Logger logger = LoggerFactory.getLogger(EventUpdater.class);

    public void init() {
        if (started.compareAndSet(false, true)) {
            logger.info("init {}, start scheduled task checker.", EventUpdater.class.toString());
            scheduledExecutor.scheduleWithFixedDelay(new UpdateTask(), 1, 30, TimeUnit.SECONDS);
        }
    }

    private class UpdateTask implements Runnable {

        @Override
        public void run() {
            try {
                checkUpdateTask();
            } catch (Exception e) {
                logger.error("failed when check event update task", e);
            }
        }

    }

    public void checkUpdateTask() {
        List<Cluster> clusters = clusterBiz.listClusters();
        Set<Integer> keys = new TreeSet<>(processingClusterMap.keySet());

        for (Cluster cluster : clusters) {
            String clusterName = cluster.getName();
            int clusterId = cluster.getId();

            Future future = processingClusterMap.get(clusterId);
            if (future == null) {
                logger.info("start update events for cluster:{}", clusterName);
                future = executors.submit(new UpdateClusterEventTask(cluster));
                if (processingClusterMap.putIfAbsent(clusterId, future) != null) {
                    logger.info("duplicated event updater created for cluster:{}, canceled", clusterName);
                    future.cancel(true);
                }
            } else {
                // probably error happens
                if (future.isDone()) {
                    logger.info("event updater finished for cluster:{}", clusterName);
                    processingClusterMap.remove(clusterId);
                }
            }
            keys.remove(clusterId);
        }

        // cancel deleted cluster
        for (Integer key : keys) {
            logger.info("event updater clear for deleted cluster:{}", key);
            Future future = processingClusterMap.get(key);
            if (future.isDone() || future.cancel(true)) {
                processingClusterMap.remove(key);
            } else {
                logger.error("event updater clear failed for deleted cluster:{}", key);
            }
        }
    }

    private class UpdateClusterEventTask implements Callable<Boolean> {

        Cluster cluster;

        public UpdateClusterEventTask(Cluster cluster) {
            this.cluster = cluster;
        }

        @Override
        public Boolean call() throws Exception {
            try {
                updateCluster(cluster);
            } catch (Exception e) {
                logger.error("failed to update cluster " + cluster.getName(), e);
                throw e;
            }
            return Boolean.TRUE;
        }
    }

    private void updateCluster(Cluster cluster) throws KubeResponseException,
            IOException, KubeInternalErrorException {
        String server = cluster.getApi();
        KubeClient client = new KubeClient(server);
        int clusterId = cluster.getId();

        String version = k8SEventBiz.getLatestResourceVersion(clusterId);
        logger.info("start to watch event for cluster:{} from resourceVersion:{}", clusterId, version);
        client.watchEvent(version, new EventHandler(k8SEventBiz, clusterId));
    }

    private static class EventHandler extends TimeoutResponseHandler<Event> {

        K8SEventBiz k8SEventBiz;
        int clusterId;

        public EventHandler(K8SEventBiz k8SEventBiz, int clusterId) {
            this.k8SEventBiz = k8SEventBiz;
            this.clusterId = clusterId;
        }

        @Override
        public boolean handleResponse(Event event) throws IOException {
            k8SEventBiz.createEvent(clusterId, event);
            if (logger.isDebugEnabled()) {
                logger.debug("insert event name:{}, kind:{}, reason:{}, version:{}",
                        event.getMetadata().getName(), event.getInvolvedObject().getKind(),
                        event.getReason(), event.getMetadata().getResourceVersion());
            }
            return true;
        }
    }
}
