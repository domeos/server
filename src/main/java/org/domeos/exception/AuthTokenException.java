package org.domeos.exception;

/**
 * Created by KaiRen on 16/8/29.
 */
public class AuthTokenException extends Exception{
    public AuthTokenException(String message) {
            super(message);
        }
    AuthTokenException(String message, Throwable cause) {
            super(message, cause);
        }
}
