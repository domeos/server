package org.domeos.client.kubernetesclient.util;

import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.definitions.v1.ReplicationController;

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
        if (selector != null) {
            return selector;
        }
        if (rc.getMetadata() != null) {
            selector = rc.getMetadata().getLabels();
        }
        if (selector != null) {
            return selector;
        }
        if (rc.getSpec() != null && rc.getSpec().getTemplate() != null) {
            selector = rc.getSpec().getTemplate().getMetadata().getLabels();
        }
        return selector;
    }

    public static RCBriefStatus getStatus(ReplicationController rc, PodList podList) {
        if (rc == null || rc.getSpec() == null || podList == null || rc.getStatus() == null) {
            System.out.println("!!!! one parameter is null");
            return RCBriefStatus.Unknow;
        }
        int desireReplicas = rc.getSpec().getReplicas();
        if (rc.getStatus().getReplicas() == 0) {
            return RCBriefStatus.Pending;
        }
        int pendingPodNum = 0, runningPodNum = 0, successRunningPodNum = 0;
        for (Pod pod : podList.getItems()) {
            switch (PodUtils.getStatus(pod)) {
                case Pending:
                    pendingPodNum++;
                    break;
                case Running:
                    runningPodNum++;
                    break;
                case SuccessRunning:
                    successRunningPodNum++;
                    break;
                case Unknow:
                    // System.out.println("!!!!!!!! one pod status is unknow, pod=\n" + pod);
                    return RCBriefStatus.Unknow;
                default:
                    break;
            }
        }
        if (runningPodNum == 0 && successRunningPodNum == 0) {
            return RCBriefStatus.Pending;
        }
        if (rc.getStatus().getReplicas() == desireReplicas && successRunningPodNum >= desireReplicas) {
            return RCBriefStatus.SuccessRunning;
        } else {
            return RCBriefStatus.Running;
        }
    }
}
