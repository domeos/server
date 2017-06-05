package org.domeos.framework.engine.event.AutoDeploy;

import org.domeos.framework.api.model.deployment.Policy;

/**
 * Created by feiliu206363 on 2016/11/4.
 */
public class AutoUpdateInfo {
    private int deployId;
    private int versionId;
    private int replicas;
    private Policy policy;

    public int getDeployId() {
        return deployId;
    }

    public AutoUpdateInfo setDeployId(int deployId) {
        this.deployId = deployId;
        return this;
    }

    public int getVersionId() {
        return versionId;
    }

    public AutoUpdateInfo setVersionId(int versionId) {
        this.versionId = versionId;
        return this;
    }

    public int getReplicas() {
        return replicas;
    }

    public AutoUpdateInfo setReplicas(int replicas) {
        this.replicas = replicas;
        return this;
    }

    public Policy getPolicy() {
        return policy;
    }

    public AutoUpdateInfo setPolicy(Policy policy) {
        this.policy = policy;
        return this;
    }

    @Override
    public String toString() {
        return "{deployId:" + deployId + ",versionId:" + versionId + ",replicas:" +
                replicas + ",policy" + policy.toString() + "}";
    }
}
