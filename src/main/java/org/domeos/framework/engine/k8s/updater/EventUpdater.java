package org.domeos.framework.engine.k8s.updater;

import org.domeos.exception.DataBaseContentException;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.biz.deployment.impl.DeployEventBizImpl;
import org.domeos.framework.api.biz.event.K8SEventBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.DeployEvent;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.related.DeployOperation;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.framework.api.service.event.EventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;

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

    @Autowired
    private DeployEventBizImpl eventBiz;

    @Autowired
    private DeploymentStatusBiz deploymentStatusBiz;

//    private ConcurrentHashMap<Integer, Future> processingClusterMap = new ConcurrentHashMap<>();

//    private ExecutorService executors = Executors.newCachedThreadPool();

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

    private void checkUpdateTask() {
        List<Cluster> clusters = clusterBiz.listClusters();
//        Set<Integer> keys = new TreeSet<>(processingClusterMap.keySet());

        for (Cluster cluster : clusters) {
//            String clusterName = cluster.getName();
//            int clusterId = cluster.getId();

//            Future future = processingClusterMap.get(clusterId);
//            if (future == null) {
//                logger.info("start update events for cluster:{}", clusterName);
//                future = executors.submit(new UpdateClusterEventTask(cluster));
//                if (processingClusterMap.putIfAbsent(clusterId, future) != null) {
//                    logger.info("duplicated event updater created for cluster:{}, canceled", clusterName);
//                    future.cancel(true);
//                }
//            } else {
//                // probably error happens
//                if (future.isDone()) {
//                    logger.info("event updater finished for cluster:{}", clusterName);
//                    processingClusterMap.remove(clusterId);
//                }
//            }
//            keys.remove(clusterId);
            checkDeployStatus(cluster);
        }

        // cancel deleted cluster
//        for (Integer key : keys) {
//            logger.info("event updater clear for deleted cluster:{}", key);
//            Future future = processingClusterMap.get(key);
//            if (future.isDone() || future.cancel(true)) {
//                processingClusterMap.remove(key);
//            } else {
//                logger.error("event updater clear failed for deleted cluster:{}", key);
//            }
//        }
    }

//    private class UpdateClusterEventTask implements Callable<Boolean> {
//
//        Cluster cluster;
//
//        public UpdateClusterEventTask(Cluster cluster) {
//            this.cluster = cluster;
//        }
//
//        @Override
//        public Boolean call() throws Exception {
//            try {
//                String version = k8SEventBiz.getLatestResourceVersion(cluster.getId());
//                long count = updateCluster(cluster, version);
//                // in case of too old version caused no event watched
//                if (count == 0) {
//                    updateCluster(cluster, null);
//                }
//            } catch (Exception e) {
//                logger.error("failed to update cluster " + cluster.getName(), e);
//                throw e;
//            }
//            return Boolean.TRUE;
//        }
//    }

//    private long updateCluster(Cluster cluster, String version) throws KubernetesClientException, IOException {
//        AtomicLong count = new AtomicLong(0);
//        KubeUtils kubeUtils = null;
//        try {
//            kubeUtils = Fabric8KubeUtils.buildKubeUtils(cluster, null);
//        } catch (K8sDriverException e) {
//            throw new KubernetesClientException(e.getMessage());
//        }
//        KubernetesClient client = (KubernetesClient) kubeUtils.getClient();
//        final int clusterId = cluster.getId();

//        logger.info("start to watch event for cluster:{} from resourceVersion:{}", clusterId, version);
//        final CountDownLatch closeLatch = new CountDownLatch(1);
//        if (version != null) {
//            try (Watch watch = client.events().withResourceVersion(version).watch(new eventWatcher(count, clusterId, closeLatch))) {
//                closeLatch.await();
//            } catch (KubernetesClientException | InterruptedException e) {
//                logger.error("Could not watch resources", e);
//            }
//        } else {
//            try (Watch watch = client.events().watch(new eventWatcher(count, clusterId, closeLatch))) {
//                closeLatch.await();
//            } catch (KubernetesClientException | InterruptedException e) {
//                logger.error("Could not watch resources", e);
//            }
//        }

