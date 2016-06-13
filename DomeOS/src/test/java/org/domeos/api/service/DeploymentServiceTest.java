package org.domeos.api.service;

import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.util.ThreadContext;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.biz.deployment.DeployEventBiz;
import org.domeos.framework.api.biz.deployment.DeploymentBiz;
import org.domeos.framework.api.biz.deployment.VersionBiz;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.framework.api.consolemodel.deployment.EnvDraft;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.deployment.Deployment;
import org.domeos.framework.api.model.deployment.Version;
import org.domeos.framework.api.model.deployment.related.HealthChecker;
import org.domeos.framework.api.model.deployment.related.HealthCheckerType;
import org.domeos.framework.api.model.deployment.related.LogDraft;
import org.domeos.framework.api.service.deployment.DeploymentService;
import org.domeos.framework.api.service.deployment.VersionService;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.global.GlobalConstant;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 */
@WebAppConfiguration
@RunWith(org.domeos.base.JUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:DomeOS/src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})
public class DeploymentServiceTest {
    @Autowired
    DeploymentService deploymentService;
    @Autowired
    VersionService versionService;
    @Autowired
    CustomObjectMapper objectMapper;
    @Autowired
    protected org.apache.shiro.mgt.SecurityManager securityManager;


    @Autowired
    DeploymentBiz deploymentBiz;
    @Autowired
    DeployEventBiz deployEventBiz;
    @Autowired
    VersionBiz versionBiz;
    @Autowired
    ClusterBiz clusterBiz;

    @Before
    public void setUp() {
        ThreadContext.bind(securityManager);
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

    public static EnvVar[] formatEnv(List<EnvDraft> envDrafts) {
        if (envDrafts == null || envDrafts.size() == 0) {
            return null;
        }
        List<EnvVar> envs = new ArrayList<>(envDrafts.size());
        for (EnvDraft envDraft : envDrafts) {
            EnvVar tmpEnv = new EnvVar();
            tmpEnv.putName(envDraft.getKey()).putValue(envDraft.getValue());
            envs.add(tmpEnv);
        }
        return envs.toArray(new EnvVar[envs.size()]);
    }

    public static ResourceRequirements formatResource(ContainerDraft containerDraft) {
        ResourceRequirements result = new ResourceRequirements();
        Map<String, String> resource = new HashMap<>();
        resource.put("cpu", String.valueOf(containerDraft.getCpu()));
        resource.put("memory", String.valueOf(containerDraft.getMem()) + "Mi");
        result.setLimits(resource);
        return result;
    }

    public static Container[] buildContainer(Deployment deployment, Version version) {
        if (version == null || version.getContainerDrafts() == null || version.getContainerDrafts().size() == 0) {
            return null;
        }
        int size = version.getContainerDrafts().size();
        List<Container> containers = new ArrayList<>(size);
        HealthChecker healthChecker = deployment.getHealthChecker();
        Probe probe = null;
        probe = buildProbe(healthChecker);

        // idx used to distinguish container name
        int idx = 0;
        for (ContainerDraft containerDraft : version.getContainerDrafts()) {
            Container container = new Container();
            container.putImage(containerDraft.formatImage() + ":" + containerDraft.getTag())
                .putName(deployment.getName() + "-" + idx)
                .putResources(formatResource(containerDraft));

            EnvVar[] envs = formatEnv(containerDraft.getEnvs());
            container.setEnv(envs);

            if (probe != null) {
                container.setLivenessProbe(probe);
            }

            // if configure to autoCollect or autoDelete log, need to set volumeMount
            if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
                LogDraft logDraft = version.getLogDraft();
                VolumeMount[] volumeMounts = LogDraft.formatOriginalContainerVolumeMount(logDraft);
                container.setVolumeMounts(volumeMounts);
            }
            containers.add(container);
            idx++;
        }

        // if configured to autoCollect or autoDelete log, then need to add flume-image container
        if (version.getLogDraft() != null && version.getLogDraft().needFlumeContainer()) {
            Container container = new Container();
            LogDraft logDraft = version.getLogDraft();
            container.putImage(logDraft.getFlumeDraft().formatImage() + ":" + logDraft.getFlumeDraft().getTag())
                .putName(deployment.getName() + "-" + idx)
                .putEnv(LogDraft.formatEnv(logDraft))
                .putVolumeMounts(LogDraft.formatFlumeContainerVolumeMount(logDraft))
                .putResources(formatResource(logDraft.getFlumeDraft()));
//            System.out.println(container.formatLikeYaml("","",""));
            containers.add(container);
            size++;
        }
        return containers.toArray(new Container[size]);
    }

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

