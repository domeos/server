package org.domeos.framework.api.controller.exception;

import org.domeos.basemodel.ResultStat;

/**
 * Created by sparkchen on 16/4/6.
 * only use for throw to user level, not for background task.
 */
public class ApiException extends RuntimeException {
    ResultStat stat;

    public ResultStat getStat() {
        return stat;
    }

    public void setStat(ResultStat stat) {
        this.stat = stat;
    }

    protected ApiException(ResultStat stat) {
        this.stat = stat;
    }

    protected ApiException(ResultStat stat, String message) {
        super(message);
        this.stat = stat;
    }

    private ApiException(ResultStat stat, Throwable cause) {
        super(cause);
        this.stat = stat;
    }

    private ApiException(ResultStat stat, String msg, Throwable cause) {
        super(msg, cause);
        this.stat = stat;
    }

    protected ApiException() {
    }

//    private ApiException(Throwable cause) {
//        super(cause);
//    }
//
//    private ApiException(String message) {
//        super(message);
//    }
//
//    private ApiException(String message, Throwable cause) {
//        super(message, cause);
//    }

    /**
     * use this function when you need to return to user and know how to handle this exception
     *
     * only message will be logged
     * @param stat
     * @param cause
     * @return
     */
    public static ApiException wrapKnownException(ResultStat stat, Throwable cause) {
        return new ApiException(stat, cause.getMessage());
    }

    /**
     * use this function when you need to return to user and do not know how to handle the exception
     *
     * this exception will be logged stack trace unified.
     * @param cause
     * @return
     */
    public static ApiException wrapUnknownException(Throwable cause) {
        return new ApiException(ResultStat.SERVER_INTERNAL_ERROR, cause);
    }

    /**
     * use this function when you need to return a stat and message to user
     * @param stat
     * @param message
     * @return
     */
    public static ApiException wrapMessage(ResultStat stat, String message) {
        return new ApiException(stat, message);
    }

    public static ApiException wrapResultStat(ResultStat stat) {
        return new ApiException(stat);
    }
}