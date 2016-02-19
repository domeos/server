package org.domeos.client.kubernetesclient.exception;

/**
 * Created by anningluo on 15-11-27.
 */
public class KubeInternalErrorException extends Exception {
    // suggest log fatal if get this exception
    public KubeInternalErrorException(String message, Throwable cause) {
        super(message, cause);
    }
    public KubeInternalErrorException(String message) {
        super(message);
    }
}
