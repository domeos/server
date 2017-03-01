package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceProtocol;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalancerPort;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/7/30.
 */
public final class DeploymentDraft {
    private String deployName; // name of this deploy
    private long createTime = 0; // create time for deploy
    private int creatorId; // creator user id
    private String namespace = "default"; // namespace for k8s
    private int clusterId; // which k8s cluster to deploy
    private HostEnv hostEnv; // prod or test
    private List<LoadBalanceDraft> loadBalanceDrafts; // to generate service
    private NetworkMode networkMode = NetworkMode.DEFAULT;

    private List<ContainerDraft> containerDrafts; // describe container configs for each container in this pod
    private List<VolumeDraft> volumeDrafts; // describe volume configurations
    private int replicas; // instance number
    private LogDraft logDraft;
    private List<LabelSelector> labelSelectors; // labels used to select hosts to deploy

    private boolean stateful = false;
    private boolean scalable = false;
    private List<String> hostList;

    private HealthChecker healthCheckerDraft;
    private DeploymentAccessType accessType = DeploymentAccessType.K8S_SERVICE;
    private int exposePortNum = 0;

    private int collectionId;

    private VersionType versionType = VersionType.CUSTOM;
    private String podSpecStr;

    private String description;

    private List<InnerServiceDraft> innerServiceDrafts; // inner service information

