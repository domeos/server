package org.domeos.api.model.deployment;

import org.domeos.api.model.global.LabelSelector;

import java.util.List;

/**
 * Created by xxs on 15/12/16.
 */
public class VersionDetail {
    private long version;
    private long deployId;
    private String clusterName;
    private String deployName;
    private long createTime;
    private List<ContainerDraft> containerDrafts;
    private HostEnv hostEnv;
    private LogDraft logDraft;
    private List<LabelSelector> labelSelectors;
    private NetworkMode networkMode;
    private List<String> hostList;
    private List<String> volumes;

    public void setVersion(long version) {
        this.version = version;
    }

    public long getVersion() {
        return version;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }

    public String getClusterName() {
        return clusterName;
    }

    public void setDeployName(String deployName) {
        this.deployName = deployName;
    }

    public String getDeployName() {
        return deployName;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
    }

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
    }

    public void setHostEnv(HostEnv hostEnv) {
        this.hostEnv = hostEnv;
    }

    public HostEnv getHostEnv() {
        return hostEnv;
    }

    public LogDraft getLogDraft() {
        return logDraft;
    }

    public void setLogDraft(LogDraft logDraft) {
        this.logDraft = logDraft;
    }

    public void setLabelSelectors(List<LabelSelector> labelSelectors) {
        this.labelSelectors = labelSelectors;
    }

    public List<LabelSelector> getLabelSelectors() {
        return labelSelectors;
    }

    public NetworkMode getNetworkMode() {
        return networkMode;
    }

    public void setNetworkMode(NetworkMode networkMode) {
        this.networkMode = networkMode;
    }

    public List<String> getHostList() {
        return hostList;
    }

    public void setHostList(List<String> hostList) {
        this.hostList = hostList;
    }

    public List<String> getVolumes() {
        return volumes;
    }

    public void setVolumes(List<String> volumes) {
        this.volumes = volumes;
    }
}
