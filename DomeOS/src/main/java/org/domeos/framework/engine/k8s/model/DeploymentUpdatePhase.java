package org.domeos.framework.engine.k8s.model;

/**
 * Created by anningluo on 2015/12/16.
 */
public enum DeploymentUpdatePhase {
    Starting,
    Running,
    Stopped,
    Failed,
    Succeed,
    Unknown  // for init
}
