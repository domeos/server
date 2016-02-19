package org.domeos.exception;

/**
 * wrap the Exceptions caused by server or network
 *
 * like IOException, TimeoutException
 *
 * you can use e.getCause() to get the original Exception
 */
public class KVServerException extends Exception{

    public KVServerException(Throwable cause) {
        super(cause);
    }

    public KVServerException(String msg, Throwable cause) {
        super(msg, cause);
    }

}
