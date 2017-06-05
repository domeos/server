package org.domeos.framework.engine.k8s.handler.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import io.fabric8.kubernetes.api.model.IntOrString;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.PodSpec;
import io.fabric8.kubernetes.api.model.extensions.*;

import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.consolemodel.deployment.DeploymentDraft;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.consolemodel.deployment.VersionString;
import org.domeos.framework.api.model.deployment.Policy;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.DeploymentSnapshot;
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
 * Created by KaiRen on 2016/11/9.
 */
public class DeploymentDeployHandler implements DeployResourceHandler<Deployment> {
    private org.domeos.framework.api.model.deployment.Deployment deployment;
    private KubeUtils kubeUtils;
    private String domeosServer;

    public DeploymentDeployHandler(org.domeos.framework.api.model.deployment.Deployment deployment, KubeUtils kubeUtils) {
        this.deployment = deployment;
        this.kubeUtils = kubeUtils;
    }

    public DeploymentDeployHandler(org.domeos.framework.api.model.deployment.Deployment deployment, KubeUtils kubeUtils,
                                   String domeosServer) {
        this.deployment = deployment;
        this.kubeUtils = kubeUtils;
        this.domeosServer = domeosServer;
    }

    @Override
    public Deployment build(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs) {
        if (deployment == null || version == null) {
            return null;
        }
        // * init rc metadate
        String deployName = getDeploymentName();
        Map<String, String> deploymentLabel = buildDeploymentLabel();

        io.fabric8.kubernetes.api.model.extensions.Deployment k8sDeployment =
                new DeploymentBuilder().withNewMetadata().withName(deployName.toLowerCase())
                        .withLabels(deploymentLabel).withNamespace(deployment.getNamespace()).endMetadata()
                        .build();
        Map<String, String> annotations = new HashMap<>();
        annotations.put("deployName", deployment.getName());
        annotations.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        Map<String, String> podLabels = buildDeploymentLabelWithSpecifyVersionAndLoadBalancer(version, loadBalancers);

        DeploymentSpec deploymentSpec = new DeploymentSpecBuilder().withNewStrategy()
                .withNewRollingUpdate().withMaxSurge(new IntOrString(0)).withMaxUnavailable(new IntOrString(1))
                .endRollingUpdate().endStrategy()
                .withNewSelector().withMatchLabels(buildDeploymentLabel()).endSelector()
                .withNewTemplate().withNewMetadata().withLabels(podLabels)
                .withAnnotations(annotations).withDeletionGracePeriodSeconds(0L).endMetadata()
                .endTemplate().build();

        PodSpec podSpec = new K8sPodSpecBuilder(version, deployment, extraEnvs).build();
        if (podSpec == null) {
            return null;
        }
        deploymentSpec.getTemplate().setSpec(podSpec);
        deploymentSpec.setReplicas(deployment.getDefaultReplicas());
        k8sDeployment.setSpec(deploymentSpec);
        return k8sDeployment;
    }

    @Override
    public Deployment create(Version version, List<EnvDraft> extraEnvs) throws K8sDriverException {
        Deployment k8sDeployment = build(version, null, extraEnvs);
        if (k8sDeployment == null || k8sDeployment.getSpec() == null) {
            String message = "build k8s deployment for deployment:" + deployment.getName() + " failed";
            throw new K8sDriverException(message);
        }
        return kubeUtils.createDeployment(k8sDeployment);
    }

    @Override
    public void delete() throws K8sDriverException {
        DeploymentList deploymentList = kubeUtils.listDeployment(buildDeploymentLabel());
        if (deploymentList != null && deploymentList.getItems() != null) {
            for (Deployment k8sDeployment : deploymentList.getItems()) {
                kubeUtils.deleteDeployment(k8sDeployment.getMetadata().getName(), true);
            }
        }
//        PodList podList = kubeUtils.listPod(buildDeploymentLabel());
//        if (podList != null && podList.getItems() != null) {
//            for (Pod pod : podList.getItems()) {
//                kubeUtils.deletePod(PodUtils.getName(pod));
//            }
//        }
    }

    @Override
    public Deployment scaleUp(Version version, int replicas) throws K8sDriverException {
        return scales(version, replicas);
    }

    @Override
    public Deployment scaleDown(Version version, int replicas) throws K8sDriverException {
        return scales(version, replicas);
    }

    @Override
    public Deployment update(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs, 
                             Policy policy, long eventId, int targetVersion) throws K8sDriverException {
        Deployment newDeployment = build(version, loadBalancers, extraEnvs);
        if (newDeployment != null) {
            newDeployment.getSpec().setPaused(false);
            kubeUtils.patchDeployment(newDeployment.getMetadata().getName(), newDeployment);
        } else {
            throw new K8sDriverException("Error when build new deployment to update.");
        }
        return null;
    }

    @Override
    public Deployment rollback(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs,
                               Policy policy, long eventId, int targetVersion) throws K8sDriverException {
        Deployment newDeployment = build(version, loadBalancers, extraEnvs);
        if (newDeployment != null) {
            newDeployment.getSpec().setPaused(false);
            kubeUtils.patchDeployment(newDeployment.getMetadata().getName(), newDeployment);
        } else {
            throw new K8sDriverException("Error when build new deployment to roll back.");
        }
        return null;
    }

