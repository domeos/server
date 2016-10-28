package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.api.model.extensions.Job;
import io.fabric8.kubernetes.api.model.extensions.JobSpec;
import io.fabric8.kubernetes.client.dsl.LogWatch;
import org.domeos.exception.JobLogException;
import org.domeos.exception.JobNotFoundException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.service.project.impl.KubeServiceInfo;
import org.domeos.framework.engine.k8s.util.*;
import org.domeos.framework.engine.model.JobType;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.*;

/**
 * Created by feiliu206363 on 2015/12/6.
 */
public class JobWrapper {
    private static Logger logger = LoggerFactory.getLogger(JobWrapper.class);
    private KubeUtils client;

    public JobWrapper init() throws Exception {
        CiCluster ciCluster = KubeServiceInfo.getCiCluster();
        if (ciCluster == null) {
            throw new Exception("ci cluster info must be set");
        }

        // TODO: add auth to ci cluster!
        Cluster cluster = new Cluster();
        cluster.setApi(ciCluster.getHost());
        cluster.setUsername(ciCluster.getUsername());
        cluster.setPassword(ciCluster.getPassword());
        cluster.setOauthToken(ciCluster.getOauthToken());

        // TODO: when we have different cluster type, should add more op here
        client = Fabric8KubeUtils.buildKubeUtils(cluster, ciCluster.getNamespace());
        //kubernetesClient = (KubernetesClient) client.getClient();
        return this;
    }

    public String sendJob (Job job) throws JobNotFoundException {
        try {
            //return kubernetesClient.createJob(job);
            //return kubernetesClient.extensions().jobs().create(job);
            Job jobInfo = client.createJob(job);
            if (jobInfo == null || jobInfo.getMetadata() == null) {

                throw new JobNotFoundException("create job error");
            }

            return jobInfo.getMetadata().getName();
        } catch (K8sDriverException | IOException e) {
            logger.warn("send job error, message is " + e.getMessage());
            return null;
        }
    }

    public Job generateJob(String image, Map<String, String> envMap) {
        String secret = "build-" + UUID.randomUUID().toString();
        Map<String, String> nodeSelector = new HashMap<>();
        nodeSelector.put("BUILDENV", "HOSTENVTYPE");
        //PodSpec podSpec = new PodSpec().putVolumes(fetchBuildVolumes())
        //        .putContainers(fetcthContainer(secret, image, envVar))
        //        .putRestartPolicy("Never").putNodeSelector(nodeSelector);
        PodSpec podSpec = new PodSpec();
        podSpec.setVolumes(fetchBuildVolumes());
        List<EnvVar>envVars = new LinkedList<>();
        for (Map.Entry<String, String> entry : envMap.entrySet()) {
            envVars.add(new EnvVarBuilder().withName(entry.getKey()).withValue(entry.getValue()).build());
        }
        podSpec.setContainers(fetcthContainer(secret, image, envVars));
        podSpec.setRestartPolicy("Never");
        podSpec.setNodeSelector(nodeSelector);
        ObjectMeta podMetaData = new ObjectMeta();
        podMetaData.setLabels(fetchBuildLabel(secret));
        PodTemplateSpec podTempSpec = new PodTemplateSpec();
        podTempSpec.setMetadata(podMetaData);
        podTempSpec.setSpec(podSpec);
        JobSpec jobSpec = new JobSpec();
        jobSpec.setTemplate(podTempSpec);
        ObjectMeta metaData = new ObjectMeta();
        metaData.setName(secret);
        Job job = new Job();
        job.setMetadata(metaData);
        job.setSpec(jobSpec);
        return job;
    }

