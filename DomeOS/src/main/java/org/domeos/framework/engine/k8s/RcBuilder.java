package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.api.model.Container;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.engine.k8s.util.StringUtils;
import org.domeos.global.GlobalConstant;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Created by sparkchen on 16/4/6.
 */
public class RcBuilder {
    Deployment deployment;
    Version version;
    List<LoadBalancer> loadBalancers;
    List<EnvDraft> extraEnvs;
    int replicas;
    int index = -1;
    List<String> nodeIpList = null;

    public RcBuilder() {
    }

    public RcBuilder(Deployment deployment, List<LoadBalancer> loadBalancers, Version version, List<EnvDraft> extraEnvs, int replicas) {
        this.deployment = deployment;
        this.loadBalancers = loadBalancers;
        this.version = version;
        this.extraEnvs = extraEnvs;
        this.replicas = replicas;
    }

    public ReplicationController build() {
        return buildReplicationController();
    }

    // may modify version
    public ReplicationController buildReplicationController() {
        if (deployment == null || version == null) {
            return null;
        }
        if (!deployment.isStateful()) {
            index = -1;
        } else if (nodeIpList == null
            || version.getHostList() == null
            || index < 0
            || index >= version.getHostList().size()) {
            return null;
        }
        // * init rc metadate
        String rcName = null;
        Map<String, String> rcLabel = buildRCLabelWithSpecifyVersion(deployment, version);
        if (index < 0) {
            rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + version.getVersion();
        } else {
            rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + version.getVersion() + "-i" + index;
            addIndex(rcLabel, index);
        }

        ReplicationController rc = new ReplicationControllerBuilder()
                .withNewMetadata().withName(rcName.toLowerCase())
                .withLabels(rcLabel)
                .withNamespace(deployment.getNamespace()).endMetadata().build();

        // * init rc spec
        ReplicationControllerSpec rcSpec = new ReplicationControllerSpec();
        Map<String, String> rcSelector = buildRCSelectorWithSpecifyVersion();
        if (index < 0) {
            rcSpec.setReplicas(deployment.getDefaultReplicas());
        } else {
            rcSpec.setReplicas(1);
            addIndex(rcSelector, index);
        }
        // ** init pod template
        Map<String, String> annotations = new HashMap<>();
        annotations.put("deployName", deployment.getName());
//        DeploymentExtra extra = deployment.getDeploymentExtra();
//        if (extra != null) {
//            annotations.put("accessType", extra.getDeploymentAccessType().toString());
//        }
        // TODO (openxxs) tmp solution: for old load balancer
        Map<String, String> podLabels = buildRCLabelWithSpecifyVersionAndLoadBalancer(deployment, version, loadBalancers);

        rcSpec = new ReplicationControllerSpecBuilder(rcSpec)
                .withNewTemplate()
                .withNewMetadata()
                .withLabels(podLabels)
                .withAnnotations(annotations)
                .withDeletionGracePeriodSeconds(0L)
                .endMetadata()
                .endTemplate().build();
//        rcSpec.putTemplate(new PodTemplateSpec())
//            .getTemplate()
//            .putMetadata(new ObjectMeta())
//            .getMetadata()
//            // TODO (openxxs) tmp solution: for old load balancer
//            .putLabels(podLabels)
////            .putLabels(rcSelector)
//            .putAnnotations(annotations)
//            .putDeletionGracePeriodSeconds(0);
        // *** create node selector


        PodSpec podSpec = new PodSpec();
        if (!StringUtils.isBlank(version.getPodSpecStr())) {
            podSpec = version.toPodSpec();
            Map<String, String> nodeSelector;
            if (podSpec.getNodeSelector() == null) {
                nodeSelector = new HashMap<>();
            } else {
                nodeSelector = podSpec.getNodeSelector();
            }
            List<LabelSelector> selectors = version.getLabelSelectors();
            if (selectors != null) {
                for (LabelSelector selector : version.getLabelSelectors()) {
                    if (selector.getName() == null) {
                        continue;
                    }
                    if (selector.getContent() == null) {
                        selector.setContent("");
                    }
                    nodeSelector.put(selector.getName(), selector.getContent());
                }
            }
            podSpec.setNodeSelector(nodeSelector);
            rcSpec.getTemplate().setSpec(podSpec);
        } else {
            podSpec.setHostNetwork(deployment.getNetworkMode() == NetworkMode.HOST);
            rcSpec.getTemplate().setSpec(podSpec);
            if (index < 0) {
                Map<String, String> nodeSelector = new HashMap<>();
                List<LabelSelector> selectors = version.getLabelSelectors();
                if (selectors != null) {
                    for (LabelSelector selector : version.getLabelSelectors()) {
                        if (selector.getName() == null) {
                            continue;
                        }
                        if (selector.getContent() == null) {
                            selector.setContent("");
                        }
                        nodeSelector.put(selector.getName(), selector.getContent());
                    }
                }
                rcSpec.getTemplate().getSpec().setNodeSelector(nodeSelector);
            } else if (index < version.getHostList().size()) {
                String nodeName = version.getHostList().get(index);
                rcSpec.getTemplate().getSpec()
                        .setNodeName(nodeName);
            } else {
                return null;
            }
        /*
        if (deployment.getHostEnv() != null) {
            nodeSelector.put("hostEnv", deployment.getHostEnv().toString());
        }
        */
            // *** init container and node selector
        /*
        if (index >= 0 && index < version.getHostList().size()) {
            addHostNetworkEnvs(deployment, version);
        }
        */
            List<Container> containers = buildContainer(deployment, version, index, nodeIpList, extraEnvs);
            if (containers == null) {
                return null;
            }
            rcSpec.getTemplate()
                    .getSpec()
                    .setContainers(containers);
            // if configure to autoCollect or autoDelete log, need to set volumes
            // so that data can be shared accross different containers in a Pod
            if (version.getLogDraft() != null) {
                List<Volume> volumes;
                if (version.getLogDraft().getLogItemDrafts() != null) {
                    volumes = LogDraft.formatPodVolume(version.getLogDraft()); // version 0.3
                } else {
                    volumes = LogDraft.formatPodVolume(version.getContainerDrafts()); // version > 0.3
                }
                if (volumes != null && volumes.size() > 0) {
                    rcSpec.getTemplate().getSpec().setVolumes(volumes);
                }
            }
        }
        rcSpec.setReplicas(replicas);
        rc.setSpec(rcSpec);
        return rc;
    }
    // buildRCSelector will decide which pods will be selected
    public Map<String, String> buildRCSelectorWithSpecifyVersion() {
        Map<String, String> selector = buildRCSelector(deployment);
        selector.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        return selector;
    }