    @Override
    public Boolean abortUpdateOrRollBack() throws K8sDriverException {
        Deployment currentDeployment = kubeUtils.deploymentInfo(getDeploymentName());
        if (currentDeployment == null) {
            throw new K8sDriverException("can not get current rollout deployment");
        }
        if (getCurrentPods() == deployment.getDefaultReplicas()) {
            return true;
        } else {
            kubeUtils.pauseDeployment(getDeploymentName());
            return false;
        }

    }

    @Override
    public void abortScales() throws K8sDriverException {
        Deployment currentDeployment = kubeUtils.deploymentInfo(getDeploymentName());
        if (currentDeployment == null) {
            throw new K8sDriverException("can not get current rollout deployment");
        }
        if (getCurrentPods() != deployment.getDefaultReplicas()) {
            kubeUtils.pauseDeployment(getDeploymentName());
        }
    }

    @Override
    public Deployment abort() {
        return null;
    }

    @Override
    public void removeOtherDeploy(int versionId) throws K8sDriverException {
    }

    @Override
    public List<DeploymentSnapshot> queryDesiredSnapshot() throws K8sDriverException {
        Deployment deployment = kubeUtils.deploymentInfo(getDeploymentName());
        List<DeploymentSnapshot> snapshotList = new LinkedList<>();
        if (deployment != null && deployment.getMetadata() != null && deployment.getMetadata().getLabels() != null &&
                deployment.getMetadata().getLabels().containsKey(GlobalConstant.VERSION_STR)) {
            Long version = Long.parseLong(deployment.getMetadata().getLabels().get(GlobalConstant.VERSION_STR));
            snapshotList.add(new DeploymentSnapshot(version, deployment.getSpec().getReplicas()));
        }
        return snapshotList;
    }

    @Override
    public VersionString getVersionString(DeploymentDraft deploymentDraft) {
        String rcName = GlobalConstant.RC_NAME_PREFIX + deploymentDraft.getDeployName() + "-deploy";
        Map<String, String> annotations = new HashMap<>();
        annotations.put("deployName", deploymentDraft.getDeployName());
        Deployment k8sDeployment = new DeploymentBuilder()
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
        return getDeploymentStr(k8sDeployment, deploymentDraft.getVersionType());
    }

    @Override
    public VersionString getVersionString(Version version, List<LoadBalancer> loadBalancers, List<EnvDraft> extraEnvs) {
        Deployment k8sDeployment = build(version, loadBalancers, extraEnvs);
        return getDeploymentStr(k8sDeployment, deployment.getVersionType());

    }

    private VersionString getDeploymentStr(Deployment k8sDeployment, VersionType versionType) {
        VersionString versionString = new VersionString();
        ModelFormatUtils.format(k8sDeployment);
        try {
            if (versionType == VersionType.YAML) {
                ObjectMapper objectMapper = new CustomYamlObjectMapper();
                String deploymentStr = objectMapper.writeValueAsString(k8sDeployment);
                versionString.setDeploymentStr(deploymentStr);
                k8sDeployment.getSpec().getTemplate().setSpec(null);
                String deploymentStrHead = objectMapper.writeValueAsString(k8sDeployment) + "\n    spec:\n";
                versionString.setDeploymentStrHead(deploymentStrHead);
                versionString.setDeploymentStrTail("");
                versionString.setIndent(4);
                return versionString;
            } else if (versionType == VersionType.JSON) {
                ObjectMapper objectMapper = new CustomObjectMapper();
                objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
                String deploymentStr = objectMapper.writerFor(k8sDeployment.getClass()).writeValueAsString(k8sDeployment);
                versionString.setDeploymentStr(deploymentStr);
                k8sDeployment.getSpec().getTemplate().setSpec(null);
                deploymentStr = objectMapper.writerFor(k8sDeployment.getClass()).writeValueAsString(k8sDeployment);
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

    private int getCurrentPods() throws K8sDriverException  {
        PodList podList = kubeUtils.listPod(buildDeploymentLabel());
        if (podList == null || podList.getItems() == null || podList.getItems().size() == 0) {
            return 0;
        }
        int ret = 0;
        for (Pod pod : podList.getItems()) {
            if (pod == null || pod.getMetadata() == null || pod.getMetadata().getLabels() == null) {
                continue;
            }
            if (!PodUtils.isPodReady(pod)) {
                continue;
            }
            ret++;
        }
        return ret;
    }

    String getDeploymentName() {
        return GlobalConstant.RC_NAME_PREFIX + deployment.getName() + GlobalConstant.DEPLOYMENT_NAME_SUFFIX;
    }

    private Deployment scales(Version version, int replicas) throws K8sDriverException {
        String deployName = getDeploymentName();
        return kubeUtils.scaleDeployment(deployName, replicas);
    }

    // TODO (openxxs) tmp solution: for old load balancer
    private Map<String, String> buildDeploymentLabelWithSpecifyVersionAndLoadBalancer(Version version, List<LoadBalancer> loadBalancers) {
        Map<String, String> label = buildDeploymentLabel();
        label.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        if (loadBalancers != null) {
            for (LoadBalancer loadBalancer : loadBalancers) {
                label.put(GlobalConstant.WITH_LB_PREFIX + loadBalancer.getId(), GlobalConstant.WITH_LB_VALUE);
            }
        }
        return label;
    }

    private Map<String, String> buildDeploymentLabel() {
        Map<String, String> label = new HashMap<>();
        label.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return label;
    }

}