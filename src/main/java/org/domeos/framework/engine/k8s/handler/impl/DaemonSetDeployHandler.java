package org.domeos.framework.engine.k8s.handler.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import io.fabric8.kubernetes.api.model.NodeList;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.PodSpec;
import io.fabric8.kubernetes.api.model.extensions.*;

import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.consolemodel.deployment.VersionString;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
import org.domeos.framework.api.model.deployment.related.LabelSelector;
import org.domeos.framework.api.model.deployment.related.VersionType;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.engine.k8s.K8sPodSpecBuilder;
import org.domeos.framework.engine.k8s.handler.DeployResourceHandler;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.ModelFormatUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.framework.engine.model.CustomYamlObjectMapper;
import org.domeos.global.GlobalConstant;
import org.domeos.util.StringUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created by KaiRen on 2016/11/8.
 */
public class DaemonSetDeployHandler implements DeployResourceHandler<DaemonSet> {
    private Deployment deployment;
    private KubeUtils kubeUtils;
    private String domeosServer;

    public DaemonSetDeployHandler(Deployment deployment, KubeUtils kubeUtils) {
        this.deployment = deployment;
        this.kubeUtils = kubeUtils;
    }

    public DaemonSetDeployHandler() {
    }

    public DaemonSetDeployHandler(Deployment deployment, KubeUtils kubeUtils, String domeosServer) {
        this.deployment = deployment;
        this.kubeUtils = kubeUtils;
        this.domeosServer = domeosServer;
    }

    @Override
    public DaemonSet build(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs) {
        if (deployment == null || version == null) {
            return null;
        }
        // * init rc metadate
        String dsName = null;
        Map<String, String> dsLabel = buildDSLabelWithSpecifyVersion(version);
        dsName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + version.getVersion();
        DaemonSet ds = new DaemonSetBuilder()
                .withNewMetadata().withName(dsName.toLowerCase())
                .withLabels(dsLabel)
                .withNamespace(deployment.getNamespace()).endMetadata().build();
        Map<String, String> annotations = new HashMap<>();
        annotations.put("deployName", deployment.getName());
        Map<String, String> podLabels = buildDSLabelWithSpecifyVersionAndLoadBalancer(version, loadBalancers);
        DaemonSetSpec dsSpec = new DaemonSetSpecBuilder().withNewTemplate().withNewMetadata().withLabels(podLabels)
                .withAnnotations(annotations).withDeletionGracePeriodSeconds(0L).endMetadata()
                .endTemplate().build();
        PodSpec podSpec = new K8sPodSpecBuilder(version, deployment, extraEnvs).build();
        if (podSpec == null) {
            return null;
        }
        dsSpec.getTemplate().setSpec(podSpec);
        ds.setSpec(dsSpec);
        return ds;
    }

    @Override
    public DaemonSet create(Version version, List<EnvDraft> extraEnvs) throws K8sDriverException {
        DaemonSet daemonSet = build(version, null, extraEnvs);
        if (daemonSet == null || daemonSet.getSpec() == null) {
            String message = "build daemon set for deployment:" + deployment.getName() + " failed";
            throw new K8sDriverException(message);
        }
        return kubeUtils.createDaemonSet(daemonSet);
    }

    @Override
    public void delete() throws K8sDriverException {
//        DeployUpdater updater = updaterManager.getUpdater(deployment.getId());
//        if (updater != null) {
//            updater.stop();
//            updaterManager.removeUpdater(deployment.getId());
//        }
        deleteAllDaemonSet();
    }

    public void deleteAllDaemonSet() throws K8sDriverException {
        DaemonSetList dsList = kubeUtils.listDaemonSet(buildDSLabel());
        if (dsList != null && dsList.getItems() != null) {
            for (DaemonSet ds : dsList.getItems()) {
                kubeUtils.deleteDaemonSet(ds.getMetadata().getName(), true);
            }
        }
        PodList podList = kubeUtils.listPod(buildDSLabel());
        if (podList != null && podList.getItems() != null) {
            for (Pod pod : podList.getItems()) {
                kubeUtils.deletePod(PodUtils.getName(pod));
            }
        }
    }

    @Override
    public DaemonSet scaleUp(Version version, int replicas) throws K8sDriverException {
        return scales(version, replicas);
    }

    @Override
    public DaemonSet scaleDown(Version version, int replicas) throws K8sDriverException {
        return scales(version, replicas);
    }

    @Override
    public DaemonSet update(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs,
                            Policy policy, long eventId, int targetVersion) throws K8sDriverException {
        DaemonSet newDaemonSet = build(version, loadBalancers, extraEnvs);
        deleteAllDaemonSet();
        kubeUtils.createDaemonSet(newDaemonSet);
//        K8sDaemonSetDeployUpdater updater = new K8sDaemonSetDeployUpdater(kubeUtils, deployment, version, extraEnvs, loadBalancers);
//        updaterManager.addUpdater(deployment.getId(), updater);
//        updater.start();
        return null;
    }

    @Override
    public DaemonSet rollback(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs,
                              Policy policy, long eventId, int targetVersion) throws  K8sDriverException {
        DaemonSet newDaemonSet = build(version, loadBalancers, extraEnvs);
        deleteAllDaemonSet();
        kubeUtils.createDaemonSet(newDaemonSet);
//        K8sDaemonSetDeployUpdater updater = new K8sDaemonSetDeployUpdater(kubeUtils, deployment, version, extraEnvs, loadBalancers);
//        updaterManager.addUpdater(deployment.getId(), updater);
//        updater.start();
        return null;
    }

