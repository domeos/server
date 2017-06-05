package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.*;
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

    public String sendJob(Job job) throws JobNotFoundException, K8sDriverException {
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
            throw e;
        }
    }

    public Job generateJob(String image, Map<String, String> envMap) {
        String secret = "build-" + UUID.randomUUID().toString();
        Map<String, String> nodeSelector = new HashMap<>();
        nodeSelector.put("BUILDENV", "HOSTENVTYPE");
        //PodSpec podSpec = new PodSpec().putVolumes(fetchBuildVolumes())
        //        .putContainers(fetcthContainer(secret, image, envVar))
        //        .putRestartPolicy("Never").putNodeSelector(nodeSelector);
        List<EnvVar> envVars = new LinkedList<>();
        for (Map.Entry<String, String> entry : envMap.entrySet()) {
            envVars.add(new EnvVarBuilder().withName(entry.getKey()).withValue(entry.getValue()).build());
        }
        return new JobBuilder()
                .withNewMetadata()
                .withName(secret)
                .endMetadata()
                .withNewSpec()
                .withNewTemplate()
                .withNewMetadata()
                .withLabels(fetchBuildLabel(secret))
                .endMetadata()
                .withNewSpec()
                .withVolumes(fetchBuildVolumes())
                .withContainers(fetchContainer(secret, image, envVars))
                .withRestartPolicy("Never")
                .withNodeSelector(nodeSelector)
                .endSpec()
                .endTemplate()
                .endSpec()
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
        List<Volume> volumes = new ArrayList<>(3);
        //volumes[0] = new Volume().putName("v1").putHostPath(new HostPathVolumeSource().putPath("/var/run/docker.sock"));
        //volumes[1] = new Volume().putName("v2").putEmptyDir(new EmptyDirVolumeSource());
        volumes.add(new VolumeBuilder()
                .withName("v1")
                .withNewHostPath("/var/run/docker.sock")
                .build());
        volumes.add(new VolumeBuilder()
                .withName("v2")
                .withNewEmptyDir()
                .endEmptyDir()
                .build());
        volumes.add(new VolumeBuilder()
                .withName("v3")
                .withNewEmptyDir()
                .endEmptyDir()
                .build());
        return volumes;
    }

    private Map<String, String> fetchBuildLabel(String value) {
        Map<String, String> label = new HashMap<>();
        label.put("build", value);
        return label;
    }

    private List<Container> fetchContainer(String name, String image, List<EnvVar> envVars) {
        //Container[] container = new Container[]{new Container()};
        List<Container> containers = new ArrayList<>(1);
        containers.add(new ContainerBuilder()
                .withName(name)
                .withImage(image)
                .addNewVolumeMount()
                .withName("v1")
                .withMountPath("/var/run/docker.sock")
                .endVolumeMount()
                .addNewVolumeMount()
                .withName("v2")
                .withMountPath(GlobalConstant.BUILD_CODE_PATH)
                .endVolumeMount()
                .addNewVolumeMount()
                .withName("v3")
                .withMountPath(GlobalConstant.BUILD_GENERATE_PATH)
                .endVolumeMount()
                .withImagePullPolicy("Always")
                .withEnv(envVars)
                .build());
        return containers;
    }
}
