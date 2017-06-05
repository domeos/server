package org.domeos.framework.engine.k8s.util;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.api.model.extensions.DaemonSet;
import io.fabric8.kubernetes.api.model.extensions.Deployment;

import java.util.List;
import java.util.Map;

/**
 * Created by KaiRen on 2016/11/25.
 */
public class ModelFormatUtils {

    public static void format(ReplicationController rc) {
        if (rc.getMetadata() != null) {
            ModelFormatUtils.format(rc.getMetadata());
        }
        if (rc.getSpec() != null) {
            if (isSizeZero(rc.getSpec().getSelector())) {
                rc.getSpec().setSelector(null);
            }
            if (rc.getSpec().getTemplate() != null) {
                ModelFormatUtils.format(rc.getSpec().getTemplate());
            }
        }
    }

    public static void format(DaemonSet ds) {
        if (ds.getMetadata() != null) {
            ModelFormatUtils.format(ds.getMetadata());
        }
        if (ds.getSpec() != null) {
            if (ds.getSpec().getSelector() != null) {
                ModelFormatUtils.format(ds.getSpec().getSelector());
            }
            if (ds.getSpec().getTemplate() != null) {
                ModelFormatUtils.format(ds.getSpec().getTemplate());
            }
        }
    }

    public static void format(Deployment deployment) {
        if (deployment.getMetadata() != null) {
            ModelFormatUtils.format(deployment.getMetadata());
        }
        if (deployment.getSpec() != null) {
            if (deployment.getSpec().getSelector() != null) {
                ModelFormatUtils.format(deployment.getSpec().getSelector());
            }
            if (deployment.getSpec().getTemplate() != null) {
                ModelFormatUtils.format(deployment.getSpec().getTemplate());
            }
        }
    }

    public static void format(PodTemplateSpec podTemplateSpec) {
        if (podTemplateSpec.getMetadata() != null) {
            format(podTemplateSpec.getMetadata());
        }
        if (podTemplateSpec.getSpec() != null) {
            format(podTemplateSpec.getSpec());
        }
    }

    public static void format(io.fabric8.kubernetes.api.model.LabelSelector labelSelector) {
        if (isSizeZero(labelSelector.getMatchLabels())) {
            labelSelector.setMatchLabels(null);
        }
        if (isSizeZero(labelSelector.getMatchExpressions())) {
            labelSelector.setMatchExpressions(null);
        }
    }

    public static void format(ObjectMeta objectMeta) {
        if (isSizeZero(objectMeta.getAnnotations())) {
            objectMeta.setAnnotations(null);

        }
        if (isSizeZero(objectMeta.getFinalizers())) {
            objectMeta.setFinalizers(null);
        }
        if (isSizeZero(objectMeta.getOwnerReferences())) {
            objectMeta.setOwnerReferences(null);
        }
    }

    public static void format(PodSpec podSpec) {
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

    private static boolean isSizeZero(List list) {
        return list != null && list.size() == 0;
    }

    private static boolean isSizeZero(Map map) {
        return map != null && map.size() == 0;
    }
}
