package org.domeos.framework.api.controller.exception;

import org.domeos.basemodel.ResultStat;

/**
 * Created by sparkchen on 16/4/6.
 */
public class DeployIlegalException extends ApiException {
    public DeployIlegalException() {
        this.stat = ResultStat.DEPLOYMENT_NOT_LEGAL;
    }

    public DeployIlegalException(Throwable cause) {
        super(cause);
    }

    public DeployIlegalException(String message) {
        super(message);
    }

    public DeployIlegalException(String message, Throwable cause) {
        super(message, cause);
    }

    public DeployIlegalException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
