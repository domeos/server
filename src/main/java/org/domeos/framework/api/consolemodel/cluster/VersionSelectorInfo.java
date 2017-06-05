package org.domeos.framework.api.consolemodel.cluster;

import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.model.deployment.related.LabelSelector;

import java.util.List;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
public class VersionSelectorInfo {
    private int version;
    private List<LabelSelector> labelSelectors;
    private List<ContainerDraft> containerDrafts;

    public VersionSelectorInfo(int version, List<LabelSelector> labelSelectors, List<ContainerDraft> containerDrafts) {
        this.version = version;
        this.labelSelectors = labelSelectors;
        this.containerDrafts = containerDrafts;
    }

    public int getVersion() {
        return version;
    }

    public VersionSelectorInfo setVersion(int version) {
        this.version = version;
        return this;
    }

    public List<LabelSelector> getLabelSelectors() {
        return labelSelectors;
    }

    public VersionSelectorInfo setLabelSelectors(List<LabelSelector> labelSelectors) {
        this.labelSelectors = labelSelectors;
        return this;
    }

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
    }

    public VersionSelectorInfo setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
        return this;
    }
}
