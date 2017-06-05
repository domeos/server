package org.domeos.framework.engine.k8s.updater;

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.Job;
import io.fabric8.kubernetes.api.model.JobBuilder;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.engine.k8s.DownwardAPIUtil;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by feiliu206363 on 2017/1/10.
 */
@Component
@DependsOn("globalBiz")
public class DeploymentUpdateJob {
    static GlobalBiz globalBiz;

    public DeploymentUpdateJob() {
    }

    @Autowired
    public void setGlobalBiz(GlobalBiz globalBiz) {
        DeploymentUpdateJob.globalBiz = globalBiz;
    }

    public static Job createUpdateJob(int deployId, int versionId, String deployName, String jobName, List<String> args) {
        Map<String, String> jobLabels = new HashMap<>();
        jobLabels.put(GlobalConstant.JOB_DEPLOY_ID_STR, String.valueOf(deployId));
        jobLabels.put(GlobalConstant.JOB_STR, String.valueOf(System.currentTimeMillis()));

        Map<String, String> labelSelector = new HashMap<>();
        jobLabels.put(GlobalConstant.JOB_DEPLOY_ID_STR, String.valueOf(deployId));
        labelSelector.put(GlobalConstant.VERSION_STR, String.valueOf(versionId));
        labelSelector.put(GlobalConstant.JOB_STR, String.valueOf(System.currentTimeMillis()));

        String image = globalBiz.getUpdateJobImage();
        List<Container> containers = new ArrayList<>();
        Container container = new ContainerBuilder().withName(GlobalConstant.RC_NAME_PREFIX + deployName).withImage(image).withArgs(args)
                .withEnv(DownwardAPIUtil.generateDownwardEnvs()).withImagePullPolicy("Always").build();
        containers.add(container);

        return new JobBuilder()
                .withNewMetadata()
                .withName(jobName)
                .withLabels(jobLabels)
                .endMetadata()
                .withNewSpec()
                .withNewSelector().withMatchLabels(labelSelector).endSelector()
                .withNewTemplate()
                .withNewMetadata().withLabels(labelSelector).endMetadata()
                .withNewSpec().withContainers(containers).withRestartPolicy("Never").endSpec()
                .endTemplate()
                .endSpec()
                .build();
    }

}
