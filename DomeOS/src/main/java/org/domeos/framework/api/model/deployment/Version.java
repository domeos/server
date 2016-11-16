package org.domeos.framework.api.model.deployment;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.fabric8.kubernetes.api.KubernetesHelper;
import io.fabric8.kubernetes.api.model.PodSpec;
import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.deployment.related.LogDraft;
import org.domeos.framework.api.model.deployment.related.VersionType;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.framework.engine.model.RowModelBase;
import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 */
public class Version extends RowModelBase{
    private int deployId = 0;  // separate column
    private int version = 0; //version id for the deploy, separate column
    private List<ContainerDraft> containerDrafts; // describe container configs for each container in this pod
    private LogDraft logDraft;
    private List<String> volumes; // for stateful service, mount to host path.
    private List<LabelSelector> labelSelectors;
    private List<String> hostList;
    private String podSpecStr;
    private VersionType versionType;

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

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public List<String> getVolumes() {
        return volumes;
    }

    public void setVolumes(List<String> volumes) {
        this.volumes = volumes;
    }

    public String getPodSpecStr() {
        return podSpecStr;
    }

    public void setPodSpecStr(String podSpecStr) {
        this.podSpecStr = podSpecStr;
    }

    public VersionType getVersionType() {
        return versionType;
    }

    public void setVersionType(VersionType versionType) {
        this.versionType = versionType;
    }

    public String checkLegality() {
        if (logDraft != null) {
            String tmp = logDraft.checkLegality();
            if (!StringUtils.isBlank(tmp)) {
                return tmp;
            }
        } else if (!StringUtils.isBlank(podSpecStr)) {
            PodSpec podSpec = toPodSpec();
            if (podSpec == null) {
                return  "something wrong with pod spec definition";
            } else {
                String checkAdditionalProperties = podSpec.toString();
                if (checkAdditionalProperties != null && checkAdditionalProperties.contains("additionalProperties")) {
                    Pattern additionalPropertiesPattern = Pattern.compile("(additionalProperties=\\{)([^\\}]+)\\}");
                    Matcher matcher = additionalPropertiesPattern.matcher(checkAdditionalProperties);
                    if (matcher.find()) {
                        String parameter = matcher.group(2);
                        return "\""  + parameter + "\" is wrong PodSpec yaml/json definition";
                    }
                }
            }
        }
        return "";
    }

    public PodSpec toPodSpec() {
        try {
            if (versionType == VersionType.CUSTOM) {
                return null;
            } else if (versionType == VersionType.YAML) {
                return KubernetesHelper.loadYaml(podSpecStr, PodSpec.class);
            } else if (versionType == VersionType.JSON) {
                ObjectMapper objectMapper = new CustomObjectMapper();
                return objectMapper.readValue(podSpecStr, PodSpec.class);
//                return (PodSpec) KubernetesHelper.loadJson(podSpecStr);
            }
        } catch (IOException e) {
            return null;
        }
        return null;
    }
}
