package org.domeos.framework.engine.k8s.util;

/**
 * Created by anningluo on 2015/12/10.
 */
public enum RCBriefStatus {
    // pending means no pod been created, or no pod is running status
    Pending,
    // running means at least one pod is running, but there are some pod
    // not SuccessRunning
    Running,
    // SuccessRunning means all pod is SuccessRunning
    SuccessRunning,
    // there is not enough information to judge the rc status, or no idea
    // about the rc status
    Unknow
}
