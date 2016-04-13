package org.domeos.framework.api.consolemodel.deployment;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.deployment.*;
import org.domeos.framework.api.consolemodel.CreatorDraft;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.LoadBalancer.related.*;
import org.domeos.framework.api.model.LoadBalancer.related.LoadBalanceType;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Created by feiliu206363 on 2015/7/30.
 */
public final class DeploymentDraft {

    private static Pattern namePattern = Pattern.compile("[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*");

    private String deployName; // name of this deploy
    private long createTime = 0; // create time for deploy
    private CreatorDraft creator; // authorize deploy to USER or GROUP
    private String namespace = "default"; // namespace for k8s
    private int clusterId; // which k8s cluster to deploy
    private HostEnv hostEnv; // prod or test
    private List<LoadBalanceDraft> loadBalanceDrafts; // to generate service
    private NetworkMode networkMode = NetworkMode.DEFAULT;

    private List<ContainerDraft> containerDrafts; // describe container configs for each container in this pod
    private int replicas; // instance number
    private LogDraft logDraft;
    private List<LabelSelector> labelSelectors; // labels used to select hosts to deploy

    private boolean stateful = false;
    private boolean scalable = false;
    private List<String> volumes;
    private List<String> hostList;

    private HealthChecker healthCheckerDraft;
    private DeploymentAccessType accessType = DeploymentAccessType.K8S_SERVICE;
    private int exposePortNum = 0;

    private List<InnerServiceDraft> innerServiceDrafts; // inner service information

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

    public CreatorDraft getCreator() {
        return creator;
    }

    public void setCreator(CreatorDraft creator) {
        this.creator = creator;
    }

    public List<ContainerDraft> getContainerDrafts() {
        return containerDrafts;
    }

    public void setContainerDrafts(List<ContainerDraft> containerDrafts) {
        this.containerDrafts = containerDrafts;
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

    public List<String> getVolumes() {
        return volumes;
    }

    public void setVolumes(List<String> volumes) {
        this.volumes = volumes;
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

    public void setInnerServiceDrafts(List<InnerServiceDraft> innerServiceDrafts) {
        this.innerServiceDrafts = innerServiceDrafts;
    }

    public String checkLegality() {
        String error = null;
        if (StringUtils.isBlank(deployName)) {
            error = "deployName is blank";
        } else if (deployName.length() > 20 || !namePattern.matcher(deployName).matches()) {
            error = "deployName must less than 20 chars, should start and end with [a-z0-9], only contains [-a-z0-9.]";
        } else if (creator == null) {
            error = "creator is blank";
        } else if (StringUtils.isBlank(namespace)){
            error = "namespace is blank";
        } else if (containerDrafts == null || containerDrafts.size() <= 0) {
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
        } else {
            for (ContainerDraft containerDraft : containerDrafts) {
                error = containerDraft.checkLegality();
                if (!StringUtils.isBlank(error)) {
                    return error;
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
        // deployment.setLoadBalanceDrafts(getLoadBalanceDrafts());
        deployment.setScalable(isScalable());
        deployment.setStateful(isStateful());
        deployment.setNetworkMode(getNetworkMode());
        deployment.setCreateTime(System.currentTimeMillis());
        deployment.setHealthChecker(getHealthCheckerDraft());
        return deployment;
    }

    public List<LoadBalancer> toLoadBalancer() {
        List<LoadBalancer> result = new ArrayList<>();
        if (loadBalanceDrafts != null && loadBalanceDrafts.size() != 0) {
            LoadBalanceDraft draft = loadBalanceDrafts.get(0);
            LoadBalancer loadBalancer = new LoadBalancer();
            loadBalancer.setClusterId(clusterId);
            loadBalancer.setExternalIPs(draft.getExternalIPs());
            loadBalancer.setPort(draft.getPort());
            loadBalancer.setProtocol(LoadBalanceProtocol.TCP);
            loadBalancer.setType(LoadBalanceType.EXTERNAL_SERVICE);
            loadBalancer.setTargetPort(draft.getTargetPort());
            result.add(loadBalancer);
        } else if (innerServiceDrafts != null && innerServiceDrafts.size() != 0){
            InnerServiceDraft draft = innerServiceDrafts.get(0);
            LoadBalancer loadBalancer = new LoadBalancer();
            loadBalancer.setPort(draft.getPort());
            loadBalancer.setProtocol(LoadBalanceProtocol.TCP);
            loadBalancer.setType(LoadBalanceType.INNER_SERVICE);
            loadBalancer.setTargetPort(draft.getTargetPort());
            loadBalancer.setClusterId(clusterId);
            result.add(loadBalancer);
        }
        return result;
    }

    public Version toVersion() {
        Version version = new Version();
        version.setContainerDrafts(getContainerDrafts());
        version.setLabelSelectors(getLabelSelectors());
        version.setLogDraft(getLogDraft());
        version.setVolumes(getVolumes());
        version.setHostList(getHostList());
        return version;
    }
}
