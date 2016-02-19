package org.domeos.api.model.deployment;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.global.LabelSelector;

import java.util.List;
import java.util.regex.Pattern;

/**
 * Created by feiliu206363 on 2015/7/30.
 */
public final class DeploymentDraft {

    private static Pattern namePattern = Pattern.compile("[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*");

    private String deployName; // name of this deploy
    private long createTime; // create time for deploy
    private CreatorDraft creator; // authorize deploy to USER or GROUP
    private String namespace = "default"; // namespace for k8s
    private String clusterName; // which k8s cluster to deploy
    private HostEnv hostEnv; // prod or test
    private List<LoadBalanceDraft> loadBalanceDrafts; // to generate service
    private NetworkMode networkMode = NetworkMode.DEFAULT;

    private List<ContainerDraft> containerDrafts; // describe container configs for each container in this pod
    private int replicas; // instance number
    private LogDraft logDraft;
    private List<LabelSelector> labelSelectors; // labels used to select hosts to deploy

    private boolean stateful = false;
    private boolean scalable = false;
    private List<String> volumes;
    private List<String> hostList;

    private HealthCheckerDraft healthCheckerDraft;

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

    public CreatorDraft getCreator() {
        return creator;
    }

    public void setCreator(CreatorDraft creator) {
        this.creator = creator;
    }

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
    }

    public void setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
    }

    public int getReplicas() {
        return replicas;
    }

    public void setReplicas(int replicas) {
        this.replicas = replicas;
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

    public LogDraft getLogDraft() {
        return logDraft;
    }

    public void setLogDraft(LogDraft logDraft) {
        this.logDraft = logDraft;
    }

    public List<LabelSelector> getLabelSelectors() {
        return labelSelectors;
    }

    public void setLabelSelectors(List<LabelSelector> labelSelectors) {
        this.labelSelectors = labelSelectors;
    }

    public List<LoadBalanceDraft> getLoadBalanceDrafts() {
        return loadBalanceDrafts;
    }

    public void setLoadBalanceDrafts(List<LoadBalanceDraft> loadBalanceDrafts) {
        this.loadBalanceDrafts = loadBalanceDrafts;
    }

    public NetworkMode getNetworkMode() {
        return networkMode;
    }

    public void setNetworkMode(NetworkMode networkMode) {
        this.networkMode = networkMode;
    }

    public HealthCheckerDraft getHealthCheckerDraft() {
        return healthCheckerDraft;
    }

    public void setHealthCheckerDraft(HealthCheckerDraft healthCheckerDraft) {
        this.healthCheckerDraft = healthCheckerDraft;
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

    public List<String> getVolumes() {
        return volumes;
    }

    public void setVolumes(List<String> volumes) {
        this.volumes = volumes;
    }

    public List<String> getHostList() {
        return hostList;
    }

    public void setHostList(List<String> hostList) {
        this.hostList = hostList;
    }

    public String checkLegality() {
        String error = null;
        if (StringUtils.isBlank(deployName)) {
            error = "deployName is blank";
        } else if (deployName.length() > 20 || !namePattern.matcher(deployName).matches()) {
            error = "deployName must less than 20 chars, should start and end with [a-z0-9], only contains [-a-z0-9.]";
        } else if (creator == null) {
            error = "creator is blank";
        } else if (StringUtils.isBlank(namespace)){
            error = "namespace is blank";
        } else if (containerDrafts == null || containerDrafts.size() <= 0) {
            error = "containerSpec size is 0";
        } else if (StringUtils.isBlank(clusterName)) {
            error = "cluster name is blank";
        } else if (replicas <= 0) {
            error = "replicas number is less than 0";
        } else if (hostEnv == null) {
            error = "host environment is blank";
        } else if (logDraft != null) {
            error = logDraft.checkLegality();
            if (!StringUtils.isBlank(error)) {
                return error;
            }
        } else {
            for (ContainerDraft containerDraft : containerDrafts) {
                error = containerDraft.checkLegality();
                if (!StringUtils.isBlank(error)) {
                    return error;
                }
            }
        }
        return error;
    }

}
