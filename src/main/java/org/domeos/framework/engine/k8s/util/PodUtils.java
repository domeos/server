package org.domeos.framework.engine.k8s.util;

import io.fabric8.kubernetes.api.model.ContainerStatus;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import org.domeos.global.GlobalConstant;
import org.domeos.util.DateUtil;
import org.domeos.util.StringUtils;

import java.text.ParseException;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

/**
 * Created by anningluo on 15-12-6.
 */
public class PodUtils {
    private static long runningExpireTime = 10 * 60 * 1000;
    private static long nullExpireTime = 3 * 60 * 1000; // 1.5 minutes, this is for request not happen

    public static boolean isTerminal(Pod pod) {
        if (pod == null) {
            return false;
        }
        String status = getPodStatus(pod);
        return "Succeeded".equals(status) || "Failed".equals(status);
    }

    public static boolean isPodReady(Pod pod) {
        String podStatus = getPodStatus(pod);
        if ("Running".equals(podStatus)) {
            return true;
        } else {
            return false;
        }
    }

    public static int getPodReadyNumber(List<Pod> iterm) {
        int result = 0;
        if (iterm == null || iterm.isEmpty()) {
            return result;
        }
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

    public static int getPodVersion(Pod pod) {
        return Integer.parseInt(pod.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
    }

    public static String getPodStatus(Pod pod) {
        if (pod == null || pod.getStatus() == null) {
            return "Unknown";
        }
        String reason = pod.getStatus().getPhase();
        if (!StringUtils.isBlank(pod.getStatus().getReason())) {
            reason = pod.getStatus().getReason();
        }

        if (pod.getStatus().getContainerStatuses() != null) {
            for (ContainerStatus status : pod.getStatus().getContainerStatuses()) {
                if (status.getState() == null) {
                    continue;
                }
                if (status.getState().getWaiting() != null) {
                    reason = status.getState().getWaiting().getReason();
                } else if (status.getState().getTerminated() != null) {
                    reason = status.getState().getTerminated().getReason();
                }
            }
        }

        if (pod.getMetadata() != null && !StringUtils.isBlank(pod.getMetadata().getDeletionTimestamp())) {
            reason = "Terminating";
        }
        return reason;
    }

    private static boolean isFailed(Pod pod) throws ParseException {
        if (pod == null || pod.getStatus() == null || pod.getMetadata() == null) {
            return false;
        }
        long startTime;
        if (pod.getMetadata().getCreationTimestamp() == null) {
            // is it return true better ?
            return false;
        } else {
            startTime = DateUtil.string2timestamp(pod.getMetadata().getCreationTimestamp(),
                    TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
        }
        long current = System.currentTimeMillis();
        String status = PodUtils.getPodStatus(pod);
        if ("Failed".equals(status) || "Error".equals(status)) {
            return true;
        }
        if ("Running".equals(status)) {
            return false;
        }
        if ("Terminating".equals(status)) {
            long deleteTime = DateUtil.string2timestamp(pod.getMetadata().getDeletionTimestamp(),
                    TimeZone.getTimeZone(GlobalConstant.UTC_TIME));
            if (runningExpireTime + deleteTime < current) {
                return true;
            }
        }
        if ("Pending".equals(status) || "ContainerCreating".equals(status)) {
            if (runningExpireTime + startTime < current) {
                // expired
                return true;
            }
        }
        return false;
    }

    public static boolean isAnyFailed(PodList podList) throws ParseException {
        if (podList != null && podList.getItems() != null) {
            for (Pod pod : podList.getItems()) {
                if (isFailed(pod)) {
                    return true;
                }
            }
        }
        return false;
    }

    // if a rc should be created, but
    public static boolean isExpireForEventNotReallyHappen(long startTime) {
        return System.currentTimeMillis() - startTime > nullExpireTime;
    }
}