    public static Map<String, String> buildRCSelector(Deployment deployment) {
        Map<String, String> selector = new HashMap<>();
        selector.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return selector;
    }

    public static void addIndex(Map<String, String> selector, int index) {
        selector.put("index", String.valueOf(index));
    }

    // these two function buildRCLabelWithSpecifyVersion and buildRCSelectorWithSpecifyVersion
    // are very important because they will get the basic information to query what RC and pod
    // a deployment occupy. And it will avoid overlap pods between different deployment and
    // different version
    public static Map<String, String> buildRCLabelWithSpecifyVersion(Deployment deployment, Version version) {
        Map<String, String> label = buildRCLabel(deployment);
        label.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        return label;
    }

    // TODO (openxxs) tmp solution: for old load balancer
    public static Map<String, String> buildRCLabelWithSpecifyVersionAndLoadBalancer(
            Deployment deployment, Version version, List<LoadBalancer> loadBalancers) {
        Map<String, String> label = buildRCLabel(deployment);
        label.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        if (loadBalancers != null) {
            for (LoadBalancer loadBalancer : loadBalancers) {
                label.put(GlobalConstant.WITH_LB_PREFIX + loadBalancer.getId(), GlobalConstant.WITH_LB_VALUE);
            }
        }
        return label;
    }

    public static Map<String, String> buildRCLabel(Deployment deployment) {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return label;
    }

