package org.domeos.api.model.deployment;

import org.domeos.api.model.global.LabelSelector;

import java.util.List;

/**
 * Created by xxs on 15/12/17.
 */
public class VersionDraft {
    private long deployId;
    private List<ContainerDraft> containerDrafts;
    private LogDraft logDraft;
    private List<LabelSelector> labelSelectors;

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
    }

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
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

}
