package org.domeos.framework.engine.k8s.handler.impl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import io.fabric8.kubernetes.api.model.*;

import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.consolemodel.deployment.VersionString;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
import org.domeos.framework.api.model.deployment.related.VersionType;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.engine.k8s.K8sPodSpecBuilder;
import org.domeos.framework.engine.k8s.handler.DeployResourceHandler;
import org.domeos.framework.engine.k8s.updater.DeploymentUpdateJob;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.ModelFormatUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.framework.engine.model.CustomYamlObjectMapper;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;

import java.io.IOException;
import java.util.*;

/**
 * Created by KaiRen on 2016/11/9.
 */

public class ReplicationControllerDeployHandler implements DeployResourceHandler<ReplicationController> {
    private Deployment deployment;
    private KubeUtils kubeUtils;
    private String domeosServer;

    public ReplicationControllerDeployHandler() {
    }

    public ReplicationControllerDeployHandler(Deployment deployment, KubeUtils kubeUtils) {
        this.deployment = deployment;
        this.kubeUtils = kubeUtils;
    }

    public ReplicationControllerDeployHandler(Deployment deployment, KubeUtils kubeUtils, String domeosServer) {
        this.deployment = deployment;
        this.kubeUtils = kubeUtils;
        this.domeosServer = domeosServer;
    }

    @Override
    public ReplicationController build(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs) {
        if (deployment == null || version == null) {
            return null;
        }
        // * init rc metadata
        Map<String, String> rcLabel = buildRCLabel();
        String rcName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + GlobalConstant.RC_NAME_SUFFIX;

        ReplicationController rc = new ReplicationControllerBuilder().withNewMetadata().withName(rcName.toLowerCase())
                .withLabels(rcLabel).withNamespace(deployment.getNamespace()).endMetadata()
                .build();

        // ** init pod template
        Map<String, String> annotations = new HashMap<>();
        annotations.put("deployName", deployment.getName());
        // DeploymentExtra extra = deployment.getDeploymentExtra();
        // if (extra != null) {
        // annotations.put("accessType",
        // extra.getDeploymentAccessType().toString());
        // }
        // TODO (openxxs) tmp solution: for old load balancer
        Map<String, String> podLabels = buildRCLabelWithSpecifyVersionAndLoadBalancer(version, loadBalancers);

        ReplicationControllerSpec rcSpec = new ReplicationControllerSpecBuilder().withSelector(rcLabel)
                .withNewTemplate().withNewMetadata().withLabels(podLabels)
                .withAnnotations(annotations).withDeletionGracePeriodSeconds(0L).endMetadata()
                .endTemplate().build();
        // rcSpec.putTemplate(new PodTemplateSpec())
        // .getTemplate()
        // .putMetadata(new ObjectMeta())
        // .getMetadata()
        // // TODO (openxxs) tmp solution: for old load balancer
        // .putLabels(podLabels)
        // // .putLabels(rcSelector)
        // .putAnnotations(annotations)
        // .putDeletionGracePeriodSeconds(0);
        // *** create node selector

        PodSpec podSpec = new K8sPodSpecBuilder(version, deployment, extraEnvs).build();
        if (podSpec == null) {
            return null;
        }
        rcSpec.getTemplate().setSpec(podSpec);
        rcSpec.setReplicas(deployment.getDefaultReplicas());
        rc.setSpec(rcSpec);
        return rc;
    }

    @Override
    public ReplicationController create(Version version, List<EnvDraft> extraEnvs) throws K8sDriverException {
        ReplicationController replicationController = build(version, null, extraEnvs);
        if (replicationController == null || replicationController.getSpec() == null) {
            String message = "build replication controller for deployment:" + deployment.getName() + " failed";
            throw new K8sDriverException(message);
        }
        return kubeUtils.createReplicationController(replicationController);
    }

    @Override
    public void delete() throws K8sDriverException {
        ReplicationControllerList rcList = kubeUtils.listReplicationController(buildRCLabel());
        if (rcList != null && rcList.getItems() != null) {
            for (ReplicationController rc : rcList.getItems()) {
                kubeUtils.deleteReplicationController(rc.getMetadata().getName(), true);
            }
        }
//        PodList podList = kubeUtils.listPod(buildRCLabel());
//        if (podList != null && podList.getItems() != null) {
//            for (Pod pod : podList.getItems()) {
//                kubeUtils.deletePod(PodUtils.getName(pod));
//            }
//        }
    }

    @Override
    public ReplicationController scaleUp(Version version, int replicas) throws K8sDriverException {
        return scales(version, replicas);
    }

    @Override
    public ReplicationController scaleDown(Version version, int replicas) throws K8sDriverException {
        return scales(version, replicas);
    }

    @Override
    public ReplicationController update(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs,
                                        Policy policy, long eventId, int targetVersion) throws K8sDriverException {
        updateRc(version, loadBalancers, extraEnvs, eventId, targetVersion);
        return null;
    }

