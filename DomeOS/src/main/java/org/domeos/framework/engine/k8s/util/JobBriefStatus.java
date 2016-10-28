package org.domeos.framework.engine.k8s.util;

/**
 * Created by anningluo on 15-12-6.
 */
public enum JobBriefStatus {
    // pending means job has start, but no active pod now
    // Active means pod is SuccessRunning. This point is not same with kubectl,
    // but much more helpfull
    Pending,
    // running means job has start, at least one pod is running
    Running,
    // success running means job has start, and at least min(Job.JobSpec.Parallelism,
    // Job.JobSpec.Completions - Job.JobStatus.Successful) jobs is running.
    SuccessRunning,
    // success means job has terminated sucessful with Job.JobSpec.Completions jobs
    // success at least.
    SuccessTerminated,
    // Failed means job has terminated failed with less than Job.JobSpec.Completions
    // job success
    FailedTerminated,
    // unknow means some status not mention above
    Unknow
}
