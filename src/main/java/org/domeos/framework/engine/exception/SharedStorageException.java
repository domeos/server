package org.domeos.framework.engine.exception;

/**
 * Created by feiliu206363 on 2017/2/28.
 */
public class SharedStorageException extends Exception {
    public SharedStorageException() {
    }

    public SharedStorageException(Throwable cause) {
        super(cause);
    }

    public SharedStorageException(String message) {
        super(message);
    }

    public SharedStorageException(String message, Throwable cause) {
        super(message, cause);
    }

    public SharedStorageException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}