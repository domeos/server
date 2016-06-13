package org.domeos.framework.engine.k8s.updater;

import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.TimeoutResponseHandler;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.service.event.EventService;
import org.domeos.framework.engine.event.DMEventSender;
import org.domeos.framework.engine.event.k8sEvent.K8SEventReceivedEvent;
import org.domeos.framework.engine.event.k8sEvent.K8sEventDetail;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Created by xupeng on 16-3-30.
 */
@Component
public class EventUpdater {

    @Autowired
    EventService eventService;

    @Autowired
    K8SEventBiz k8SEventBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Autowired
    ClusterBiz clusterBiz;

    private ConcurrentHashMap<Integer, Future> processingClusterMap = new ConcurrentHashMap<>();

    private ExecutorService executors = Executors.newCachedThreadPool();

    private ScheduledExecutorService scheduledExecutor = Executors.newScheduledThreadPool(1);

    private static AtomicBoolean started = new AtomicBoolean(false);

    private static Logger logger = LoggerFactory.getLogger(EventUpdater.class);

    @PostConstruct
    public void init() {
        if (started.compareAndSet(false, true)) {
            logger.info("init {}, start scheduled task checker.", EventUpdater.class.toString());
            scheduledExecutor.scheduleWithFixedDelay(new UpdateTask(), 10, 30, TimeUnit.SECONDS);
            scheduledExecutor.scheduleAtFixedRate(new clearLogTask(), 1, 10, TimeUnit.MINUTES);
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
                String version = k8SEventBiz.getLatestResourceVersion(cluster.getId());
                long count = updateCluster(cluster, version);
                // in case of too old version caused no event watched
                if (count == 0) {
                    updateCluster(cluster, null);
                }
            } catch (Exception e) {
                logger.error("failed to update cluster " + cluster.getName(), e);
                throw e;
            }
            return Boolean.TRUE;
        }
    }

    private long updateCluster(Cluster cluster, String version) throws KubeResponseException,
            IOException, KubeInternalErrorException {
        AtomicLong count = new AtomicLong(0);
        String server = cluster.getApi();
        KubeClient client = new KubeClient(server);
        int clusterId = cluster.getId();

        logger.info("start to watch event for cluster:{} from resourceVersion:{}", clusterId, version);
        client.watchEvent(version, new EventHandler(clusterId, count));
        return count.get();
    }

    private class EventHandler extends TimeoutResponseHandler<Event> {

        int clusterId;
        AtomicLong counter;

        public EventHandler(int clusterId, AtomicLong counter) {
            this.clusterId = clusterId;
            this.counter = counter;
        }

        @Override
        public boolean handleResponse(Event event) throws IOException {
            try {
                int deployId = eventService.getDeployIdByEvent(clusterId, event);
                K8sEventDetail details = new K8sEventDetail(event, deployId, clusterId);
                DMEventSender.publishEvent(new K8SEventReceivedEvent(details));
            } catch (Exception e) {
                logger.warn("exception happened when processing event, detail:" + e.getMessage(), e);
            }
            eventService.createEvent(clusterId, event);
            counter.incrementAndGet();
            if (logger.isDebugEnabled()) {
                logger.debug("insert event name:{}, kind:{}, reason:{}, version:{}",
                        event.getMetadata().getName(), event.getInvolvedObject().getKind(),
                        event.getReason(), event.getMetadata().getResourceVersion());
            }
            return true;
        }
    }

    private class clearLogTask implements Runnable {

        @Override
        public void run() {
            List<Cluster> clusters = clusterBiz.listClusters();
            for (Cluster cluster : clusters) {
                List<Deployment> deployments = deploymentBiz.listDeploymentByClusterId(cluster.getId());
                for (Deployment deployment : deployments) {
                    try {
                        long deleted = k8SEventBiz.deleteOldDeployEvents(cluster.getId(), deployment.getId());
                        if (deleted > 0) {
                            logger.info("deleted {} events for cluster {}, deploy {}", deleted, cluster.getName(),
                                    deployment.getName());
                        }
                    } catch (RuntimeException e) {
                        logger.warn("error happened when delete event for deploy " + deployment.getName() +
                                " in cluster " + cluster.getName() + ", Message:" + e.getMessage(), e);
                    }
                }
                try {
                    long deleted = k8SEventBiz.deleteOldDeployEvents(cluster.getId(), -1, 2000);
                    logger.info("deleted {} events for cluster {}, deploy none", deleted, cluster.getName());
                } catch (RuntimeException e) {
                    logger.warn("error happened when delete event for deploy none in cluster " + cluster.getName() +
                            ", Message:" + e.getMessage(), e);
                }
            }
        }
    }
}
