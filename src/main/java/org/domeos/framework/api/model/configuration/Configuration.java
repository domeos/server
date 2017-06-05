package org.domeos.framework.api.model.configuration;

import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.engine.model.RowModelBase;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
public class Configuration extends RowModelBase {
    private int clusterId;
    private String namespace;
    private List<LabelSelector> labelSelectors;
    private Map<String, String> data;

    public int getClusterId() {
        return clusterId;
    }

    public Configuration setClusterId(int clusterId) {
        this.clusterId = clusterId;
        return this;
    }

    public String getNamespace() {
        return namespace;
    }

    public Configuration setNamespace(String namespace) {
        this.namespace = namespace;
        return this;
    }

    public List<LabelSelector> getLabelSelectors() {
        return labelSelectors;
    }

    public Configuration setLabelSelectors(List<LabelSelector> labelSelectors) {
        this.labelSelectors = labelSelectors;
        return this;
    }

    public Map<String, String> getData() {
        return data;
    }

    public Configuration setData(Map<String, String> data) {
        this.data = data;
        return this;
    }

    public String buildK8sName() {
        return GlobalConstant.RC_NAME_PREFIX + getName() + GlobalConstant.CONFIG_MAP_SUFFIX;
    }

    public Map<String, String> buildK8sLabels() {
        Map<String, String> labels = new HashMap<>();
        if (labelSelectors != null && !labelSelectors.isEmpty()) {
            for (LabelSelector selector : labelSelectors) {
                labels.put(selector.getName(), selector.getContent());
            }
        }
        labels.put(GlobalConstant.CONFIG_MAP_ID_STR, String.valueOf(getId()));
        return  labels;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(getName())) {
            return "name must be set";
        }
        if (!StringUtils.checkVolumeNamePattern(getName())) {
            return "name must match pattern ^[a-z0-9]([-a-z0-9]*[a-z0-9])?$";
        }
        if (data != null && !data.isEmpty()) {
            for (Map.Entry<String, String> entry : data.entrySet()) {
                if (!StringUtils.checkDnsNamePattern(entry.getKey())) {
                    return "key in data must match pattern [a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*";
                }
            }
        }
        if (clusterId <= 0) {
            return "cluster must be set";
        }
        return null;
    }
}
