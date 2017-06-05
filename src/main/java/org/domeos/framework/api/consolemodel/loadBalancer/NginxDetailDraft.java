package org.domeos.framework.api.consolemodel.loadBalancer;

import java.util.List;
import org.domeos.framework.api.model.loadBalancer.related.ForwardingRule;

/**
 * Created by jackfan on 17/2/27.
 */
public class NginxDetailDraft {
    private List<ForwardingRule> rules;
    private int deployIdForLB;
    private long currentReplicas;
    private List<NginxVersionDraft> currentVersions;
    
    public List<ForwardingRule> getRules() {
        return rules;
    }
    
    public void setRules(List<ForwardingRule> rules) {
        this.rules = rules;
    }
    
    public int getDeployIdForLB() {
        return deployIdForLB;
    }

    public void setDeployIdForLB(int deployIdForLB) {
        this.deployIdForLB = deployIdForLB;
    }

    public long getCurrentReplicas() {
        return currentReplicas;
    }

    public void setCurrentReplicas(long currentReplicas) {
        this.currentReplicas = currentReplicas;
    }

    public List<NginxVersionDraft> getCurrentVersions() {
        return currentVersions;
    }

    public void setCurrentVersions(List<NginxVersionDraft> currentVersions) {
        this.currentVersions = currentVersions;
    }
    
}
