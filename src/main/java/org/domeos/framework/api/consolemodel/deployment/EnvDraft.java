package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.util.StringUtils;

/**
 */
public class EnvDraft {
    private String key;
    private String value;
    private String description;

    public EnvDraft() {
    }

    public EnvDraft(String key, String value) {
        this.key = key;
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String checkLegality() {
        String error = null;
        if (!StringUtils.checkEnvNamePattern(key)) {
            error = "environment key must be a C identifier (matching regex [A-Za-z_][A-Za-z0-9_]*): e.g. \"my_name\" or \"MyName\"";
        }
        return error;
    }
}
