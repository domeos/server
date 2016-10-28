package org.domeos.framework.engine.k8s.util;


import io.fabric8.kubernetes.api.model.*;

import java.util.List;
import java.util.Map;

/**
 * Created by anningluo on 15-12-6.
 */
public class PodUtils {
    public static PodBriefStatus getStatus(PodStatus podStatus) {
        if (podStatus == null || podStatus.getPhase() == null) {
                // || podStatus.getConditions() == null || podStatus.getContainerStatuses() == null) {
            return PodBriefStatus.Unknow;
        }
        switch (podStatus.getPhase()) {
            case "Pending":
                return PodBriefStatus.Pending;
            case "Running":
                if (isPodReady(podStatus)) {
                    return PodBriefStatus.SuccessRunning;
                } else if (isAnyContainerTerminating(podStatus)) {
                    return PodBriefStatus.Terminating;
                } else {
                    return PodBriefStatus.Running;
                }
            case "Succeeded":
                return PodBriefStatus.SuccessTerminated;
            case "Failed":
                return PodBriefStatus.FailedTerminated;
            default:
                return PodBriefStatus.Unknow;
        }
    }

    public static PodBriefStatus getStatus(Pod pod) {
        if (pod == null || pod.getStatus() == null) {
            return PodBriefStatus.Unknow;
        }
        return getStatus(pod.getStatus());
    }

    public static boolean isTerminal(Pod pod) {
        if (pod == null) {
            return false;
        }
        PodBriefStatus status = getStatus(pod);
        return status == PodBriefStatus.FailedTerminated || status == PodBriefStatus.SuccessTerminated;
    }

    // Ready means same as PodBriefStatus.SuccessRunning
    public static boolean isPodReady(PodStatus podStatus) {
        if (podStatus == null || podStatus.getPhase() == null) {
            return false;
        }
        if (!podStatus.getPhase().equals("Running")) {
            return false;
        }
        if (podStatus.getConditions() == null) {
            return false;
        }
        for (PodCondition condition : podStatus.getConditions()) {
            if (condition.getType().equals("Ready") && condition.getStatus().equals("False")) {
                return false;
            }
        }
        // check container
        if (podStatus.getContainerStatuses() == null) {
            return false;
        }
        for (ContainerStatus containerStatus : podStatus.getContainerStatuses()) {
            if (!containerStatus.getReady()) {
                return false;
            }
        }
        return true;
    }
    public static boolean isPodReady(Pod pod) {
        return isPodReady(pod.getStatus());
    }
    public static int getPodReadyNumber(List<Pod> iterm) {
        int result = 0;
        for (Pod pod : iterm) {
            if (isPodReady(pod)) {
                result++;
            }
        }
        return result;
    }
    public static boolean isAllPodReady(PodList podList) {
        if (podList == null) {
            return false;
        }
        for (Pod pod : podList.getItems()) {
            if (!isPodReady(pod)) {
                return false;
            }
        }
        return true;
    }
    public static String getName(Pod pod) {
        return pod.getMetadata().getName();
    }
    public static Map<String, String> getLabel(Pod pod) {
        return pod.getMetadata().getLabels();
    }
    public static ContainerBriefStatus getContainerStatus(ContainerStatus status) {
        if (status == null) {
            return ContainerBriefStatus.Unknow;
        }
        if (status.getReady()) {
            return ContainerBriefStatus.Ready;
        }
        if (status.getState() == null || status.getState().getWaiting() != null) {
            return ContainerBriefStatus.Waiting;
        }
        if (status.getState().getRunning() != null) {
            return ContainerBriefStatus.Running;
        }
        if (status.getState().getTerminated() != null) {
            return ContainerBriefStatus.Terminated;
        }
        return ContainerBriefStatus.Unknow;
    }
    public static boolean isAllContinerReady(PodStatus podStatus) {
        if (podStatus == null || podStatus.getContainerStatuses() == null) {
            return false;
        }
        for (ContainerStatus cStatus : podStatus.getContainerStatuses()) {
            if (getContainerStatus(cStatus) != ContainerBriefStatus.Ready) {
                return false;
            }
        }
        return true;
    }
    public static boolean isAllContainerReady(Pod pod) {
        return pod != null && isAllContinerReady(pod.getStatus());
    }
    public static boolean isAnyContainerTerminating(PodStatus podStatus) {
        if (podStatus == null || podStatus.getContainerStatuses() == null) {
            return  false;
        }
        for (ContainerStatus cStatus : podStatus.getContainerStatuses()) {
            if (getContainerStatus(cStatus) == ContainerBriefStatus.Terminated) {
                return true;
            }
        }
        return false;
    }
    public static boolean isAnyContainerTerminating(Pod pod) {
        return pod != null && isAnyContainerTerminating(pod);
    }
}
