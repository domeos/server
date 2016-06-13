package org.domeos.client.kubernetesclient;

/**
 * Created by anningluo on 15-11-26.
 */
public enum KubeAPIVersion {
    v1,
    v1beta1,
    unversioned;
    public String toString() {
        switch (this) {
            case v1beta1:
                return "extensions/v1beta1";
            default:
                return name();
        }
    }
}
