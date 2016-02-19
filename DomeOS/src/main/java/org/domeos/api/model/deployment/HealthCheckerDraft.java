package org.domeos.api.model.deployment;

/**
 * Created by xxs on 15/12/18.
 */
public class HealthCheckerDraft {
    private HealthCheckerType type;
    private int port;
    private int timeout;
    private String url;

    public void setType(HealthCheckerType type) {
        this.type = type;
    }

    public HealthCheckerType getType() {
        return type;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public int getPort() {
        return port;
    }

    public void setTimeout(int timeout) {
        this.timeout = timeout;
    }

    public int getTimeout() {
        return timeout;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public HealthChecker toHealthChecker(long deployId) {
        HealthChecker healthChecker = new HealthChecker();
        healthChecker.setDeployId(deployId);
        healthChecker.setPort(port);
        healthChecker.setTimeout(timeout);
        healthChecker.setType(type);
        healthChecker.setUrl(url);
        return healthChecker;
    }
}
