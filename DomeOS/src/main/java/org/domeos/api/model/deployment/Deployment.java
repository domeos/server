package org.domeos.api.model.deployment;

import java.util.List;

/**
 */
public class Deployment {
    private long deployId;
    private String deployName; // name of this deploy
    private long createTime; // create time for deploy
    private String namespace = "default"; // namespace for k8s
    private String clusterName; // which k8s cluster to deploy
    private HostEnv hostEnv; // prod or test
    private int defaultReplicas; // default replications
    private boolean stateful = false;
    private boolean scalable = false; // for stateful service
    private List<LoadBalanceDraft> loadBalanceDrafts; // to generate service
    private HealthChecker healthChecker;

    public long getDeployId() {
        return deployId;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public String getDeployName() {
        return deployName;
    }

    public void setDeployName(String deployName) {
        this.deployName = deployName;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public HostEnv getHostEnv() {
        return hostEnv;
    }

    public void setHostEnv(HostEnv hostEnv) {
        this.hostEnv = hostEnv;
    }

    public int getDefaultReplicas() {
        return defaultReplicas;
    }

    public void setDefaultReplicas(int defaultReplicas) {
        this.defaultReplicas = defaultReplicas;
    }


    public HealthChecker getHealthChecker() {
        return healthChecker;
    }

    public void setHealthChecker(HealthChecker healthChecker) {
        this.healthChecker = healthChecker;
    }

    public boolean isStateful() {
        return stateful;
    }

    public void setStateful(boolean stateful) {
        this.stateful = stateful;
    }

    public boolean isScalable() {
        return scalable;
    }

    public void setScalable(boolean scalable) {
        this.scalable = scalable;
    }

    public List<LoadBalanceDraft> getLoadBalanceDrafts() {
        return loadBalanceDrafts;
    }

    public void setLoadBalanceDrafts(List<LoadBalanceDraft> loadBalanceDrafts) {
        this.loadBalanceDrafts = loadBalanceDrafts;
    }
}
