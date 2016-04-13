package org.domeos.client.kubernetesclient.util;

import org.apache.http.client.ClientProtocolException;
import org.apache.log4j.Logger;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobCondition;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobSpec;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobStatus;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

/**
 * Created by anningluo on 15-12-6.
 */
public class JobUtils {
    private static Logger logger = Logger.getLogger(JobUtils.class);
    public static boolean createJobUntilReadyFor(KubeClient client, Job job, final long timeout)
            throws KubeResponseException, IOException, KubeInternalErrorException {
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
        client.watchPod(podList, selector, new TimeoutResponseHandler<Pod>() {
            @Override
            public boolean handleResponse(Pod pod) throws ClientProtocolException, IOException {
                logger.debug("[JOB][STATUS]" + PodUtils.getStatus(pod));
                if (PodUtils.getStatus(pod) == PodBriefStatus.SuccessRunning) {
                    isAllPodReady.put(KubeClientUtils.getPodName(pod), true);
                }
                return !isAllTrue(isAllPodReady);
            }
            @Override
            public long getTimeout() {
                if (timeout <= 0) {
                    return -1;
                }
                long remainTime = timeout - System.currentTimeMillis() + startTime;
                if (remainTime < 0) {
                    return 0;
                } else {
                    return remainTime;
                }
            }
            @Override
            public boolean handleTimeout() {
                return false;
            }
        });
        if (isAllTrue(isAllPodReady)) {
            logger.debug("[JOB]create job=" + getJobName(finalJob) + " success.");
            return true;
        } else {
            logger.debug("[JOB]create job=" + getJobName(finalJob) + " failed.");
            return false;

        }
    }
    public static boolean createJobUntilReady(KubeClient client, Job job)
            throws KubeResponseException, IOException, KubeInternalErrorException {
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
    public static String getJobName(Job job) {
        return job.getMetadata().getName();
    }
    public static JobBriefStatus getStatus(Job job, PodList pod) {
        if (job == null || pod == null) {
            return JobBriefStatus.Unknow;
        }
        return getStatus(job.getSpec(), job.getStatus(), pod.getItems());
    }
    public static JobBriefStatus getStatus(JobSpec jobSpec, JobStatus status, Pod[] podItems) {
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
    public static String getJobComplete(JobStatus status) {
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
    public static boolean isComplete(JobStatus status) {
        return getJobComplete(status).equals("True");
    }
}
