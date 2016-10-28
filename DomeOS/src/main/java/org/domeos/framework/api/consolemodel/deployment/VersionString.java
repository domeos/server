package org.domeos.framework.api.consolemodel.deployment;

import io.fabric8.kubernetes.api.KubernetesHelper;
import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.PodSpec;
import io.fabric8.kubernetes.api.model.ReplicationController;
import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.model.deployment.related.VersionType;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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

    public static VersionString getRCStr(ReplicationController replicationController, VersionType versionType) {
        VersionString versionString = new VersionString();
        format(replicationController);
        try {
            if (versionType == VersionType.YAML) {
                String deploymentStr = KubernetesHelper.toYaml(replicationController);
                versionString.setDeploymentStr(deploymentStr);
                replicationController.getSpec().getTemplate().setSpec(null);
                String deploymentStrHead = KubernetesHelper.toYaml(replicationController) + "\n    spec:\n";
                versionString.setDeploymentStrHead(deploymentStrHead);
                versionString.setDeploymentStrTail("");
                versionString.setIndent(4);
                return versionString;
            } else if (versionType == VersionType.JSON) {
                String deploymentStr = KubernetesHelper.toPrettyJson(replicationController);
                versionString.setDeploymentStr(deploymentStr);
                replicationController.getSpec().getTemplate().setSpec(null);
                deploymentStr = KubernetesHelper.toPrettyJson(replicationController);
                String str[] = deploymentStr.split("\n");
                String headStr[] = new String[str.length - 3];
                String tailStr[] = new String[3];
                System.arraycopy(str, 0, headStr, 0, headStr.length);
                System.arraycopy(str, str.length-3, tailStr, 0, tailStr.length);
                String deploymentStrHeader = StringUtils.join(headStr, "\n") + "\n      \"spec\" : ";
                String deploymentStrtail = StringUtils.join(tailStr, "\n");
                versionString.setDeploymentStrHead(deploymentStrHeader);
                versionString.setDeploymentStrTail(deploymentStrtail);
                versionString.setIndent(6);
                return versionString;

            } else {
                return null;
            }
        } catch (IOException e) {
            return null;
        }
    }

    private static ReplicationController format(ReplicationController rc) {
        if (rc.getMetadata() != null) {
            if (isSizeZero(rc.getMetadata().getAnnotations())) {
                rc.getMetadata().setAnnotations(null);

            }
        }
        if (rc.getSpec() != null) {
            if (isSizeZero(rc.getSpec().getSelector())) {
                rc.getSpec().setSelector(null);
            }
            if (rc.getSpec().getTemplate() != null && rc.getSpec().getTemplate().getSpec() != null) {
                PodSpec podSpec = rc.getSpec().getTemplate().getSpec();
                if (isSizeZero(podSpec.getVolumes())) {
                    podSpec.setVolumes(null);
                }
                if (isSizeZero(podSpec.getImagePullSecrets())) {
                    podSpec.setImagePullSecrets(null);
                }
                if (isSizeZero(podSpec.getContainers())) {
                    podSpec.setContainers(null);
                } else if (podSpec.getContainers() !=null) {
                    for (Container container : podSpec.getContainers()) {
                        if (isSizeZero(container.getArgs())) {
                            container.setArgs(null);
                        }
                        if (isSizeZero(container.getCommand())) {
                            container.setCommand(null);
                        }
                        if (isSizeZero(container.getEnv())) {
                            container.setEnv(null);
                        }
                        if (isSizeZero(container.getPorts())) {
                            container.setPorts(null);
                        }
                        if (isSizeZero(container.getVolumeMounts())) {
                            container.setVolumeMounts(null);
                        }
                    }
                }
            }
        }
        return rc;
    }

    private static boolean isSizeZero(List list) {
        return list != null && list.size() == 0;
    }

    private static boolean isSizeZero(Map map) {
        return map != null && map.size() == 0;
    }
}
