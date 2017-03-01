package org.domeos.framework.engine.exception;

/**
 * Created by sparkchen on 16/4/5.
 */
public class DaoConvertingException extends RuntimeException {
    public DaoConvertingException() {
    }

    public DaoConvertingException(Throwable cause) {
        super(cause);
    }

    public DaoConvertingException(String message) {
        super(message);
    }

    public DaoConvertingException(String message, Throwable cause) {
        super(message, cause);
    }

    public DaoConvertingException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
