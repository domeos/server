package org.domeos.framework.engine.k8s;

import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.definitions.v1.Container;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.global.GlobalConstant;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Created by sparkchen on 16/4/6.
 */
public class RcBuilder {
    Deployment deployment;
    Version version;
    List<LoadBalancer> loadBalancer;
    List<EnvDraft> extraEnvs;
    int index = -1;
    List<String> nodeIpList = null;

    public RcBuilder() {
    }

    public RcBuilder(Deployment deployment, List<LoadBalancer> loadBalancer, Version version, List<EnvDraft> extraEnvs) {
        this.deployment = deployment;
        this.loadBalancer = loadBalancer;
        this.version = version;
        this.extraEnvs = extraEnvs;
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
        ReplicationController rc = new ReplicationController();
        // * init rc metadate
        String rcName = null;
        Map<String, String> rcLabel = buildRCLabelWithSpecifyVersion(deployment, version);
        if (index < 0) {
            rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + version.getVersion();
        } else {
            rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + version.getVersion() + "-i" + index;
            addIndex(rcLabel, index);
        }
        rc.putMetadata(new ObjectMeta())
            .getMetadata()
            .putName(rcName.toLowerCase())
            .putLabels(rcLabel)
            .putNamespace(deployment.getNamespace());

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
        rcSpec.putTemplate(new PodTemplateSpec())
            .getTemplate()
            .putMetadata(new ObjectMeta())
            .getMetadata()
            .putLabels(rcSelector)
            .putAnnotations(annotations)
            .putDeletionGracePeriodSeconds(0);
        // *** create node selector
        PodSpec podSpec = new PodSpec();
        podSpec.putHostNetwork(deployment.getNetworkMode() == NetworkMode.HOST);
        rcSpec.getTemplate().putSpec(podSpec);
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
            rcSpec.getTemplate().getSpec().putNodeSelector(nodeSelector);
        } else if (index < version.getHostList().size()){
            String nodeName = version.getHostList().get(index);
            rcSpec.getTemplate().getSpec()
                .putNodeName(nodeName);
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
        Container[] containers = buildContainer(deployment, version, index, nodeIpList, extraEnvs);
        if (containers == null) {
            return null;
        }
        rcSpec.getTemplate()
            .getSpec()
            .putContainers(containers);
        // if configure to autoCollect or autoDelete log, need to set volumes
        // so that data can be shared accross different containers in a Pod
        if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
            Volume[] volumes = LogDraft.formatPodVolume(version.getLogDraft());
            rcSpec.getTemplate().getSpec().setVolumes(volumes);
        }
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
    // a depolyment occupy. And it will avoid overlap pods between different deployment and
    // different version
    public static Map<String, String> buildRCLabelWithSpecifyVersion(Deployment deployment, Version version) {
        Map<String, String> label = buildRCLabel(deployment);
        label.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        return label;
    }

    public static Map<String, String> buildRCLabel(Deployment deployment) {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return label;
    }

    public static Container[] buildContainer(Deployment deployment, Version version, int index,
                                             List<String> nodeIpList, List<EnvDraft> extraEnvs) {
        if (version == null || version.getContainerDrafts() == null
            || version.getContainerDrafts().size() == 0) {
            return null;
        }
        int size = version.getContainerDrafts().size();
        List<Container> containers = new ArrayList<>(size);
        HealthChecker healthChecker = deployment.getHealthChecker();
        Probe probe = buildProbe(healthChecker);

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
        for (ContainerDraft containerDraft : version.getContainerDrafts()) {
            Container container = new Container();
            container.putImage(containerDraft.formatImage() + ":" + containerDraft.getTag())
                .putName(deployment.getName() + "-" + idx)
                .putResources(formatResource(containerDraft));

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

            EnvVar[] envs = envVarList.toArray(new EnvVar[envVarList.size()]);
            container.setEnv(envs);

            if (probe != null) {
                container.setLivenessProbe(probe);
            }

            // set pull image always
            container.setImagePullPolicy("Always");

            // if configure to autoCollect or autoDelete log, need to set volumeMount
            if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
                VolumeMount[] volumeMounts = LogDraft.formatOriginalContainerVolumeMount(version.getLogDraft());
                container.setVolumeMounts(volumeMounts);
            }
            containers.add(container);
            idx++;
        }
        // if configured to autoCollect or autoDelete log, then need to add flume-image container
        if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
            Container container = new Container();
            LogDraft logDraft = version.getLogDraft();
            List<EnvVar> envVarList = new LinkedList<>();
            envVarList.addAll(formatEnv(allExtraEnvs));
            envVarList.addAll(Arrays.asList(LogDraft.formatEnv(logDraft)));
            envVarList.addAll(DownwardAPIUtil.generateDownwardEnvs());

            EnvVar[] envs = envVarList.toArray(new EnvVar[envVarList.size()]);
            container.putImage(logDraft.getFlumeDraft().formatImage() + ":" + logDraft.getFlumeDraft().getTag())
                .putName(deployment.getName() + "-" + idx)
                .putEnv(envs)
                .putVolumeMounts(LogDraft.formatFlumeContainerVolumeMount(logDraft))
                .putResources(formatResource(logDraft.getFlumeDraft()));
            containers.add(container);
            size++;
        }
        return containers.toArray(new Container[size]);
    }

    private static Probe buildProbe(HealthChecker healthChecker) {
        if (healthChecker == null || healthChecker.getType().equals(HealthCheckerType.NONE)) {
            return null;
        }
        Probe probe = new Probe();
        probe.setTimeoutSeconds(healthChecker.getTimeout());
        probe.setInitialDelaySeconds(30);
        switch (healthChecker.getType()) {
            case HTTP:
                HTTPGetAction httpGetAction = new HTTPGetAction();
                httpGetAction.setPath(healthChecker.getUrl());
                httpGetAction.setPort(healthChecker.getPort());
                probe.setHttpGet(httpGetAction);
                break;
            case TCP:
                TCPSocketAction tcpSocketAction = new TCPSocketAction();
                tcpSocketAction.setPort(healthChecker.getPort());
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
            EnvVar tmpEnv = new EnvVar();
            tmpEnv.putName(envDraft.getKey()).putValue(envDraft.getValue());
            envs.add(tmpEnv);
        }
        return envs;
    }

    public static ResourceRequirements formatResource(ContainerDraft containerDraft) {
        ResourceRequirements result = new ResourceRequirements();
        Map<String, String> resource = new HashMap<>();
        if (containerDraft.getCpu() > 0) {
            resource.put("cpu", String.valueOf(containerDraft.getCpu()));
        }
        if (containerDraft.getMem() > 0) {
            resource.put("memory", String.valueOf(containerDraft.getMem()) + "Mi");
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
