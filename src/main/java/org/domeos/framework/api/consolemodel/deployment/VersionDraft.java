package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.cluster.related.ClusterLog;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.HostEnv;
import org.domeos.framework.api.model.deployment.related.NetworkMode;
import org.domeos.framework.api.model.deployment.related.VersionType;
import org.domeos.framework.api.model.deployment.related.VolumeType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by feiliu206363 on 2017/2/16.
 */
public class VersionDraft extends Version {
    private List<ContainerConsole> containerConsoles;
    private String clusterName;
    private ClusterLog clusterLog;
    private String deployName;
    private HostEnv hostEnv;
    private NetworkMode networkMode;
    private VersionString versionString;

    public VersionDraft() {
    }

    public VersionDraft(Version version, Deployment deployment, Cluster cluster) {
        setId(version.getId());
        setVersion(version.getVersion());
        setDeployId(deployment.getId());
        setClusterName(cluster.getName());
        setClusterLog(cluster.getClusterLog());
        setDeployName(deployment.getName());
        setHostEnv(deployment.getHostEnv());
        setCreateTime(version.getCreateTime());
        setContainerDrafts(version.getContainerDrafts());
        setLabelSelectors(version.getLabelSelectors());
        setNetworkMode(deployment.getNetworkMode());
        setVolumeDrafts(version.getVolumeDrafts());
        setDeprecate(version.isDeprecate());
        if (version.getVersionType() == null) {
            setVersionType(VersionType.CUSTOM);
        } else {
            setVersionType(version.getVersionType());
        }

        if (deployment.getHealthChecker() != null && getContainerDrafts() != null) {
            for (ContainerDraft containerDraft : getContainerDrafts()) {
                if (containerDraft.getHealthChecker() == null) {
                    containerDraft.setHealthChecker(deployment.getHealthChecker());
                }
            }
        }
        generateContainerConsole();
    }

    public List<ContainerConsole> getContainerConsoles() {
        return containerConsoles;
    }

    public VersionDraft setContainerConsoles(List<ContainerConsole> containerConsoles) {
        this.containerConsoles = containerConsoles;
        return this;
    }

    public String getClusterName() {
        return clusterName;
    }

    public VersionDraft setClusterName(String clusterName) {
        this.clusterName = clusterName;
        return this;
    }

    public ClusterLog getClusterLog() {
        return clusterLog;
    }

    public VersionDraft setClusterLog(ClusterLog clusterLog) {
        this.clusterLog = clusterLog;
        return this;
    }

    public String getDeployName() {
        return deployName;
    }

    public VersionDraft setDeployName(String deployName) {
        this.deployName = deployName;
        return this;
    }

    public HostEnv getHostEnv() {
        return hostEnv;
    }

    public VersionDraft setHostEnv(HostEnv hostEnv) {
        this.hostEnv = hostEnv;
        return this;
    }

    public NetworkMode getNetworkMode() {
        return networkMode;
    }

    public VersionDraft setNetworkMode(NetworkMode networkMode) {
        this.networkMode = networkMode;
        return this;
    }

    public VersionString getVersionString() {
        return versionString;
    }

    public VersionDraft setVersionString(VersionString versionString) {
        this.versionString = versionString;
        return this;
    }

    public void convertToVersion() {
        generateContainerDraft();
    }

    private void generateContainerDraft() {
        if (containerConsoles == null || containerConsoles.isEmpty()) {
            return;
        }
        List<ContainerDraft> containerDrafts = new ArrayList<>(containerConsoles.size());
        List<VolumeDraft> volumeDrafts = new ArrayList<>();
        List<String> volumeName = new ArrayList<>();
        for (ContainerConsole containerConsole : containerConsoles) {
            List<VolumeMountConsole> volumeMountConsoles = containerConsole.getVolumeMountConsoles();
            List<VolumeMountDraft> volumeMountDrafts = new ArrayList<>();
            if (volumeMountConsoles != null && !volumeMountConsoles.isEmpty()) {
                for (VolumeMountConsole volumeMountConsole : volumeMountConsoles) {
                    VolumeMountDraft volumeMountDraft = new VolumeMountDraft();
                    volumeMountDraft.setName(volumeMountConsole.getName());
                    volumeMountDraft.setReadOnly(volumeMountConsole.isReadonly());
                    volumeMountDraft.setMountPath(volumeMountConsole.getContainerPath());
                    volumeMountDrafts.add(volumeMountDraft);
                    if (!volumeName.contains(volumeMountConsole.getName())) {
                        volumeDrafts.add(volumeMountConsole);
                        volumeName.add(volumeMountConsole.getName());
                    }
                }
            }
            List<VolumeMountConsole> configConsoles = containerConsole.getConfigConsoles();
            if (configConsoles != null && !configConsoles.isEmpty()) {
                for (VolumeMountConsole configConsole : configConsoles) {
                    VolumeMountDraft volumeMountDraft = new VolumeMountDraft();
                    volumeMountDraft.setName(configConsole.getName());
                    volumeMountDraft.setReadOnly(configConsole.isReadonly());
                    volumeMountDraft.setMountPath(configConsole.getContainerPath());
                    volumeMountDrafts.add(volumeMountDraft);
                    volumeDrafts.add(configConsole);
                }
            }
            containerConsole.setVolumeMountDrafts(volumeMountDrafts);
            containerDrafts.add(containerConsole);
        }
        setVolumeDrafts(volumeDrafts);
        setContainerDrafts(containerDrafts);
        //clear console
        setContainerConsoles(null);
    }

    private void generateContainerConsole() {
        if (getContainerDrafts() == null || getContainerDrafts().isEmpty()) {
            return;
        }
        List<ContainerConsole> containerConsoles = new ArrayList<>(getContainerDrafts().size());
        List<VolumeDraft> volumeDrafts = getVolumeDrafts();
        Map<String, VolumeDraft> volumeDraftMap = new HashMap<>();
        if (volumeDrafts != null && !volumeDrafts.isEmpty()) {
            for (VolumeDraft volumeDraft : volumeDrafts) {
                volumeDraftMap.put(volumeDraft.getName(), volumeDraft);
            }
        }

        for (ContainerDraft containerDraft : getContainerDrafts()) {
            ContainerConsole containerConsole = new ContainerConsole().fillWithContainerDraft(containerDraft);
            List<VolumeMountDraft> volumeMountDrafts = containerDraft.getVolumeMountDrafts();
            List<VolumeMountConsole> volumeMountConsoles = new ArrayList<>();
            List<VolumeMountConsole> configConsoles = new ArrayList<>();
            if (volumeMountDrafts != null && !volumeMountDrafts.isEmpty()) {
                for (VolumeMountDraft volumeMountDraft : volumeMountDrafts) {
                    VolumeDraft tmpVolumeDraft = volumeDraftMap.get(volumeMountDraft.getName());
                    VolumeMountConsole volumeMountConsole = new VolumeMountConsole().fillWithVolumeDraft(tmpVolumeDraft);
                    volumeMountConsole.setReadonly(volumeMountDraft.isReadOnly());
                    volumeMountConsole.setContainerPath(volumeMountDraft.getMountPath());
                    if (VolumeType.CONFIGMAP.equals(tmpVolumeDraft.getVolumeType())) {
                        configConsoles.add(volumeMountConsole);
                    } else {
                        volumeMountConsoles.add(volumeMountConsole);
                    }
                }
            }
            // add container console config
            containerConsole.setVolumeMountConsoles(volumeMountConsoles);
            containerConsole.setConfigConsoles(configConsoles);
            containerConsoles.add(containerConsole);
        }
        setContainerConsoles(containerConsoles);
    }
}