    @Override
    public ReplicationController rollback(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs,
                                          Policy policy, long eventId, int targetVersion) throws K8sDriverException {
        updateRc(version, loadBalancers, extraEnvs, eventId, targetVersion);
        return null;
    }

    @Override
    public Boolean abortUpdateOrRollBack() throws K8sDriverException {
        return kubeUtils.deleteJob(buildRCUpdateJobLabel());
    }

    @Override
    public void abortScales() throws K8sDriverException {
        ReplicationControllerList rcList = kubeUtils.listReplicationController(buildRCLabel());
        if (rcList == null || rcList.getItems() == null || rcList.getItems().size() == 0
                || rcList.getItems().get(0) == null) {
            throw new K8sDriverException("no replication controller found");
        }
        for (ReplicationController rc : rcList.getItems()) {
            int currentPodNumber;
            Map<String, String> podSelector = rc.getSpec().getSelector();
            PodList podList = kubeUtils.listPod(podSelector);
            if (podList == null || podList.getItems() == null) {
                currentPodNumber = 0;
            } else {
                currentPodNumber = PodUtils.getPodReadyNumber(podList.getItems());
            }
            kubeUtils.scaleReplicationController(rc.getMetadata().getName(), currentPodNumber);
        }
    }

    @Override
    public ReplicationController abort() {
        return null;
    }

    @Override
    public void removeOtherDeploy(int versionId) throws K8sDriverException {
        Map<String, String> deploySelector = buildRCLabel();
        ReplicationControllerList rcList = kubeUtils.listReplicationController(deploySelector);
        // ** choose the first rc template, treating it as no status
        if (rcList == null || rcList.getItems() == null || rcList.getItems().size() == 0
                || rcList.getItems().get(0) == null) {
            // ** no rc found
            throw new K8sDriverException("no replication controller found");
        }
        for (ReplicationController tmpRC : rcList.getItems()) {
            String tmpVersion = tmpRC.getMetadata().getLabels().get(GlobalConstant.VERSION_STR);
            if (StringUtils.isBlank(tmpVersion)) {
                continue;
            }
            int tmpId = Integer.parseInt(tmpVersion);
            if (tmpId != versionId) {
                kubeUtils.deleteReplicationController(tmpRC.getMetadata().getName(), false);
            }
        }
    }

    @Override
    public List<DeploymentSnapshot> queryDesiredSnapshot() throws K8sDriverException {
        ReplicationControllerList rcList = kubeUtils.listReplicationController(buildRCLabel());
        if (rcList == null || rcList.getItems() == null || rcList.getItems().size() == 0) {
            // no rc found
            return null;
        }
        Map<Long, Long> snapshots = new HashMap<>();
        for (ReplicationController rc : rcList.getItems()) {
            if (rc == null || rc.getSpec() == null || rc.getSpec().getSelector() == null ||
                    !rc.getSpec().getSelector().containsKey(GlobalConstant.VERSION_STR)) {
                continue;
            }
            Long version = Long.parseLong(rc.getSpec().getSelector().get(GlobalConstant.VERSION_STR));
            if (snapshots.containsKey(version)) {
                snapshots.put(version, snapshots.get(version) + rc.getSpec().getReplicas());
            } else {
                snapshots.put(version, (long) rc.getSpec().getReplicas());
            }
        }
        List<DeploymentSnapshot> snapshotList = new LinkedList<>();
        for (Map.Entry<Long, Long> entry : snapshots.entrySet()) {
            snapshotList.add(new DeploymentSnapshot(entry.getKey(), entry.getValue()));
        }
        return snapshotList;
    }

    @Override
    public VersionString getVersionString(DeploymentDraft deploymentDraft) {
        String rcName = GlobalConstant.RC_NAME_PREFIX + deploymentDraft.getDeployName();
        Map<String, String> annotations = new HashMap<>();
        annotations.put("deployName", deploymentDraft.getDeployName());
        ReplicationController replicationController = new ReplicationControllerBuilder()
                .withNewMetadata()
                .withName(rcName.toLowerCase())
                .withNamespace(deploymentDraft.getNamespace())
                .endMetadata()
                .withNewSpec()
                .withNewTemplate()
                .withNewMetadata()
                .withAnnotations(annotations)
                .withDeletionGracePeriodSeconds(0L)
                .endMetadata()
                .withNewSpec()
                .endSpec()
                .endTemplate()
                .withReplicas(deploymentDraft.getReplicas())
                .endSpec()
                .build();
        return getRCStr(replicationController, deploymentDraft.getVersionType());
    }

    @Override
    public VersionString getVersionString(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs) {

        ReplicationController replicationController = build(version, loadBalancers, extraEnvs);
        return getRCStr(replicationController, deployment.getVersionType());
    }

