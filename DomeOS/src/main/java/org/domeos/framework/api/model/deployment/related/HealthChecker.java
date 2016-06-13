package org.domeos.framework.api.model.deployment.related;

/**
 */
public class HealthChecker {

    HealthCheckerType type;
    int port;
    int timeout;
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
