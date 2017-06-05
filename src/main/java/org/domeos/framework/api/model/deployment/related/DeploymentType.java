package org.domeos.framework.api.model.deployment.related;

/**
 * Created by KaiRen on 2016/10/12.
 */
public enum DeploymentType {
    REPLICATIONCONTROLLER("org.domeos.framework.engine.k8s.handler.impl.ReplicationControllerDeployHandler", "RC"),
    DAEMONSET("org.domeos.framework.engine.k8s.handler.impl.DaemonSetDeployHandler", "DaemonSet"),
    DEPLOYMENT("org.domeos.framework.engine.k8s.handler.impl.DeploymentDeployHandler", "Deployment");
    String deployClassName;
    String showName;

    DeploymentType(String deployClassName, String showName) {
        this.deployClassName = deployClassName;
        this.showName = showName;
    }

    public String getDeployClassName() {
        return deployClassName;
    }

    public void setDeployClassName(String deployClassName) {
        this.deployClassName = deployClassName;
    }

    public String getShowName() {
        return showName;
    }

    public void setShowName(String showName) {
        this.showName = showName;
    }
}
