package org.domeos.framework.api.consolemodel.deployment;

/**
 * Created by KaiRen on 2016/10/19.
 */
public class VersionString {
    private String podSpecStr;
    private String deploymentStr;
    private String deploymentStrHead;
    private String deploymentStrTail;
    private int indent;

    public VersionString() {
    }

    public String getPodSpecStr() {
        return podSpecStr;
    }

    public void setPodSpecStr(String podSpecStr) {
        this.podSpecStr = podSpecStr;
    }

    public String getDeploymentStr() {
        return deploymentStr;
    }

    public void setDeploymentStr(String deploymentStr) {
        this.deploymentStr = deploymentStr;
    }

    public String getDeploymentStrHead() {
        return deploymentStrHead;
    }

    public void setDeploymentStrHead(String deploymentStrHead) {
        this.deploymentStrHead = deploymentStrHead;
    }

    public String getDeploymentStrTail() {
        return deploymentStrTail;
    }

    public void setDeploymentStrTail(String deploymentStrTail) {
        this.deploymentStrTail = deploymentStrTail;
    }

    public int getIndent() {
        return indent;
    }

    public void setIndent(int indent) {
        this.indent = indent;
    }
}
