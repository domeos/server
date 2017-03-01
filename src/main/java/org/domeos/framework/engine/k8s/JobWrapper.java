package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.client.dsl.LogWatch;
import org.domeos.exception.JobLogException;
import org.domeos.exception.JobNotFoundException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.service.project.impl.KubeServiceInfo;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.domeos.framework.engine.model.JobType;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

        Cluster cluster = ciCluster.buildCluster();

        // TODO: when we have different cluster type, should add more op here
        client = Fabric8KubeUtils.buildKubeUtils(cluster, ciCluster.getNamespace());
        return this;
    }

    public String sendJob(Job job) throws JobNotFoundException {
        try {
            //return kubernetesClient.createJob(job);
            //return kubernetesClient.extensions().jobs().create(job);
            Job jobInfo = client.createJob(job);
            if (jobInfo == null || jobInfo.getMetadata() == null) {

                throw new JobNotFoundException("create job error");
            }

            return jobInfo.getMetadata().getName();
        } catch (K8sDriverException e) {
            logger.warn("send job error, message is " + e.getMessage());
            throw new JobNotFoundException("create job error, message: " + e.getMessage());
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
        List<EnvVar> envVars = new LinkedList<>();
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
        return new JobBuilder()
                .withMetadata(metaData)
                .withSpec(jobSpec)
                .build();
    }

    public LogWatch fetchJobLogs(int buildId, JobType type) throws JobNotFoundException, JobLogException {
        try {
            String taskName = KubeServiceInfo.getBuildTaskNameByIdAndType(buildId, type);
            Job job = client.getJob(taskName);
            if (job == null) {
                throw new JobNotFoundException("no job info");
            }
            PodList pods = client.listAllPod(job.getSpec().getTemplate().getMetadata().getLabels());
            if (pods == null) {
                throw new JobNotFoundException("no pod info");
            }
            // TODO: this logic should be put into Fabric8KubeUtils // Luyue
            Pod pod = pods.getItems().get(0);
            if (pod == null || pod.getMetadata() == null || pod.getSpec() == null) {
                throw new K8sDriverException("pod info is null");
            }
            Container container = pod.getSpec().getContainers().get(0);
            if (container == null) {
                throw new K8sDriverException("container info is null");
            }
            return (LogWatch) client.tailfLog(pod.getMetadata().getName(), container.getName(), 10);

        } catch (K8sDriverException e) {
            logger.warn("fetch job log error, " + e.getMessage());
            throw new JobLogException(e.getMessage());
        }
    }

    public String fetchJobStatus(int buildId, JobType type) {
        try {
            String taskName = KubeServiceInfo.getBuildTaskNameByIdAndType(buildId, type);
            Job job = client.getJob(taskName);
            if (job != null) {
                PodList podList = client.listPod(job.getSpec().getTemplate().getMetadata().getLabels());
                if (podList.getItems() != null && podList.getItems().size() > 0) {
                    return PodUtils.getPodStatus(podList.getItems().get(0));  //paste PodBriefStatus to DomeOS
                } else {
                    return "Preparing";
                }
            } else {
                return null;
            }
        } catch (K8sDriverException e) {
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
        } catch (K8sDriverException e) {
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