    public static List<Container> buildContainer(Deployment deployment, Version version, int index,
                                             List<String> nodeIpList, List<EnvDraft> extraEnvs) {
        if (version == null || version.getContainerDrafts() == null
            || version.getContainerDrafts().size() == 0) {
            return null;
        }
        int size = version.getContainerDrafts().size();
        List<Container> containers = new ArrayList<>(size);

        List<EnvDraft> allExtraEnvs = new LinkedList<>();
        if (extraEnvs != null) {
            allExtraEnvs.addAll(extraEnvs);
        }
        if (index >= 0 && index < version.getHostList().size()) {
            List<EnvDraft> networkEnvs = buildHostNetworkEnvs(deployment, version, nodeIpList);
            if (networkEnvs != null) {
                allExtraEnvs.addAll(networkEnvs);
            }
        }
        allExtraEnvs.add(new EnvDraft("NETWORK_MODE", deployment.getNetworkMode().toString()));
        if (deployment.getExposePortNum() > 0) {
            allExtraEnvs.add(new EnvDraft("NEED_PORTS", String.valueOf(deployment.getExposePortNum())));
        }
        // idx used to distinguish container name
        int idx = 0;
        int logVolumeMountIdx = 1;  // logVolumeMountIdx to distinguish log volume seq
        for (ContainerDraft containerDraft : version.getContainerDrafts()) {
            Container container = new ContainerBuilder()
                    .withImage(containerDraft.formatImage() + ":" + containerDraft.getTag())
                    .withName(deployment.getName() + "-" + idx)
                    .withResources(formatResource(containerDraft))
                    .build();
            // ** ** add env
            List<EnvDraft> containerEnvs = new LinkedList<>();
            if (allExtraEnvs.size() > 0) {
                containerEnvs.addAll(allExtraEnvs);
            }
            if (containerDraft.getEnvs() != null) {
                containerEnvs.addAll(containerDraft.getEnvs());
            }
            if (index >= 0) {
                containerEnvs.add(new EnvDraft("HOST_INDEX", String.valueOf(index)));
                containerEnvs.add(new EnvDraft("HOST_SIZE", String.valueOf(version.getHostList().size())));
            }
            if (!checkEnv(containerEnvs, containerDraft.getEnvCheckers())) {
                return null;
            }
            List<EnvVar> envVarList = formatEnv(containerEnvs);
            envVarList.addAll(DownwardAPIUtil.generateDownwardEnvs());

            container.setEnv(envVarList);

            // health checker
            HealthChecker deploymentHealthChecker = deployment.getHealthChecker();
            HealthChecker containerHealthChecker = containerDraft.getHealthChecker();
            Probe probe;
            if (containerHealthChecker != null) {
                probe = buildProbe(containerHealthChecker);
            } else {
                probe = buildProbe(deploymentHealthChecker);
            }
            if (probe != null) {
                container.setLivenessProbe(probe);
            }

            // set image pulling policy, default is always
            container.setImagePullPolicy(containerDraft.getImagePullPolicy().name());

            // if configure to autoCollect or autoDelete log, need to set volumeMount
            // to make compitable for the old version
            // move List<LogItemDraft> from logDraft to container
            if (version.getLogDraft() != null ) {
                List<LogItemDraft> logItemDrafts = version.getLogDraft().getLogItemDrafts();  // version 0.3
                int increase = 0;
                if (logItemDrafts == null) {
                    logItemDrafts = containerDraft.getLogItemDrafts();  // version >= 0.4
                    increase = 1;
                }
                List<VolumeMount> volumeMounts = LogDraft.formatOriginalContainerVolumeMount(logItemDrafts, logVolumeMountIdx);
                if (volumeMounts != null && volumeMounts.size() > 0) {
                    container.setVolumeMounts(volumeMounts);
                    logVolumeMountIdx += (volumeMounts.size() * increase);
                }

            }
            containers.add(container);
            idx++;
        }
        // if configured to autoCollect or autoDelete log, then need to add flume-image container
        if (version.getLogDraft() != null) {
            LogDraft logDraft = version.getLogDraft();
            List<EnvVar> envVarList = new LinkedList<>();
            envVarList.addAll(formatEnv(allExtraEnvs));
            envVarList.addAll(DownwardAPIUtil.generateDownwardEnvs());
            if (logDraft.getLogItemDrafts() != null ) {
                envVarList.addAll(LogDraft.formatLogDraftEnv(logDraft));
            } else {
                envVarList.addAll(LogDraft.formatContainerLogEnv(logDraft.getKafkaBrokers(), version.getContainerDrafts()));
            }
            EnvVar[] envs = envVarList.toArray(new EnvVar[envVarList.size()]);
            List<VolumeMount> logVolumeMounts;
            if (logDraft.getLogItemDrafts() != null) {
                logVolumeMounts = LogDraft.formatFlumeContainerVolumeMount(logDraft);
            } else {
                logVolumeMounts = LogDraft.formatFlumeContainerVolumeMount(version.getContainerDrafts());
            }
            Container container = new ContainerBuilder()
                    .withImage(logDraft.getFlumeDraft().formatImage() + ":" + logDraft.getFlumeDraft().getTag())
                    .withName(deployment.getName() + "-" + idx)
                    .withEnv(envs)
                    .withVolumeMounts(logVolumeMounts)
                    .withResources(formatResource(logDraft.getFlumeDraft()))
                    .build();
            containers.add(container);
        }

        return containers;
    }

