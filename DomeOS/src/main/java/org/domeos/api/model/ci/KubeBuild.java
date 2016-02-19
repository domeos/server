package org.domeos.api.model.ci;

/**
 * Created by feiliu206363 on 2015/12/3.
 */
public class KubeBuild {
    private int id;
    private int buildId;
    private String jobName;
    private String jobStatus;

    public KubeBuild() {
    }

    public KubeBuild(int buildId, String jobName, String jobStatus) {
        this.buildId = buildId;
        this.jobName = jobName;
        this.jobStatus = jobStatus;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getBuildId() {
        return buildId;
    }

    public void setBuildId(int buildId) {
        this.buildId = buildId;
    }

    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public String getJobStatus() {
        return jobStatus;
    }

    public KubeBuild setJobStatus(String jobStatus) {
        this.jobStatus = jobStatus;
        return this;
    }

    public enum KubeBuildStatus {
        SEND("SEND"),
        RUNNING("RUNNING"),
        FINISH("FINISH");

        public final String status;
        KubeBuildStatus(String status) { this.status = status; }
        public String getStatus() { return this.status; }
    }
}
