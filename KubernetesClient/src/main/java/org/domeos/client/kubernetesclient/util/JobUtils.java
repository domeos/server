package org.domeos.client.kubernetesclient.util;

import org.apache.log4j.Logger;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobCondition;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobSpec;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobStatus;

import java.util.Iterator;
import java.util.Map;

/**
 * Created by anningluo on 15-12-6.
 */
public class JobUtils {
    private static Logger logger = Logger.getLogger(JobUtils.class);
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