    public LogWatch fetchJobLogs(int buildId, JobType type) throws JobNotFoundException, JobLogException {
        try {
            String taskName = KubeServiceInfo.getBuildTaskNameByIdAndType(buildId, type);
            //Job job = kubernetesClient.extensions().jobs().withName(taskName).get();
            Job job = client.getJob(taskName);
            if (job == null) {
                throw new JobNotFoundException("no job info");
            }
            //PodList pods = kubernetesClient.pods().inAnyNamespace().withLabels(job.getSpec().getTemplate().getMetadata().getLabels()).list();
            PodList pods = client.listAllPod(job.getSpec().getTemplate().getMetadata().getLabels());
            if (pods == null) {
                throw new JobNotFoundException("no pod info");
            }
            //kubeClient.tailfLog(KubeClientUtils.getPodName(pods.getItems()[0]),
            //        KubeClientUtils.getContainerName(KubeClientUtils.getContainers(pods.getItems()[0])[0]),
            //        false, handler);
            // TODO: this logic should be put into Fabric8KubeUtils // Luyue
            Pod pod = pods.getItems().get(0);
            Container container = pod.getSpec().getContainers().get(0);
            return (LogWatch) client.tailfLog(KubeClientUtils.getPodName(pod), KubeClientUtils.getContainerName(container), 10);

        } catch (K8sDriverException | IOException e) {
            logger.warn("fetch job log error, " + e.getMessage());
            throw new JobLogException(e.getMessage());
        }
    }

    public PodBriefStatus fetchJobStatus(int buildId, JobType type) {
        try {
            String taskName = KubeServiceInfo.getBuildTaskNameByIdAndType(buildId, type);
            //Job job = kubeClient.getJob(taskName);
            //Job job = kubernetesClient.extensions().jobs().withName(taskName).get();
            Job job = client.getJob(taskName);
            if (job != null) {
                PodList podList = client.listPod(job.getSpec().getTemplate().getMetadata().getLabels());
                // TODO: this logic should be put into Fabric8KubeUtils // Luyue
                //PodList podList = kubernetesClient.pods().withLabels(job.getSpec().getTemplate().getMetadata().getLabels()).list();
                if (podList.getItems() != null && podList.getItems().size() > 0) {
                    return PodUtils.getStatus(podList.getItems().get(0));  //paste PodBriefStatus to DomeOS
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (K8sDriverException | IOException e) {
            logger.warn("get job status error, message is " + e.getMessage());
            return null;
        }
    }

    public boolean deleteJob(int buildId, JobType type) {
        try {
            String taskName = KubeServiceInfo.getBuildTaskNameByIdAndType(buildId, type);
            //kubernetesClient.extensions().jobs().withName(taskName).delete();
            client.deleteJob(taskName);
            return true;
        } catch (K8sDriverException | IOException e) {
            logger.warn("delete job error, message is " + e.getMessage());
            return false;
        }
    }

    private List<Volume> fetchBuildVolumes() {
        List<Volume> volumes = new ArrayList<>();
        //volumes[0] = new Volume().putName("v1").putHostPath(new HostPathVolumeSource().putPath("/var/run/docker.sock"));
        //volumes[1] = new Volume().putName("v2").putEmptyDir(new EmptyDirVolumeSource());
        Volume volume0 = new Volume();
        Volume volume1 = new Volume();
        HostPathVolumeSource hostPathVolumeSource = new HostPathVolumeSource();
        hostPathVolumeSource.setPath("/var/run/docker.sock");
        volume0.setName("v1");
        volume0.setHostPath(hostPathVolumeSource);
        volumes.add(volume0);
        volume1.setName("v2");
        volume1.setEmptyDir(new EmptyDirVolumeSource());
        volumes.add(volume1);
        return volumes;
    }

    private Map<String, String> fetchBuildLabel(String value) {
        Map<String, String> label = new HashMap<>();
        label.put("build", value);
        return label;
    }

    private List<Container> fetcthContainer(String name, String image, List<EnvVar> envVars) {
        //Container[] container = new Container[]{new Container()};
        List<Container> containers = new ArrayList<>();
        Container container = new Container();
        container.setName(name);
        container.setImage(image);
        List<VolumeMount> mountPoint = new ArrayList<>();
        VolumeMount mountPoint0 = new VolumeMount();
        VolumeMount mountPoint1 = new VolumeMount();
        mountPoint0.setName("v1");
        mountPoint0.setMountPath("/var/run/docker.sock");
        mountPoint1.setName("v2");
        mountPoint1.setMountPath(GlobalConstant.BUILD_CODE_PATH);
        mountPoint.add(mountPoint0);
        mountPoint.add(mountPoint1);
        container.setVolumeMounts(mountPoint);
        container.setEnv(envVars);
        container.setImagePullPolicy("Always");
        containers.add(container);
        return containers;
    }
}
