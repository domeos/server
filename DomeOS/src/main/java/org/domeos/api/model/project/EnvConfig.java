package org.domeos.api.model.project;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
public class EnvConfig {
    int id;
    int projectId;
    String envKey;
    String envValue;
    String description;

    public EnvConfig() {}

    public EnvConfig(int projectId, String envKey, String envValue, String description) {
        this.projectId = projectId;
        this.envKey = envKey;
        this.envValue = envValue;
        this.description = description;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public String getEnvKey() {
        return envKey;
    }

    public void setEnvKey(String envKey) {
        this.envKey = envKey;
    }

    public String getEnvValue() {
        return envValue;
    }

    public void setEnvValue(String envValue) {
        this.envValue = envValue;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
