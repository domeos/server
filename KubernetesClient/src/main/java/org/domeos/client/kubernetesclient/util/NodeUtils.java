package org.domeos.client.kubernetesclient.util;

import org.domeos.client.kubernetesclient.definitions.v1.Node;
import org.domeos.client.kubernetesclient.definitions.v1.NodeCondition;

/**
 * Created by anningluo on 2015/12/24.
 */
public class NodeUtils {
    public static NodeBriefStatus getStatus(Node node) {
        if (node == null) {
            return NodeBriefStatus.UNKNOW;
        }
        String phase = node.getStatus().getPhase();
        if (phase.equals("Pending")) {
            return NodeBriefStatus.Pending;
        } else if (phase.equals("Running")) {
            if (node.getStatus().getConditions() == null) {
                return NodeBriefStatus.RUNNING;
            }
            for (NodeCondition condition : node.getStatus().getConditions()) {
                if (condition.getType().equals("Ready")) {
                    if (condition.getStatus().equals("True")) {
                        return NodeBriefStatus.SUCCESSRUNNING;
                    }
                }
            }
            return NodeBriefStatus.RUNNING;
        } else if (phase.equals("Terminated")) {
            return NodeBriefStatus.TERMINATED;
        }
        return NodeBriefStatus.UNKNOW;
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
