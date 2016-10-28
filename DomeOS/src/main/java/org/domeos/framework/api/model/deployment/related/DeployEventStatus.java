package org.domeos.framework.api.model.deployment.related;

/**
 */
public enum DeployEventStatus {
    START,
    PROCESSING,
    SUCCESS,
    FAILED,
    ABORTED;

    public static boolean isTerminal(DeployEventStatus status) {
        return SUCCESS.equals(status) || FAILED.equals(status) || ABORTED.equals(status);
    }
}
