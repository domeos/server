package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.util.StringUtils;

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
    private LoadBalancerForDeployDraft loadBalancerDraft; // to generate service
    private NetworkMode networkMode = NetworkMode.DEFAULT;

    private List<ContainerConsole> containerConsoles; // describe container configs for each container in this pod
    //private List<VolumeDraft> volumeDrafts; // describe volume configurations
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

    //private List<InnerServiceDraft> innerServiceDrafts; // inner service information
    
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

    public List<ContainerConsole> getContainerConsoles() {
        return containerConsoles;
    }

    public DeploymentDraft setContainerConsoles(List<ContainerConsole> containerConsoles) {
        this.containerConsoles = containerConsoles;
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

    public LoadBalancerForDeployDraft getLoadBalancerDraft() {
        return loadBalancerDraft;
    }

    public void setLoadBalancerDraft(LoadBalancerForDeployDraft loadBalancerDraft) {
        this.loadBalancerDraft = loadBalancerDraft;
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
        } else if (StringUtils.isBlank(podSpecStr) && (containerConsoles == null || containerConsoles.isEmpty())) {
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
            for (ContainerConsole containerConsole : containerConsoles) {
                error = containerConsole.checkLegality();
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
        if (loadBalancerDraft != null) {
            String lbLegality = loadBalancerDraft.checkLegality();
            if (!StringUtils.isBlank(lbLegality)) {
                return lbLegality;
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
        deployment.setNetworkMode(getNetworkMode());
        deployment.setExposePortNum(getExposePortNum());
        deployment.setHealthChecker(getHealthCheckerDraft());
        deployment.setVersionType(getVersionType());
        deployment.setDeploymentType(getDeploymentType());
        deployment.setDescription(getDescription());
        return deployment;
    }
    
    public Version toVersion() {
        VersionDraft versionDraft = new VersionDraft();
        versionDraft.setContainerConsoles(getContainerConsoles());
        versionDraft.setLabelSelectors(getLabelSelectors());
        versionDraft.setLogDraft(getLogDraft());
        versionDraft.setVersionType(getVersionType());
        versionDraft.setHostList(getHostList());
        if (getVersionType() != VersionType.CUSTOM) {
            versionDraft.setPodSpecStr(podSpecStr);
        }
        versionDraft.convertToVersion();
        return versionDraft;
    }
}