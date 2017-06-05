package org.domeos.framework.engine.k8s.util;


import io.fabric8.kubernetes.api.model.Node;
import io.fabric8.kubernetes.api.model.NodeCondition;

/**
 * Created by anningluo on 2015/12/24.
 */
public class NodeUtils {
    public static String getStatus(Node node) {
        if (node == null) {
            return "Unknown";
        }
        String phase = node.getStatus().getPhase();
        if (phase != null && phase.equals("Pending")) {
            return "Pending";
        } else if (phase != null && phase.equals("Running")) {
            if (node.getStatus().getConditions() == null) {
                return "";
            }
            for (NodeCondition condition : node.getStatus().getConditions()) {
                if (condition.getType().equals("Ready")) {
                    if (condition.getStatus().equals("True")) {
                        return "Running";
                    }
                }
            }
            return "";
        } else if (phase !=null && phase.equals("Terminated")) {
            return "Terminated";
        }
        return "Unknown";
    }

    public static boolean isReady(Node node) {
        if (node == null || node.getStatus().getConditions() == null) {
            return false;
        }
        for (NodeCondition condition : node.getStatus().getConditions()) {
            if (condition.getType().equals("Ready")) {
                return condition.getStatus().equals("True");
            }
        }
        return false;
    }
}
