package org.domeos.exception;

/**
 * Created by anningluo on 2016/1/21.
 */
public class DataBaseContentException extends Exception {
    public DataBaseContentException(String message) {
        super(message);
    }
    DataBaseContentException(String message, Throwable cause) {
        super(message, cause);
    }
}