    @Override
    public Boolean abortUpdateOrRollBack() {
        return false;
    }

    @Override
    public void abortScales() throws K8sDriverException {
        return;
    }

    @Override
    public DaemonSet abort() {
        return null;
    }

    @Override
    public void removeOtherDeploy(int versionId) throws K8sDriverException {
        Map<String, String> deploySelector = buildDSLabel();
        DaemonSetList daemonSetList = kubeUtils.listDaemonSet(deploySelector);
        if (daemonSetList == null || daemonSetList.getItems() == null || daemonSetList.getItems().size() == 0
                || daemonSetList.getItems().get(0) == null) {
            throw new K8sDriverException("no daemonSet found");
        }
        for (DaemonSet ds : daemonSetList.getItems()) {
            String tmpVersion = ds.getMetadata().getLabels().get(GlobalConstant.VERSION_STR);
            if (StringUtils.isBlank(tmpVersion)) {
                continue;
            }
            int tmpId = Integer.parseInt(tmpVersion);
            if (tmpId != versionId) {
                kubeUtils.deleteDaemonSet(ds.getMetadata().getName(), false);
            }
        }
    }

    @Override
    public List<DeploymentSnapshot> queryDesiredSnapshot() throws K8sDriverException {
        DaemonSetList dsList = kubeUtils.listDaemonSet(buildDSLabel());
        if (dsList == null || dsList.getItems() == null || dsList.getItems().size() == 0) {
            // no rc found
            return null;
        }
        Map<Long, Long> snapshots = new HashMap<>();
        for (DaemonSet ds : dsList.getItems()) {
            if (ds == null || ds.getMetadata() == null || ds.getMetadata().getLabels() == null ||
                    !ds.getMetadata().getLabels().containsKey(GlobalConstant.VERSION_STR)) {
                continue;
            }
            Long version = Long.parseLong(ds.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            NodeList nodeList = kubeUtils.listNode(ds.getSpec().getTemplate().getSpec().getNodeSelector());
            if (nodeList != null && !nodeList.getItems().isEmpty()) {
                int replicas = nodeList.getItems().size();
                if (snapshots.containsKey(version)) {
                    snapshots.put(version, snapshots.get(version) + replicas);
                } else {
                    snapshots.put(version, (long) replicas);
                }
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
        DaemonSet ds = new DaemonSetBuilder()
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
                .endSpec()
                .build();
        return getDSStr(ds, deploymentDraft.getVersionType());
    }

    @Override
    public VersionString getVersionString(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs) {
        DaemonSet ds = build(version, loadBalancers, extraEnvs);
        return getDSStr(ds, deployment.getVersionType());
    }

    private VersionString getDSStr(DaemonSet ds, VersionType versionType) {
        VersionString versionString = new VersionString();
        ModelFormatUtils.format(ds);
        try {
            if (versionType == VersionType.YAML) {
                ObjectMapper objectMapper = new CustomYamlObjectMapper();
                String deploymentStr = objectMapper.writeValueAsString(ds);
                versionString.setDeploymentStr(deploymentStr);
                ds.getSpec().getTemplate().setSpec(null);
                String deploymentStrHead = objectMapper.writeValueAsString(ds) + "\n    spec:\n";
                versionString.setDeploymentStrHead(deploymentStrHead);
                versionString.setDeploymentStrTail("");
                versionString.setIndent(4);
                return versionString;
            } else if (versionType == VersionType.JSON) {
                ObjectMapper objectMapper = new CustomObjectMapper();
                objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
                String deploymentStr = objectMapper.writerFor(ds.getClass()).writeValueAsString(ds);
                versionString.setDeploymentStr(deploymentStr);
                ds.getSpec().getTemplate().setSpec(null);
                deploymentStr = objectMapper.writerFor(ds.getClass()).writeValueAsString(ds);
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

    private DaemonSet scales(Version version, int replicas) throws K8sDriverException {
        String deployName = GlobalConstant.RC_NAME_PREFIX + deployment.getName() + "-v" + version.getVersion();
        Map<String, String> labels = new HashMap<>();
        for (LabelSelector labelSelector : version.getLabelSelectors()) {
            labels.put(labelSelector.getName(), labelSelector.getContent());
        }
        DaemonSet daemonSet = kubeUtils.daemonSetInfo(deployName);
        daemonSet.getSpec().getTemplate().getSpec().setNodeSelector(labels);
        return kubeUtils.patchDaemonSet(daemonSet.getMetadata().getName(), daemonSet);
    }

    private Map<String, String> buildDSLabelWithSpecifyVersion(Version version) {
        Map<String, String> label = buildDSLabel();
        label.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        return label;
    }

    private Map<String, String> buildDSLabel() {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return label;
    }

    private Map<String, String> buildDSLabelWithSpecifyVersionAndLoadBalancer(Version version, List<LoadBalancer> loadBalancers) {
        Map<String, String> label = buildDSLabel();
        label.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        if (loadBalancers != null) {
            for (LoadBalancer loadBalancer : loadBalancers) {
                label.put(GlobalConstant.WITH_LB_PREFIX + loadBalancer.getId(), GlobalConstant.WITH_LB_VALUE);
            }
        }
        return label;
    }
}