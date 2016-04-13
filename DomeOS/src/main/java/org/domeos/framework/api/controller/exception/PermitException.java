package org.domeos.framework.api.controller.exception;

/**
 * Created by baokangwang on 2016/4/5.
 */
public class PermitException extends RuntimeException {
    public PermitException() {
    }

    public PermitException(String message) {
        super(message);
    }

    public PermitException(String message, Throwable cause) {
        super(message, cause);
    }

    public PermitException(Throwable cause) {
        super(cause);
    }

    public PermitException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
