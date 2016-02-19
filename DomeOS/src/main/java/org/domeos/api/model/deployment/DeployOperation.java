package org.domeos.api.model.deployment;

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
    DELETE
}