//        return count.get();
//    }

    private void checkDeployStatus(Cluster cluster) {
        List<Deployment> deployments = deploymentBiz.listDeploymentByClusterId(cluster.getId());

        if (deployments == null || deployments.size() == 0) {
            return;
        }

        for (Deployment deployment : deployments) {
            DeployEvent event = null;
            try {
                event = eventBiz.getNewestEventByDeployId(deployment.getId());
            } catch (IOException e) {
                logger.error("get eventBiz, getNewestEventByDeployId error, deployId=" + deployment.getId());
            }
            if (event == null) {
                continue;
            }
            if (!deployment.deployTerminated() && event.eventTerminated()) {
                switch (event.getEventStatus()) {
                    case FAILED:
                        deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.ERROR);
                        logger.info("set deployment to error with id " + deployment.getId());
                        break;
                    case ABORTED:
                        if (DeployOperation.ABORT_UPDATE.equals(event.getOperation())) {
                            deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.UPDATE_ABORTED);
                            logger.info("set deployment to update_aborted with id " + deployment.getId());
                        } else if (DeployOperation.ABORT_ROLLBACK.equals(event.getOperation())) {
                            deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.BACKROLL_ABORTED);
                            logger.info("set deployment to rollback_aborted with id " + deployment.getId());
                        } else if (DeployOperation.ABORT_START.equals(event.getOperation())) {
                            deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.STOP);
                            logger.info("set deployment to stop with id " + deployment.getId());
                        } else {
                            deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.RUNNING);
                            logger.info("set deployment to running with id " + deployment.getId());
                        }
                        break;
                    case SUCCESS:
                        if (DeployOperation.STOP.equals(event.getOperation())) {
                            deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.STOP);
                            logger.info("set deployment to stop with id " + deployment.getId());
                        } else {
                            deploymentStatusBiz.setDeploymentStatus(deployment.getId(), DeploymentStatus.RUNNING);
                            logger.info("set deployment to running with id " + deployment.getId());
                        }
                        break;
                    default:
                        break;
                }
            } else {
                try {
                    EventChecker eventChecker = new EventChecker(deployment, event);
                    eventChecker.checkEvent();
                    if (!event.eventTerminated() && event.getStatusExpire() < System.currentTimeMillis()) {
                        event.setMessage("deployment expired");
                        eventChecker.checkExpireEvent();
                    }
                } catch (DataBaseContentException e) {
                    logger.warn("catch io exception when create event checker, message={}", e.getMessage());
                }
            }
        }
    }

//    private class eventWatcher implements Watcher<Event> {
//        private int clusterId;
//        private AtomicLong counter;
//        private CountDownLatch closeLatch;
//
//        private eventWatcher(AtomicLong counter, int clusterId, CountDownLatch closeLatch) {
//            this.counter = counter;
//            this.clusterId = clusterId;
//            this.closeLatch = closeLatch;
//        }
//
//        @Override
//        public void eventReceived(Action action, Event event) {
//            K8sEventDetail details = eventService.getDeployIdByEvent(clusterId, event);
//            if (details == null || details.getDeployId() <= 0 || details.getClusterId() <= 0) {
//                return;
//            }
//            DMEventSender.publishEvent(new K8SEventReceivedEvent(details));
//            counter.incrementAndGet();
//            try {
//                eventService.createEvent(clusterId, event);
//            } catch (IOException e) {
//                logger.warn("exception happened when create k8sevent into database, detail:" + e.getMessage(), e);
//            }
//            if (logger.isDebugEnabled()) {
//                logger.debug("insert event name:{}, kind:{}, reason:{}, version:{}",
//                        event.getMetadata().getName(), event.getInvolvedObject().getKind(),
//                        event.getReason(), event.getMetadata().getResourceVersion());
//            }
//        }
//
//        @Override
//        public void onClose(KubernetesClientException e) {
//            if (e != null) {
//                logger.error(e.getMessage(), e);
//                closeLatch.countDown();
//            }
//        }
//    }

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
