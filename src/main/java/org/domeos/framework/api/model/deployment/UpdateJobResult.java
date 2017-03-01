package org.domeos.framework.api.model.deployment;

/**
 * Created by feiliu206363 on 2017/1/11.
 */
public class UpdateJobResult {
    private int resultCode;
    private String resultMsg;
    private String deployId;
    private String eventId;
    private String jobName;

    public int getResultCode() {
        return resultCode;
    }

    public UpdateJobResult setResultCode(int resultCode) {
        this.resultCode = resultCode;
        return this;
    }

    public String getResultMsg() {
        return resultMsg;
    }

    public UpdateJobResult setResultMsg(String resultMsg) {
        this.resultMsg = resultMsg;
        return this;
    }

    public String getDeployId() {
        return deployId;
    }

    public UpdateJobResult setDeployId(String deployId) {
        this.deployId = deployId;
        return this;
    }

    public String getEventId() {
        return eventId;
    }

    public UpdateJobResult setEventId(String eventId) {
        this.eventId = eventId;
        return this;
    }

    public String getJobName() {
        return jobName;
    }

    public UpdateJobResult setJobName(String jobName) {
        this.jobName = jobName;
        return this;
    }
}
