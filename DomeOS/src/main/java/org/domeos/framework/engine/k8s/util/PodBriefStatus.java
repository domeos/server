package org.domeos.framework.engine.k8s.util;

/**
 * Created by anningluo on 15-12-4.
 */
public enum PodBriefStatus {
    // The pod has been accepted by the system, but one or more of the container
    // images has not been created. This includes time before being scheduled
    // as well as time spent downloading images over the network, which could
    // take a while.
    Pending,
    // The pod has been bound to a node, and all of the containers have been
    // created. At least one container is still running, or is in the process
    // of starting or restarting.
    Running,
    // same as Running, but ensure all container is running and readness probe
    // success
    SuccessRunning,
    // This status, means some container is terminating and will become success
    // terminated or failed terminated later
    Terminating,
    // All containers in the pod have terminated in success, and will not be
    // restarted.
    SuccessTerminated,
    // All containers in the pod have terminated, at least one container has
    // terminated in failure (exited with non-zero exit status or was terminated
    // by the system)
    FailedTerminated,
    // For some reason the state of the pod could not be obtained, typically
    // due to an error in communicating with the host of the pod.
    Unknow
}
