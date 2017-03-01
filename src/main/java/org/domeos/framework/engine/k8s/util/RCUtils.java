package org.domeos.framework.engine.k8s.util;

import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.ReplicationController;

import java.util.Map;

/**
 * Created by anningluo on 15-12-9.
 */
public class RCUtils {
    public static String getName(ReplicationController rc) {
        return rc.getMetadata().getName();
    }
    public static Map<String, String> getSelector(ReplicationController rc) {
        if (rc == null) {
            return null;
        }

        Map<String, String> selector = null;
        if (rc.getSpec() != null) {
            selector = rc.getSpec().getSelector();
        }
        if (selector != null && selector.size() > 0) {
            return selector;
        }
        if (rc.getMetadata() != null) {
            selector = rc.getMetadata().getLabels();
        }
        if (selector != null && selector.size() > 0) {
            return selector;
        }
        if (rc.getSpec() != null && rc.getSpec().getTemplate() != null) {
            selector = rc.getSpec().getTemplate().getMetadata().getLabels();
        }
        return selector;
    }

    public static String getStatus(ReplicationController rc, PodList podList) {
        if (rc == null || rc.getSpec() == null || podList == null || rc.getStatus() == null) {
            return "Unknown";
        }
        int desireReplicas = rc.getSpec().getReplicas();
        if (rc.getStatus().getReplicas() == 0) {
            return "Pending";
        }
        int runningPodNum = 0;
        for (Pod pod : podList.getItems()) {
            String status = PodUtils.getPodStatus(pod);
            if ("Running".equals(status)) {
                runningPodNum++;
            } else if ("Unknown".equals(status)) {
                return "Unknown";
            }
        }
        if (rc.getStatus().getReplicas() == desireReplicas && runningPodNum >= desireReplicas) {
            return "Running";
        } else {
            return "Pending";
        }
    }
}
