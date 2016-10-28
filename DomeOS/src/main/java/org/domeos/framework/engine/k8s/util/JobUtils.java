package org.domeos.framework.engine.k8s.util;

import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.extensions.Job;
import io.fabric8.kubernetes.api.model.extensions.JobCondition;
import io.fabric8.kubernetes.api.model.extensions.JobSpec;
import io.fabric8.kubernetes.api.model.extensions.JobStatus;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.Watch;
import io.fabric8.kubernetes.client.Watcher;
import org.apache.log4j.Logger;
import org.domeos.exception.K8sDriverException;


import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Created by anningluo on 15-12-6.
 */
public class JobUtils {
    private static Logger logger = Logger.getLogger(JobUtils.class);
    public static boolean createJobUntilReadyFor(KubeUtils<KubernetesClient> client, Job job, final long timeout)
            throws K8sDriverException, IOException {
        final long startTime = System.currentTimeMillis();
        // create job
        job = client.createJob(job);
        if (job == null) {
            return false;
        }

        // check status
        logger.debug("[JOB]job=" + getJobName(job) + " has been created, wait for ready");
        Map<String, String> selector = KubeClientUtils.getLabels(job);
        // list status
        PodList podList = client.listPod(selector);
        if (PodUtils.isAllPodReady(podList)) {
            return true;
        }
        // init status
        final Map<String, Boolean> isAllPodReady = new HashMap<>();
        for (Pod pod: podList.getItems()) {
            isAllPodReady.put(KubeClientUtils.getPodName(pod), false);
        }
        // watch pod status
        final Job finalJob = job;
        final CountDownLatch closeLatch = new CountDownLatch(1);
        try (Watch watch = client.getClient().pods().withLabels(selector).watch(new Watcher<Pod>() {
            @Override
            public void eventReceived(Action action, Pod pod) {
                logger.debug("[JOB][STATUS]" + PodUtils.getStatus(pod));
                if (PodUtils.getStatus(pod) == PodBriefStatus.SuccessRunning) {
                    isAllPodReady.put(KubeClientUtils.getPodName(pod), true);
                    closeLatch.countDown();
                }
            }

            @Override
            public void onClose(KubernetesClientException e) {
                if (e != null) {
                    logger.error(e.getMessage(), e);
                    closeLatch.countDown();
                }
            }
        })) {
            closeLatch.await(timeout, TimeUnit.MILLISECONDS);
        } catch (KubernetesClientException | InterruptedException e) {
            logger.error("Could not watch resources", e);
        }
//        client.watchPod(podList, selector, new TimeoutResponseHandler<Pod>() {
//            @Override
//            public boolean handleResponse(Pod pod) throws ClientProtocolException, IOException {
//                logger.debug("[JOB][STATUS]" + PodUtils.getStatus(pod));
//                if (PodUtils.getStatus(pod) == PodBriefStatus.SuccessRunning) {
//                    isAllPodReady.put(KubeClientUtils.getPodName(pod), true);
//                }
//                return !isAllTrue(isAllPodReady);
//            }
//            @Override
//            public long getTimeout() {
//                if (timeout <= 0) {
//                    return -1;
//                }
//                long remainTime = timeout - System.currentTimeMillis() + startTime;
//                if (remainTime < 0) {
//                    return 0;
//                } else {
//                    return remainTime;
//                }
//            }
//            @Override
//            public boolean handleTimeout() {
//                return false;
//            }
//        });
        if (isAllTrue(isAllPodReady)) {
            logger.debug("[JOB]create job=" + getJobName(finalJob) + " success.");
            return true;
        } else {
            logger.debug("[JOB]create job=" + getJobName(finalJob) + " failed.");
            return false;

        }
    }
    public static boolean createJobUntilReady(KubeUtils<KubernetesClient> client, Job job)
            throws K8sDriverException, IOException {
        return createJobUntilReadyFor(client, job, -1);
    }
    private static boolean isAllTrue(Map<String, Boolean> status) {
        Iterator<Map.Entry<String, Boolean>> iter = status.entrySet().iterator();
        while (iter.hasNext()) {
            if (!iter.next().getValue()) {
                return false;
            }
        }
        return true;
    }
    private static String getJobName(Job job) {
        return job.getMetadata().getName();
    }
    public static JobBriefStatus getStatus(Job job, PodList pod) {
        if (job == null || pod == null) {
            return JobBriefStatus.Unknow;
        }
        return getStatus(job.getSpec(), job.getStatus(), pod.getItems());
    }
    public static JobBriefStatus getStatus(JobSpec jobSpec, JobStatus status, List<Pod> podItems) {
        if (jobSpec == null || status == null) {
            return JobBriefStatus.Unknow;
        }
        int desireCompletePod = jobSpec.getCompletions();
        int parallelise = jobSpec.getParallelism();
        if (isComplete(status)) {
            if (status.getSucceeded() >= desireCompletePod) {
                return JobBriefStatus.SuccessTerminated;
            } else {
                return JobBriefStatus.FailedTerminated;
            }
        } else {
            if (podItems == null) {
                return JobBriefStatus.Unknow;
            }
            int podReadyNumber = PodUtils.getPodReadyNumber(podItems);
            if (podReadyNumber == 0) {
                return JobBriefStatus.Pending;
            } else if (podReadyNumber >= parallelise) {
                return JobBriefStatus.SuccessRunning;
            } else if (podReadyNumber >= desireCompletePod - status.getSucceeded()) {
                return JobBriefStatus.SuccessRunning;
            } else {
                return JobBriefStatus.Running;
            }
        }
    }
    public static int getSuccessPodNumber(JobStatus status) {
        return status.getSucceeded();
    }
    private static String getJobComplete(JobStatus status) {
        if (status == null) {
            return "Unknow";
        }
        for (JobCondition condition : status.getConditions()) {
            if (condition.getType().equals("Complete")) {
                return condition.getStatus();
            }
        }
        return "Unknow";
    }
    private static boolean isComplete(JobStatus status) {
        return getJobComplete(status).equals("True");
    }
}