    private static Probe buildProbe(HealthChecker healthChecker) {
        if (healthChecker == null || healthChecker.getType().equals(HealthCheckerType.NONE)) {
            return null;
        }
        Probe probe = new Probe();
        probe.setTimeoutSeconds(healthChecker.getTimeout());
        probe.setInitialDelaySeconds(healthChecker.getDelay());
        switch (healthChecker.getType()) {
            case HTTP:
                HTTPGetAction httpGetAction = new HTTPGetAction();
                httpGetAction.setPath(healthChecker.getUrl());
                httpGetAction.setPort(new IntOrString(healthChecker.getPort()));
                probe.setHttpGet(httpGetAction);
                break;
            case TCP:
                TCPSocketAction tcpSocketAction = new TCPSocketAction();
                tcpSocketAction.setPort(new IntOrString(healthChecker.getPort()));
                probe.setTcpSocket(tcpSocketAction);
                break;
            default:
                return null;
        }
        return probe;
    }

    public static List<EnvVar> formatEnv(List<EnvDraft> envDrafts) {
        if (envDrafts == null || envDrafts.size() == 0) {
            return null;
        }
        List<EnvVar> envs = new LinkedList<>();
        for (EnvDraft envDraft : envDrafts) {
            EnvVar tmpEnv = new EnvVarBuilder()
                    .withName(envDraft.getKey())
                    .withValue(envDraft.getValue())
                    .build();
            envs.add(tmpEnv);
        }
        return envs;
    }

    public static ResourceRequirements formatResource(ContainerDraft containerDraft) {
        ResourceRequirements result = new ResourceRequirements();
        Map<String, Quantity> resource = new HashMap<>();
        if (containerDraft.getCpu() > 0) {
            resource.put("cpu", new Quantity(String.valueOf(containerDraft.getCpu())));
        }
        if (containerDraft.getMem() > 0) {
            resource.put("memory", new Quantity(String.valueOf(containerDraft.getMem()) + "Mi"));
        }
        result.setLimits(resource);
        return result;
    }

    public static List<EnvDraft> buildHostNetworkEnvs(Deployment deployment, Version version, List<String> nodeIpList) {
        int size = version.getHostList().size();
        List<EnvDraft> hostNetworkEnvs = new LinkedList<>();
        boolean isHostMode = deployment.getNetworkMode() == NetworkMode.HOST;
        hostNetworkEnvs.add(new EnvDraft("BASIC_SERVICE_NAME", formatEnvInPod(buildStatefulServiceName(deployment))));
        for (int i = 0; i != size; i++) {
            String svcName = formatEnvInPod(buildStatefulServiceName(deployment, i));
            if (isHostMode) {
                hostNetworkEnvs.add(new EnvDraft(svcName + "_SERVICE_HOST", nodeIpList.get(i)));
            }
//            for (LoadBalanceDraft loadBalanceDraft : deployment.) {
//                if (isHostMode) {
//                    hostNetworkEnvs.add(new EnvDraft(svcName + "_SERVICE_PORT_"
//                            + formatEnvInPod(loadBalanceDraft.getName()),
//                            String.valueOf(loadBalanceDraft.getTargetPort())));
//                }
//                hostNetworkEnvs.add(new EnvDraft(svcName + "_SERVICE_TARGET_PORT_"
//                            + formatEnvInPod(loadBalanceDraft.getName()),
//                            String.valueOf(loadBalanceDraft.getTargetPort())));
//            }
        }
        return hostNetworkEnvs;
    }

    public static String formatEnvInPod(String originEnvName) {
        String result = originEnvName.toUpperCase();
        return result.replaceAll("[.-]", "_");
    }


    public static boolean checkEnv(List<EnvDraft> envs, List<EnvDraft> checker) {
        if (checker == null) {
            return true;
        }
        Map<String, String> checkerMap = new HashMap<>();
        for (EnvDraft draft : checker) {
            checkerMap.put(draft.getKey(), draft.getValue());
        }
        for (EnvDraft draft : envs) {
            String oneChecker = checkerMap.get(draft.getKey());
            if (oneChecker == null) {
                continue;
            }
            if (!Pattern.compile(oneChecker).matcher(draft.getValue()).matches()) {
                return false;
            }
        }
        return true;
    }
    public static String buildStatefulServiceName(Deployment deployment, int index) {
        return buildStatefulServiceName(deployment) + "-" + index;
    }

    public static String buildStatefulServiceName(Deployment deployment) {
        if (deployment.getName().length() > 12) {
            return deployment.getName().substring(0, 12) + "-" + deployment.getId();
        }
        return deployment.getName();
    }

}
