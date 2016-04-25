package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.HostEnv;
import org.domeos.framework.api.model.deployment.related.LogDraft;
import org.domeos.framework.api.model.deployment.related.NetworkMode;
import org.domeos.framework.api.model.deployment.related.LabelSelector;

import java.util.List;

/**
 * Created by xxs on 15/12/16.
 */
public class VersionDetail {
    private long version;
    private int deployId;
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

    public VersionDetail() {
    }

    public VersionDetail(Version version, Deployment deployment) {

        setVersion(version.getVersion());
        setDeployId(deployment.getId());
        setClusterName(deployment.getClusterName());
        setDeployName(deployment.getName());
        setHostEnv(deployment.getHostEnv());
        setCreateTime(version.getCreateTime());
        setContainerDrafts(version.getContainerDrafts());
        setLabelSelectors(version.getLabelSelectors());
        setNetworkMode(deployment.getNetworkMode());
        setVolumes(version.getVolumes());

//        Deployment deployment = deploymentBiz.getDeployment(deployId);
//        if (deployment == null) {
//            return null;
//        }
//        versionDetail.setClusterName(deployment.getClusterName());
//        versionDetail.setDeployName(deployment.getDeployName());
//        versionDetail.setHostEnv(deployment.getHostEnv());
//
//        Version version = this.getVersion(deployId, versionId);
//        if (version == null) {
//            return null;
//        }
//        versionDetail.setCreateTime(version.getCreateTime());
//        versionDetail.setContainerDrafts(version.getContainerDrafts());
//        versionDetail.setLogDraft(version.getLogDraft());
//        versionDetail.setLabelSelectors(version.getLabelSelectors());
//        versionDetail.setNetworkMode(deployment.getNetworkMode());
//        versionDetail.setVolumes(version.getVolumes());
//        versionDetail.setHostList(version.getHostList());
//
    }


    public void setVersion(long version) {
        this.version = version;
    }

    public long getVersion() {
        return version;
    }

    public int getDeployId() {
        return deployId;
    }

    public void setDeployId(int deployId) {
        this.deployId = deployId;
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
