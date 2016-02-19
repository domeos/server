package org.domeos.job;

import org.domeos.api.model.ci.ContainerLogHandler;
import org.domeos.api.model.ci.KubeBuild;
import org.domeos.api.model.cluster.CiCluster;
import org.domeos.api.service.ci.impl.KubeServiceInfo;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.KubeClientContext;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobSpec;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.KubeClientUtils;
import org.domeos.client.kubernetesclient.util.PodBriefStatus;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.exception.JobLogException;
import org.domeos.exception.JobNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Created by feiliu206363 on 2015/12/6.
 */
public class JobWrapper {
    private static Logger logger = LoggerFactory.getLogger(JobWrapper.class);
    private KubeClient kubeClient;


    public JobWrapper init() throws Exception {
        CiCluster ciCluster = KubeServiceInfo.getCiCluster();
        if (ciCluster == null) {
            throw new Exception("ci cluster info must be set");
        }
        KubeClientContext context = new KubeClientContext();
        context.setNamespace(ciCluster.getNamespace());
        context.setPretty(false);
        kubeClient = new KubeClient(ciCluster.getHost(), context);
        return this;
    }

    public Job sendJob(Job job) {
        try {
            return kubeClient.createJob(job);
        } catch (KubeInternalErrorException | IOException | KubeResponseException e) {
            logger.warn("send job error, message is " + e.getMessage());
            return null;
        }
    }

    public Job generateJob(String image, EnvVar[] envVar) {
        String secret = "build-" + UUID.randomUUID().toString();
        Map<String, String> nodeSelector = new HashMap<>();
        nodeSelector.put("BUILDENV", "HOSTENVTYPE");
        PodSpec podSpec = new PodSpec().putVolumes(fetchBuildVolumes()).putContainers(fetcthContainer(secret, image, envVar)).putRestartPolicy("Never").putNodeSelector(nodeSelector);
        ObjectMeta podMetaData = new ObjectMeta().putLabels(fetchBuildLabel(secret));
        PodTemplateSpec podTempSpec = new PodTemplateSpec().putMetadata(podMetaData).putSpec(podSpec);
        JobSpec jobSpec = new JobSpec().putTemplate(podTempSpec);
        ObjectMeta metaData = new ObjectMeta().putName(secret);
        return new Job().putMetadata(metaData).putSpec(jobSpec);
    }

    public void fetchJobLogs(int buildId, ContainerLogHandler handler) throws JobNotFoundException, JobLogException {
        try {
            KubeBuild kubeBuild = KubeServiceInfo.getKubeBuildById(buildId);
            if (kubeBuild == null) {
                throw new JobNotFoundException("build id not found in database");
            }
            Job job = kubeClient.getJob(kubeBuild.getJobName());
            if (job == null) {
                throw new JobNotFoundException("no job info");
            }
            PodList pods = kubeClient.listPod(job.getSpec().getTemplate().getMetadata().getLabels());
            if (pods == null) {
                throw new JobNotFoundException("no pod info");
            }
            kubeClient.tailfLog(KubeClientUtils.getPodName(pods.getItems()[0]),
                    KubeClientUtils.getContainerName(KubeClientUtils.getContainers(pods.getItems()[0])[0]),
                    false, handler);
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            logger.warn("fetch job log error, " + e.getMessage());
            throw new JobLogException(e.getMessage());
        }
    }

    public PodBriefStatus fetchJobStatus(int buildId) {
        try {
            KubeBuild kubeBuild = KubeServiceInfo.getKubeBuildById(buildId);
            if (kubeBuild == null) {
                return null;
            }
            Job job = kubeClient.getJob(kubeBuild.getJobName());
            if (job != null) {
                PodList podList = kubeClient.listPod(job.getSpec().getTemplate().getMetadata().getLabels());
                if (podList.getItems() != null && podList.getItems().length > 0) {
                    return PodUtils.getStatus(podList.getItems()[0]);
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            logger.warn("get job status error, message is " + e.getMessage());
            return null;
        }
    }

    public boolean deleteJob(int buildId) {
        try {
            KubeBuild kubeBuild = KubeServiceInfo.getKubeBuildById(buildId);
            if (kubeBuild == null) {
                return false;
            }
            kubeClient.deleteJob(kubeBuild.getJobName());
            return true;
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            logger.warn("delete job error, message is " + e.getMessage());
            return false;
        }
    }

    public Volume[] fetchBuildVolumes() {
        Volume[] volumes = new Volume[3];
        volumes[0] = new Volume().putName("v1").putHostPath(new HostPathVolumeSource().putPath("/var/run/docker.sock"));
        volumes[1] = new Volume().putName("v2").putHostPath(new HostPathVolumeSource().putPath("/usr/bin/docker"));
        volumes[2] = new Volume().putName("v3").putHostPath(new HostPathVolumeSource().putPath("/lib64"));
        return volumes;
    }

    public Map<String, String> fetchBuildLabel(String value) {
        Map<String, String> label = new HashMap<>();
        label.put("build", value);
        return label;
    }

    public Container[] fetcthContainer(String name, String image, EnvVar[] envVars) {
        Container[] container = new Container[]{new Container()};
        container[0].setName(name);
        container[0].setImage(image);
        VolumeMount[] mountPoint = new VolumeMount[3];
        mountPoint[0] = new VolumeMount().putName("v1").putMountPath("/var/run/docker.sock");
        mountPoint[1] = new VolumeMount().putName("v2").putMountPath("/usr/bin/docker");
        mountPoint[2] = new VolumeMount().putName("v3").putMountPath("/lib64").putReadOnly(true);
        container[0].putVolumeMounts(mountPoint);
        container[0].putEnv(envVars);
        container[0].putImagePullPolicy("Always");
        return container;
    }
}
