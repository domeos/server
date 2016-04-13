package org.domeos.framework.api.controller.exception;

import org.apache.ibatis.annotations.ResultType;
import org.domeos.basemodel.ResultStat;

/**
 * Created by sparkchen on 16/4/6.
 */
public class ApiException extends RuntimeException {
    ResultStat stat;

    public ResultStat getStat() {
        return stat;
    }

    public void setStat(ResultStat stat) {
        this.stat = stat;
    }

    public ApiException(ResultStat stat, String message) {
        super(message);
        this.stat = stat;
    }
    public ApiException(ResultStat stat) {
        this.stat = stat;
    }

    public ApiException() {
    }

    public ApiException(Throwable cause) {
        super(cause);
    }

    public ApiException(String message) {
        super(message);
    }

    public ApiException(String message, Throwable cause) {
        super(message, cause);
    }

    public ApiException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
