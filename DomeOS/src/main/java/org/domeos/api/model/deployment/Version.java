package org.domeos.api.model.deployment;

import org.apache.commons.lang.StringUtils;
import org.domeos.api.model.global.LabelSelector;

import java.util.List;

/**
 */
public class Version {
    private long vid; // version id for this table
    private long deployId;
    private long version; //version id for the deploy
    private long createTime;
    private List<ContainerDraft> containerDrafts; // describe container configs for each container in this pod
    private LogDraft logDraft;
    private NetworkMode networkMode = NetworkMode.DEFAULT; // whether use host network mode in pod
    private List<LabelSelector> labelSelectors; // labels used to select hosts to deploy
    private List<String> hostList; // for stateful service, don't care labelSelectors.
    private List<String> volumes; // for stateful service, mount to host path.

    public long getVid() {
        return vid;
    }

    public void setVid(long vid) {
        this.vid = vid;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
    }

    public void setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
    }

    public LogDraft getLogDraft() {
        return logDraft;
    }

    public void setLogDraft(LogDraft logDraft) {
        this.logDraft = logDraft;
    }

    public NetworkMode getNetworkMode() {
        return networkMode;
    }

    public void setNetworkMode(NetworkMode networkMode) {
        this.networkMode = networkMode;
    }

    public List<LabelSelector> getLabelSelectors() {
        return labelSelectors;
    }

    public void setLabelSelectors(List<LabelSelector> labelSelectors) {
        this.labelSelectors = labelSelectors;
    }

    public List<String> getVolumes() {
        return volumes;
    }

    public void setVolumes(List<String> volumes) {
        this.volumes = volumes;
    }

    public String checkLegality() {
        if (logDraft != null) {
            String tmp = logDraft.checkLegality();
            if (!StringUtils.isBlank(tmp)) {
                return tmp;
            }
        }
        return "";
    }

    public List<String> getHostList() {
        return hostList;
    }

    public void setHostList(List<String> hostList) {
        this.hostList = hostList;
    }

}
