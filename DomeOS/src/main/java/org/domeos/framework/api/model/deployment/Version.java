package org.domeos.framework.api.model.deployment;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.deployment.related.LogDraft;
import org.domeos.framework.engine.model.RowModelBase;

import java.util.List;

/**
 */
public class Version extends RowModelBase{
    private int deployId = 0;  // separate column
    private long version = 0; //version id for the deploy, separate column
    private List<ContainerDraft> containerDrafts; // describe container configs for each container in this pod
    private LogDraft logDraft;
    private List<String> volumes; // for stateful service, mount to host path.
    private List<LabelSelector> labelSelectors;
    private List<String> hostList;

    public List<String> getHostList() {
        return hostList;
    }

    public void setHostList(List<String> hostList) {
        this.hostList = hostList;
    }

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
    }

    public List<LabelSelector> getLabelSelectors() {
        return labelSelectors;
    }

    public void setLabelSelectors(List<LabelSelector> labelSelectors) {
        this.labelSelectors = labelSelectors;
    }

    public void setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
    }

    public int getDeployId() {
        return deployId;
    }

    public void setDeployId(int deployId) {
        this.deployId = deployId;
    }

    public LogDraft getLogDraft() {
        return logDraft;
    }

    public void setLogDraft(LogDraft logDraft) {
        this.logDraft = logDraft;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
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

}
