package org.domeos.exception;

/**
 * Created by feiliu206363 on 2016/11/8.
 */
public class DeploymentTerminatedException extends Exception {
    // this exception should used for event terminated error
    public DeploymentTerminatedException() {}
    public DeploymentTerminatedException(String message) {
        super(message);
    }
    public DeploymentTerminatedException(Exception e) {
        super(e);
    }
    public DeploymentTerminatedException(String message, Throwable cause) {
        super(message, cause);
    }
}
