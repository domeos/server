package org.domeos.framework.api.model.cluster;

import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.DeploymentType;
import org.domeos.framework.api.model.deployment.related.HostEnv;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.deployment.related.VersionType;
import org.domeos.framework.engine.model.RowModelBase;
import org.domeos.util.StringUtils;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/12/28.
 */
public class ClusterWatcherConf extends RowModelBase {
    private int clusterId;
    private String namespace;
    private int creatorId;
    private HostEnv hostEnv;
    private List<ContainerDraft> containerDrafts;
    private List<LabelSelector> labelSelectors; // labels used to select hosts to deploy

    public int getClusterId() {
        return clusterId;
    }

    public ClusterWatcherConf setClusterId(int clusterId) {
        this.clusterId = clusterId;
        return this;
    }

    public String getNamespace() {
        return namespace;
    }

    public ClusterWatcherConf setNamespace(String namespace) {
        this.namespace = namespace;
        return this;
    }

    public int getCreatorId() {
        return creatorId;
    }

    public ClusterWatcherConf setCreatorId(int creatorId) {
        this.creatorId = creatorId;
        return this;
    }

    public HostEnv getHostEnv() {
        return hostEnv;
    }

    public ClusterWatcherConf setHostEnv(HostEnv hostEnv) {
        this.hostEnv = hostEnv;
        return this;
    }

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
    }

    public ClusterWatcherConf setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
        return this;
    }

    public List<LabelSelector> getLabelSelectors() {
        return labelSelectors;
    }

    public ClusterWatcherConf setLabelSelectors(List<LabelSelector> labelSelectors) {
        this.labelSelectors = labelSelectors;
        return this;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(getName())) {
            return "name must be set";
        }
        if (!StringUtils.checkDnsNamePattern(getName())) {
            return "name must match pattern [a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*";
        }
        if (clusterId <= 0) {
            return "cluster id must be set";
        }
        if (StringUtils.isBlank(getName())) {
            return "name must be set";
        }
        if (StringUtils.isBlank(namespace)) {
            namespace = "default";
        }
        if (hostEnv == null) {
            hostEnv = HostEnv.PROD;
        }
        if (containerDrafts == null || containerDrafts.isEmpty()) {
            return "container information must be set";
        } else {
            for (ContainerDraft containerDraft : containerDrafts) {
                if (!StringUtils.isBlank(containerDraft.checkLegality())) {
                    return containerDraft.checkLegality();
                }
            }
        }
        return null;
    }

    public Deployment toDeployment() {
        Deployment deployment = new Deployment();
        deployment.setClusterId(clusterId);
        deployment.setDescription(getDescription());
        deployment.setCreateTime(getCreateTime());
        deployment.setDefaultReplicas(1);
        deployment.setName(getName());
        deployment.setHostEnv(hostEnv);
        deployment.setNamespace(namespace);
        deployment.setCreateTime(System.currentTimeMillis());
        deployment.setVersionType(VersionType.WATCHER);
        deployment.setDeploymentType(DeploymentType.DEPLOYMENT);
        deployment.setDescription(getDescription());
        return deployment;
    }

    public Version toVersion() {
        Version version = new Version();
        version.setContainerDrafts(getContainerDrafts());
        version.setLabelSelectors(getLabelSelectors());
        version.setVersionType(VersionType.WATCHER);
        version.setCreateTime(getCreateTime());
        return version;
    }
}