    private DeploymentType deploymentType;

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

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
    }

    public void setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
    }

    public List<VolumeDraft> getVolumeDrafts() {
        return volumeDrafts;
    }

    public DeploymentDraft setVolumeDrafts(List<VolumeDraft> volumeDrafts) {
        this.volumeDrafts = volumeDrafts;
        return this;
    }

    public int getReplicas() {
        return replicas;
    }

    public void setReplicas(int replicas) {
        this.replicas = replicas;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
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

    public HealthChecker getHealthCheckerDraft() {
        return healthCheckerDraft;
    }

    public void setHealthCheckerDraft(HealthChecker healthCheckerDraft) {
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

    public List<String> getHostList() {
        return hostList;
    }

    public void setHostList(List<String> hostList) {
        this.hostList = hostList;
    }

    public int getExposePortNum() {
        return exposePortNum;
    }

    public void setExposePortNum(int exposePortNum) {
        this.exposePortNum = exposePortNum;
    }

    public DeploymentAccessType getAccessType() {
        return accessType;
    }

    public void setAccessType(DeploymentAccessType accessType) {
        this.accessType = accessType;
    }

    public List<InnerServiceDraft> getInnerServiceDrafts() {
        return innerServiceDrafts;
    }

    public VersionType getVersionType() {
        return versionType;
    }

    public void setVersionType(VersionType versionType) {
        this.versionType = versionType;
    }

    public String getPodSpecStr() {
        return podSpecStr;
    }

    public void setPodSpecStr(String podSpecStr) {
        this.podSpecStr = podSpecStr;
    }

    public void setInnerServiceDrafts(List<InnerServiceDraft> innerServiceDrafts) {
        this.innerServiceDrafts = innerServiceDrafts;
    }

    public int getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(int creatorId) {
        this.creatorId = creatorId;
    }

    public int getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(int collectionId) {
        this.collectionId = collectionId;
    }

    public DeploymentType getDeploymentType() {
        return deploymentType;
    }

    public void setDeploymentType(DeploymentType deploymentType) {
        this.deploymentType = deploymentType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String checkLegality() {
        String error = null;
        if (StringUtils.isBlank(deployName)) {
            error = "deployName is blank";
        } else if (deployName.length() > 20 || !StringUtils.checkDnsNamePattern(deployName)) {
            error = "deployName must less than 20 chars, should start and end with [a-z0-9], only contains [-a-z0-9.]";
        } else if (clusterId == 0) {
            error = "creator is blank";
        } else if (StringUtils.isBlank(namespace)) {
            error = "namespace is blank";
        } else if (StringUtils.isBlank(podSpecStr) && (containerDrafts == null || containerDrafts.size() <= 0)) {
            error = "containerSpec size is 0";
        } else if (clusterId <= 0) {
            error = "cluster id less than 0";
        } else if (replicas <= 0) {
            error = "replicas number is less than 0";
        } else if (hostEnv == null) {
            error = "host environment is blank";
        } else if (logDraft != null) {
            error = logDraft.checkLegality();
            if (!StringUtils.isBlank(error)) {
                return error;
            }
        } else if (exposePortNum < 0) {
            error = "exposePortNum is less than 0";
        } else if (StringUtils.isBlank(podSpecStr)) {
            for (ContainerDraft containerDraft : containerDrafts) {
                error = containerDraft.checkLegality();
                if (!StringUtils.isBlank(error)) {
                    return error;
                }
            }
        } else {
            Version test = toVersion();
            error = test.checkLegality();
            if (StringUtils.isBlank(error)) {
                return error;
            }
        }
        if (volumeDrafts != null) {
            List<String> names = new ArrayList<>();
            for (VolumeDraft volumeDraft : volumeDrafts) {
                if (StringUtils.isBlank(volumeDraft.getName())) {
                    return "volume name must be set";
                } else if (names.contains(volumeDraft.getName())) {
                    return "volume name must be different";
                } else {
                    names.add(volumeDraft.getName());
                }
                if (VolumeType.HOSTPATH.equals(volumeDraft.getVolumeType())) {
                    if (StringUtils.isBlank(volumeDraft.getHostPath())) {
                        return "host path must set for volume(" + volumeDraft.getName() + ")";
                    }
                }
            }
        }
        return error;
    }

    public Deployment toDeployment() {
        Deployment deployment = new Deployment();
        deployment.setClusterId(getClusterId());
        deployment.setCreateTime(getCreateTime());
        deployment.setDefaultReplicas(getReplicas());
        deployment.setName(getDeployName());
        deployment.setHostEnv(getHostEnv());
        deployment.setNamespace(getNamespace());
        deployment.setScalable(isScalable());
        deployment.setStateful(isStateful());
        deployment.setNetworkMode(getNetworkMode());
        deployment.setCreateTime(System.currentTimeMillis());
        deployment.setExposePortNum(getExposePortNum());
        deployment.setHealthChecker(getHealthCheckerDraft());
        deployment.setVersionType(getVersionType());
        deployment.setDeploymentType(getDeploymentType());
        deployment.setDescription(getDescription());
        return deployment;
    }

    public List<LoadBalancer> toLoadBalancer() {
        List<LoadBalancer> result = new ArrayList<>();
        if ((loadBalanceDrafts != null && loadBalanceDrafts.size() != 0) ||
                (innerServiceDrafts != null && innerServiceDrafts.size() != 0)) {
            LoadBalancer loadBalancer = new LoadBalancer();
            loadBalancer.setClusterId(clusterId);
            loadBalancer.setNamespace(namespace);
            loadBalancer.setDnsName(deployName);
            loadBalancer.setName(GlobalConstant.RC_NAME_PREFIX + deployName);
            List<LoadBalancerPort> loadBalancerPorts = new ArrayList<>();
            LoadBalancerPort loadBalancerPort = new LoadBalancerPort();
            if (loadBalanceDrafts != null && loadBalanceDrafts.size() != 0) {
                LoadBalanceDraft draft = loadBalanceDrafts.get(0);
                loadBalancerPort.setPort(draft.getPort());
                loadBalancerPort.setTargetPort(draft.getTargetPort());
                loadBalancer.setExternalIPs(draft.getExternalIPs());
                loadBalancer.setType(LoadBalanceType.EXTERNAL_SERVICE);
            } else {
                InnerServiceDraft draft = innerServiceDrafts.get(0);
                loadBalancerPort.setPort(draft.getPort());
                loadBalancerPort.setTargetPort(draft.getTargetPort());
                loadBalancer.setType(LoadBalanceType.INNER_SERVICE);
            }
            loadBalancerPort.setProtocol(LoadBalanceProtocol.TCP);
            loadBalancerPorts.add(loadBalancerPort);
            loadBalancer.setLoadBalancerPorts(loadBalancerPorts);
            result.add(loadBalancer);
        }
        return result;
    }

    public Version toVersion() {
        Version version = new Version();
        version.setContainerDrafts(getContainerDrafts());
        version.setVolumeDrafts(getVolumeDrafts());
        version.setLabelSelectors(getLabelSelectors());
        version.setLogDraft(getLogDraft());
        version.setHostList(getHostList());
        version.setVersionType(getVersionType());
        if (getVersionType() != VersionType.CUSTOM) {
            version.setPodSpecStr(podSpecStr);
        }
        return version;
    }
}
