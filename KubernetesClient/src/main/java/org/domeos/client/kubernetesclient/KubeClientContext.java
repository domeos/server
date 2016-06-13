package org.domeos.client.kubernetesclient;


/**
 * Created by anningluo on 15-11-26.
 */
public class KubeClientContext {
    private KubeAPIVersion version;
    private String namespace;
    private boolean pretty;

    public KubeClientContext() {
        version = KubeAPIVersion.v1;
        namespace = "default";
        pretty = false;
    }

    public KubeAPIVersion getVersion() {
        return version;
    }

    public void setVersion(KubeAPIVersion version) {
        this.version = version;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public boolean isPretty() {
        return pretty;
    }

    public void setPretty(boolean pretty) {
        this.pretty = pretty;
    }
}