    private VersionString getRCStr(ReplicationController replicationController, VersionType versionType) {
        VersionString versionString = new VersionString();
        ModelFormatUtils.format(replicationController);
        try {
            if (versionType == VersionType.YAML) {
                ObjectMapper objectMapper = new CustomYamlObjectMapper();
                String deploymentStr = objectMapper.writeValueAsString(replicationController);
                versionString.setDeploymentStr(deploymentStr);
                replicationController.getSpec().getTemplate().setSpec(null);
                String deploymentStrHead = objectMapper.writeValueAsString(replicationController) + "\n    spec:\n";
                versionString.setDeploymentStrHead(deploymentStrHead);
                versionString.setDeploymentStrTail("");
                versionString.setIndent(4);
                return versionString;
            } else if (versionType == VersionType.JSON) {
                ObjectMapper objectMapper = new CustomObjectMapper();
                objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
                String deploymentStr = objectMapper.writerFor(replicationController.getClass()).writeValueAsString(replicationController);
                versionString.setDeploymentStr(deploymentStr);
                replicationController.getSpec().getTemplate().setSpec(null);
                deploymentStr = objectMapper.writerFor(replicationController.getClass()).writeValueAsString(replicationController);
                String str[] = deploymentStr.split("\n");
                String headStr[] = new String[str.length - 3];
                String tailStr[] = new String[3];
                System.arraycopy(str, 0, headStr, 0, headStr.length);
                System.arraycopy(str, str.length - 3, tailStr, 0, tailStr.length);
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

    private ReplicationController scales(Version version, int replicas) throws K8sDriverException {
        String deployName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + version.getVersion();
        if (kubeUtils.replicationControllerInfo(deployName) != null) {
            return kubeUtils.scaleReplicationController(deployName, replicas);
        } else {
            deployName = buildRcName();
            return kubeUtils.scaleReplicationController(deployName, replicas);
        }
    }

    // TODO (openxxs) tmp solution: for old load balancer
    private Map<String, String> buildRCLabelWithSpecifyVersionAndLoadBalancer(Version version, List<LoadBalancer> loadBalancers) {
        Map<String, String> label = buildRCLabel();
        label.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        if (loadBalancers != null) {
            for (LoadBalancer loadBalancer : loadBalancers) {
                label.put(GlobalConstant.WITH_LB_PREFIX + loadBalancer.getId(), GlobalConstant.WITH_LB_VALUE);
            }
        }
        return label;
    }

    private Map<String, String> buildRCLabel() {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return label;
    }

    private Map<String, String> buildRCUpdateJobLabel() {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.JOB_DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return label;
    }

    private void updateRc(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs,
                          long eventId, int targetVersion) throws K8sDriverException {
        ReplicationController newRc = build(version, loadBalancers, extraEnvs);
        String rcName = buildRcName();
        ReplicationController oldRc = kubeUtils.replicationControllerInfo(rcName);
        PodList podList = kubeUtils.listPod(buildRCLabel());
        int targetReplicas = newRc.getSpec().getReplicas();
        if (podList != null && podList.getItems() != null) {
            if (podList.getItems().size() < targetReplicas) {
                newRc.getSpec().setReplicas(podList.getItems().size());
            }
        }
        if (oldRc != null) {
            // rc exist, patch new pod template
            kubeUtils.patchReplicationController(rcName, newRc);
        } else {
            // replace old replication controller that name as dmo-[deploy name]-v[version id] to dmo-[deploy name]-rc
            // 1. delete old rc without cascading
            ReplicationControllerList rcList = kubeUtils.listAllReplicationController(buildRCLabel());
            if (rcList != null && rcList.getItems() != null && !rcList.getItems().isEmpty()) {
                for (ReplicationController rc : rcList.getItems()) {
                    if (rc.getMetadata() != null && rc.getMetadata().getName() != null && !rcName.equals(rc.getMetadata().getName())) {
                        kubeUtils.deleteReplicationControllerWithoutCascading(rc.getMetadata().getName());
                    }
                }
            }
            // 2. create rc with new pod template and old label selector
            kubeUtils.createReplicationController(newRc);
        }

        // 3. create job to delete old pod one by one
        String jobName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-" + System.currentTimeMillis();
        List<String> args = createArgs(eventId, jobName, targetReplicas, targetVersion);
        kubeUtils.createJob(DeploymentUpdateJob
                .createUpdateJob(deployment.getId(), version.getVersion(), deployment.getName(), jobName, args));
    }

    private List<String> createArgs(long eventId, String jobName, int targetReplicas, int targetVersion) {
        String namespace = kubeUtils.namespace();
        if (StringUtils.isBlank(namespace)) {
            namespace = "default";
        }
        List<String> args = new ArrayList<>();
        args.add("--apiserver=" + kubeUtils.serverAddress());
        args.add("--in-cluster=false");
        args.add("--deploy-id=" + deployment.getId());
        args.add("--deploy-type=" + deployment.getDeploymentType());
        args.add("--version-id=" + targetVersion);
        args.add("--event-id=" + eventId);
        args.add("--job-name=" + jobName);
        args.add("--namespace=" + namespace);
        args.add("--target-replicas=" + targetReplicas);
        args.add("--domeos-server=" + domeosServer + "/api/deploy/updatejob");
        return args;
    }

    private String buildRcName() {
        return GlobalConstant.RC_NAME_PREFIX + deployment.getName() + GlobalConstant.RC_NAME_SUFFIX;
    }
}