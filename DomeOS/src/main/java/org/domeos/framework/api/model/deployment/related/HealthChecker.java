package org.domeos.framework.api.model.deployment.related;

/**
 */
public class HealthChecker {

    HealthCheckerType type;
    int port;
    int delay = 30; // in second
    int timeout; // in second
    String url;

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

    public int getDelay() {
        return delay;
    }

    public void setDelay(int delay) {
        this.delay = delay;
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
