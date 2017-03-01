package org.domeos.framework.api.model.cluster.related;

import org.domeos.util.StringUtils;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by feiliu206363 on 2015/12/25.
 */
public class NodeLabel {

    private String node;
    private Map<String, String> labels;

    public String getNode() {
        return node;
    }

    public void setNode(String node) {
        this.node = node;
    }

    public Map<String, String> getLabels() {
        return labels;
    }

    public void setLabels(Map<String, String> labels) {
        this.labels = labels;
    }

    public void addLabel(String key, String value) {
        if (labels == null) {
            labels = new HashMap<>();
        }
        labels.put(key, value);
    }

    public String checkLegality() {
        if (StringUtils.isBlank(node)) {
            return "node name must be set";
        }
        if (labels != null && labels.size() != 0) {
            for (Map.Entry<String, String> entry : labels.entrySet()) {
                if (!isRegularLabel(entry.getKey()) || !isRegularLabel(entry.getValue())) {
                    return "label must be a qualified name (at most 63 characters, matching regex ([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])," +
                            " with an optional DNS subdomain prefix (at most 253 characters," +
                            " matching regex [a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*)" +
                            " and slash (/): e.g. \"MyName\" or \"example.com/MyName\"";
                }
            }
        }
        return null;
    }

    public static boolean isRegularLabel(String name) {
        try {
            String labelName = name;
            if (name.contains("/")) {
                String[] labels = name.split(name);
                if (labels.length > 2 || labels.length < 1) {
                    return false;
                }
                labelName = labels[1];
                if (labels[0].length() > 253) {
                    return false;
                }
                if (!StringUtils.checkDnsNamePattern(labels[0])) {
                    return false;
                }
            }
            if (labelName.length() > 63) {
                return false;
            }
            return StringUtils.checkLabelNamePattern(labelName);
        } catch (Exception e) {
            return false;
        }
    }
}