    public static Map<String, String> buildRCSelectorWithSpecifyVersion(Deployment deployment, Version version) {
        Map<String, String> selector = buildRCSelector(deployment);
        selector.put(GlobalConstant.VERSION_STR, String.valueOf(version.getVersion()));
        return selector;
    }
    public static Map<String, String> buildRCSelector(Deployment deployment) {
        Map<String, String> selector = new HashMap<>();
        selector.put(GlobalConstant.DEPLOY_ID_STR, String.valueOf(deployment.getId()));
        return selector;
    }

    @Test
    public void TestForLogDraft() throws Exception {
        // only for debug now
        int deployId = 83;
        long versionId = 1;
        Deployment deployment = deploymentBiz.getDeployment(deployId);
        Version version = versionBiz.getVersion(deployId, versionId);
        long deploymentId = deployment.getId();

        // ** get cluster
        String clusterName = deployment.getClusterName();
        Cluster cluster = clusterBiz.getClusterByName(clusterName);
        String clusterApiServer = cluster.getApi();
        long clusterId = cluster.getId();

//        clusterLogService.setLogDraft(version, clusterId);
        String logDraftCheckLegality = version.getLogDraft().checkLegality();
        if (!StringUtils.isBlank(logDraftCheckLegality)) {
            System.out.println(logDraftCheckLegality);
        }

        ReplicationController rc = new ReplicationController();
        // * init rc metadate
        rc.putMetadata(new ObjectMeta())
            .getMetadata()
            .putName("domeos-" + deployment.getName() + "-version" + version.getVersion())
            .putLabels(buildRCLabelWithSpecifyVersion(deployment, version))
            .putNamespace(deployment.getNamespace());

        // * init rc spec
        ReplicationControllerSpec rcSpec = new ReplicationControllerSpec();
        rcSpec.setReplicas(deployment.getDefaultReplicas());

        // ** init pod template
        rcSpec.putTemplate(new PodTemplateSpec())
            .getTemplate()
            .putMetadata(new ObjectMeta())
            .getMetadata()
            .putLabels(buildRCSelectorWithSpecifyVersion(deployment, version));
        // *** create node selector
        Map<String, String> nodeSelector = new HashMap<>();
//        List<LabelSelector> selectors = version.getLabelSelectors();
//        if (selectors != null) {
//            for (LabelSelector selector : version.getLabelSelectors()) {
//                nodeSelector.put(selector.getName(), selector.getContent());
//            }
//        }
        if (deployment.getHostEnv() != null) {
            nodeSelector.put("hostEnv", deployment.getHostEnv().toString());
        }
        // *** init container and node selector
        Container[] containers = buildContainer(deployment, version);
        if (containers == null) {
            System.out.println("wrong, containers is empty");
            return;
        }
        rcSpec.getTemplate()
            .putSpec(new PodSpec())
            .getSpec()
            .putContainers(containers)
            .putNodeSelector(nodeSelector);
        // if configure to autoCollect or autoDelete log, need to set volumes
        // so that data can be shared accross different containers in a Pod
        if (version.getLogDraft() != null &&  version.getLogDraft().needFlumeContainer()) {
            Volume[] volumes = LogDraft.formatPodVolume(version.getLogDraft());
            rcSpec.getTemplate().getSpec().setVolumes(volumes);
        }
        rc.setSpec(rcSpec);
        System.out.println(rc.formatLikeYaml("","",""));
    }

//    @Test
//    public void createDeploy() throws Exception {
//        long userId = 1;
//        FileInputStream fis = new FileInputStream("./src/test/resources/deploy/deploy.json");
//        int len = fis.available();
//        byte[] buff = new byte[len];
//        fis.read(buff, 0, len);
//        String content = new String(buff);
//        DeploymentDraft deploymentDraft = objectMapper.readValue(buff, DeploymentDraft.class);
//        HttpResponseTemp<?> resp = deploymentService.createDeployment(deploymentDraft, userId);
//        System.out.println(resp.getResultCode());
//        System.out.println(resp.getResultMsg());
//    }
//
//    @Test
//    public void getDeploy() throws IOException, KubeInternalErrorException, KubeResponseException {
//        long userId = 1;
//        HttpResponseTemp<DeploymentDetail> resp = deploymentService.getDeployment(233, userId);
//        DeploymentDetail deploymentDetail = resp.getResult();
//        deploymentDetail.getCurrentReplicas();
//    }

//    @Test
//    public void modifyDeploy() throws KVContentException, KVServerException, IOException {
//        long userId = 1;
//        HttpResponseTemp<DeploymentDraft> resp = deploymentService.getDeployment(233, userId);
//        DeploymentDraft deploymentDraft = resp.getResult();
//        deploymentDraft.getReplicas();
//
//        deploymentDraft.setDeployName("none-exist");
//        deploymentDraft.setReplicas(5);
//        deploymentService.modifyDeployment(deploymentDraft, userId);
//        resp = deploymentService.getDeployment(233, userId);
//        deploymentDraft = resp.getResult();
//        deploymentDraft.getReplicas();
//    }

//    @Test
//    public void listDeploy() throws KubeInternalErrorException, KubeResponseException, IOException {
//        long userId = 1;
//        HttpResponseTemp<?> resp = deploymentService.listDeployment(userId);
//        resp.getResult();
//    }
//
//    @Test
//    public void deleteDeploy() throws IOException {
//        long userId = 1;
//        HttpResponseTemp<?> resp = deploymentService.removeDeployment(156, userId);
//        System.out.println(resp.getResultCode());
//    }

//    @Test
//    public void startDeploy() throws KVContentException, IOException, KVServerException, KubeInternalErrorException, KubeResponseException, DeploymentEventException {
//        long userId = 1;
//        User user = new User();
//        user.setId(userId);
//        user.setUsername("liufei");
//        HttpResponseTemp<?> resp = deploymentService.startDeployment(74, 1, 1, user);
//        System.out.println(resp.getResultCode());
//    }

//    @Test
//    // test update one deployment with lastest version
//    public void updateRC() throws KVContentException, IOException, KVServerException {
//        ClusterContext.init();
//        long userId = 1;
//        long deploymentId = 10;
//        long lastedVersion = 2;
//        // ** start deployment update
//        HttpResponseTemp<?> resp3 = deploymentService.startUpdate(deploymentId, 2, userId);
//        assertEquals(resp3.getResultCode() / 100, 2);
//        HttpResponseTemp<DeploymentUpdateStatus> resp4 = deploymentService.getUpdateStatus(deploymentId, userId);
//        DeploymentUpdateStatus status = resp4.getResult();
//        while(status.getPhase() != DeploymentUpdatePhase.Succeed) {
//            System.out.println("update status:" + status.getPhase());
//            assertNotEquals(status.getPhase(), DeploymentUpdatePhase.Unknown);
//            assertNotEquals(status.getPhase(), DeploymentUpdatePhase.Failed);
//            resp4 = deploymentService.getUpdateStatus(deploymentId, userId);
//            status = resp4.getResult();
//            try {
//                Thread.sleep(1000);
//            } catch (InterruptedException e) {
//                fail("interrupt when check update status");
//            }
//        }
//    }

        /*
    @Test
    public void scaleDeployment() throws KVContentException, IOException, KVServerException {
        ClusterContext.init();
        long userId = 1;
        int dstScale = 3;
        long deployId = 10;
        HttpResponseTemp<?> scaleResp = deploymentService.scaleUpDeployment(deployId, dstScale, userId);
        assertNotNull(scaleResp);
        Assert.assertEquals(scaleResp.getResultCode() / 100, 2);
    }
        */
}
