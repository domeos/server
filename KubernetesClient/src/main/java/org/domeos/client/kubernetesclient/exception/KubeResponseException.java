package org.domeos.client.kubernetesclient.exception;

import org.domeos.client.kubernetesclient.definitions.unversioned.Status;

/**
 * Created by anningluo on 15-11-27.
 */
public class KubeResponseException extends Exception {
    private Status status;
    private int code;
    public KubeResponseException(int code, Status status) {
        this.status = status;
        this.code = code;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getMessage() {
        if (status == null) {
            return "";
        }
        return "code=" + code + "; apiVersion=" + status.getApiVersion() + "; "
                + "reason=" + status.getReason() + "; message=" + status.getMessage();
    }
}
