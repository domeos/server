package org.domeos.framework.api.model.project.related;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class EnvSetting {
    String key;
    String value;
    String description;

    public EnvSetting() {
    }

    public EnvSetting(String key, String value, String description) {
        this.key = key;
        this.value = value;
        this.description = description;
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
}
