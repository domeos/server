package org.domeos.api.model.deployment;

/**
 */
public class DeploymentSnapshot {
    long version;
    long replicas;

    public DeploymentSnapshot() {
    }
    public DeploymentSnapshot(DeploymentSnapshot another) {
        version = another.version;
        replicas= another.replicas;
    }

    public DeploymentSnapshot(long version, long replicas) {
        this.version = version;
        this.replicas = replicas;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }

    public long getReplicas() {
        return replicas;
    }

    public void setReplicas(long replicas) {
        this.replicas = replicas;
    }
}
