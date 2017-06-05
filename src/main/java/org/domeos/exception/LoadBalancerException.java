package org.domeos.exception;
/**
 * Created by jackfan on 17/3/1.
 */
public class LoadBalancerException extends Exception {
    public LoadBalancerException() {}
    public LoadBalancerException(String message) {
        super(message);
    }
    public LoadBalancerException(String message, Throwable cause) {
        super(message, cause);
    }
}