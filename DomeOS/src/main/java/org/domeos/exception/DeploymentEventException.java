package org.domeos.exception;

/**
 * Created by anningluo on 2015/12/19.
 */
public class DeploymentEventException extends Exception {
    // this exception should used for event status error
    public DeploymentEventException() {}
    public DeploymentEventException(String message) {
        super(message);
    }
    public DeploymentEventException(Exception e) {
        super(e);
    }
    public DeploymentEventException(String message, Throwable cause) {
        super(message, cause);
    }
}
