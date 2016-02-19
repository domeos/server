package org.domeos.api.model.deployment;

/**
 */
public class HealthChecker {

    long id;
    long deployId;
    HealthCheckerType type;
    int port;
    int timeout;
    String url;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getDeployId() {
        return deployId;
    }

    public void setDeployId(long deployId) {
        this.deployId = deployId;
    }

    public HealthCheckerType getType() {
        return type;
    }

    public void setType(HealthCheckerType type) {
        this.type = type;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
