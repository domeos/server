package org.domeos.framework.api.model.deployment.related;

/**
 */
public enum DeployOperation {
    UPDATE,
    ROLLBACK,
    SCALE_UP,
    SCALE_DOWN,
    CREATE,
    START,
    STOP,
    DELETE,
    KUBERNETES
}
