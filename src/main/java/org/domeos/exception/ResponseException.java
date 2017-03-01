package org.domeos.exception;

/**
 * Created by feiliu206363 on 2017/1/25.
 */
public class ResponseException extends Exception {
    private int statusCode;

    public ResponseException(int statusCode, String msg) {
        super(msg);
        this.statusCode = statusCode;
    }
}
