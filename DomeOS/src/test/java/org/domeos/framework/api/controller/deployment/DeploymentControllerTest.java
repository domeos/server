package org.domeos.framework.api.controller.deployment;

import org.apache.shiro.util.ThreadContext;
import org.domeos.api.model.deployment.LoadBalanceDraft;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.CreatorDraft;
import org.domeos.framework.api.consolemodel.deployment.*;
import org.domeos.framework.api.model.deployment.related.*;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.service.deployment.impl.InstanceServiceImpl;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import java.io.FileInputStream;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by xxs on 16/2/1.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class DeploymentControllerTest extends BaseTestCase {

    private static org.slf4j.Logger logger = LoggerFactory.getLogger(InstanceServiceImpl.class);


    @Before
    public void setup() throws Exception {
        ThreadContext.bind(securityManager);
        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");
    }


    @Test
    public void T001CreateDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft1.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T002CreateDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft2.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T003CreateDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T010GetDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/deploy/id/{deployId}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T020ListDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/deploy/list"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T030ModifyDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/deploy/id/{deployId}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());

        DeploymentDraft deploymentDraft = new DeploymentDraft();
        deploymentDraft.setAccessType(DeploymentAccessType.K8S_SERVICE);
        deploymentDraft.setClusterId(1);
        deploymentDraft.setCreateTime(System.currentTimeMillis());
        deploymentDraft.setDeployName("deploy2name");
        deploymentDraft.setExposePortNum(8);
        deploymentDraft.setHostEnv(HostEnv.PROD);
        deploymentDraft.setNamespace("default");
        deploymentDraft.setNetworkMode(NetworkMode.DEFAULT);
        deploymentDraft.setReplicas(33);
        deploymentDraft.setScalable(true);
        deploymentDraft.setStateful(true);

        List<String> volumes = new ArrayList<>();
        volumes.add("/opt/domeos/openxxs/docker:/opt/k8s");
        deploymentDraft.setVolumes(volumes);

        LogDraft logDraft = new LogDraft();
        logDraft.setKafkaBrokers("domeos");
        List<LogItemDraft> logItemDrafts = new ArrayList<>();
        LogItemDraft logItemDraft = new LogItemDraft();
        logItemDraft.setAutoCollect(true);
        logItemDraft.setAutoDelete(true);
        logItemDraft.setLogExpired(3600);
        logItemDraft.setLogPath("/var/logs/docker");
        logItemDraft.setLogTopic("zookeeper");
        logItemDraft.setProcessCmd("|grep docker");
        logItemDrafts.add(logItemDraft);
        logDraft.setLogItemDrafts(logItemDrafts);
        ContainerDraft flumeContainerDraft = new ContainerDraft();
        flumeContainerDraft.setCpu(0.5);
        List<EnvDraft> envDrafts = new ArrayList<>();
        EnvDraft envDraft = new EnvDraft();
        envDraft.setKey("AN_ENV");
        envDraft.setValue("AN_ENV_VALUE");
        envDraft.setDescription("an env for flume");
        envDrafts.add(envDraft);
        flumeContainerDraft.setEnvs(envDrafts);
        List<EnvDraft> checkEnvDrafts = new ArrayList<>();
        EnvDraft checkEnvDraft = new EnvDraft();
        checkEnvDraft.setKey("AN_CHECK_ENV");
        checkEnvDraft.setValue("AN_CHECK_ENV_VALUE");
        checkEnvDraft.setDescription("an check env for flume");
        checkEnvDrafts.add(checkEnvDraft);
        flumeContainerDraft.setEnvCheckers(checkEnvDrafts);
        flumeContainerDraft.setImage("openxxs/flume");
        flumeContainerDraft.setMem(1024);
        flumeContainerDraft.setRegistry("10.11.150.76:5000");
        flumeContainerDraft.setTag("0.1");
        logDraft.setFlumeDraft(flumeContainerDraft);
        deploymentDraft.setLogDraft(logDraft);

        List<LoadBalanceDraft> loadBalanceDrafts = new ArrayList<>();
        LoadBalanceDraft loadBalanceDraft = new LoadBalanceDraft();
        loadBalanceDraft.setClusterId(1);
        loadBalanceDraft.setDeployId(1);
        loadBalanceDraft.setId(2);
        loadBalanceDraft.setName("ldb");
        loadBalanceDraft.setPort(80);
        loadBalanceDraft.setTargetPort(80);
        loadBalanceDraft.setType(LoadBalanceType.TCP);
        List<String> externalIps = new ArrayList<>();
        externalIps.add("10.16.42.199");
        loadBalanceDraft.setExternalIPs(externalIps);
        loadBalanceDrafts.add(loadBalanceDraft);
        deploymentDraft.setLoadBalanceDrafts(loadBalanceDrafts);

        List<LabelSelector> labelSelectors = new ArrayList<>();
        LabelSelector labelSelector = new LabelSelector();
        labelSelector.setName("alabel");
        labelSelector.setContent("ALABELCONTENT");
        labelSelectors.add(labelSelector);
        deploymentDraft.setLabelSelectors(labelSelectors);

        List<InnerServiceDraft> innerServiceDrafts = new ArrayList<>();
        InnerServiceDraft innerServiceDraft = new InnerServiceDraft();
        innerServiceDraft.setDeployId(1);
        innerServiceDraft.setId(2);
        innerServiceDraft.setName("innerService");
        innerServiceDraft.setProtocol(InnerServiceProtocol.TCP);
        innerServiceDraft.setPort(80);
        innerServiceDraft.setTargetPort(80);
        innerServiceDrafts.add(innerServiceDraft);
        deploymentDraft.setInnerServiceDrafts(innerServiceDrafts);

        List<String> hosts = new ArrayList<>();
        hosts.add("10.16.42.198");
        deploymentDraft.setHostList(hosts);

        HealthChecker healthCheckerDraft = new HealthChecker();
        healthCheckerDraft.setType(HealthCheckerType.TCP);
        healthCheckerDraft.setUrl("10.16.42.201");
        healthCheckerDraft.setTimeout(300);
        healthCheckerDraft.setPort(8080);
        deploymentDraft.setHealthCheckerDraft(healthCheckerDraft);

        CreatorDraft creatorDraft = new CreatorDraft();
        creatorDraft.setCreatorId(1);
        creatorDraft.setCreatorType(ResourceOwnerType.USER);
        deploymentDraft.setCreator(creatorDraft);

        List<ContainerDraft> deployContainerDrafts = new ArrayList<>();
        ContainerDraft deployContainerDraft = new ContainerDraft();
        deployContainerDrafts.add(deployContainerDraft);
        deployContainerDraft.setCpu(10);
        List<EnvDraft> deployEnvs = new ArrayList<>();
        EnvDraft deployEnv = new EnvDraft();
        deployEnv.setKey("DEPLOY_ENV");
        deployEnv.setValue("DEPLOY_ENV_VALUE");
        deployEnv.setDescription("deploy env value");
        deployEnvs.add(deployEnv);
        deployContainerDraft.setEnvs(deployEnvs);
        List<EnvDraft> deployCheckEnvs = new ArrayList<>();
        EnvDraft deployCheckEnv = new EnvDraft();
        deployCheckEnv.setKey("DEPLOY_ENV");
        deployCheckEnv.setValue("DEPLOY_ENV_VALUE");
        deployCheckEnv.setDescription("deploy env value");
        deployCheckEnvs.add(deployCheckEnv);
        deployContainerDraft.setEnvCheckers(deployCheckEnvs);
        deployContainerDraft.setImage("10.11.150.76:5000/openxxs/iperf:1.0");
        deployContainerDraft.setMem(10);
        deployContainerDraft.setRegistry("domeos.org");
        deployContainerDraft.setTag("test-tag");
        deploymentDraft.setContainerDrafts(deployContainerDrafts);

        String newDeploymentDraftStr = objectMapper.writeValueAsString(deploymentDraft);
        mockMvc.perform(post("/api/deploy/id/1").contentType(MediaType.APPLICATION_JSON).content(newDeploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/deploy/id/{deployId}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T040RemoveDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/deploy/id/{deployId}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/deploy/id/{deployId}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/deploy/id/{deployId}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.DEPLOYMENT_NOT_EXIST.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T050StartDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/deploy/action/start").param("deployId", "1").param("version", "1").param("replicas", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T060StopDeployment() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/deploy/action/start").param("deployId", "1").param("version", "1").param("replicas", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        Thread.sleep(20000);
        mockMvc.perform(post("/api/deploy/action/stop").param("deployId", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T070ListDeploymentEvent() throws Exception {
        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("----deploymentDraftStr----" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/deploy/action/start").param("deployId", "1").param("version", "1").param("replicas", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        Thread.sleep(20000);
        mockMvc.perform(post("/api/deploy/action/stop").param("deployId", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        Thread.sleep(20000);
        mockMvc.perform(get("/api/deploy/event/list").param("deployId", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }



    /*

    @Test
    public void T080Update() throws Exception {
        mockMvc.perform(post("/api/deploy/action/update").param("deployId", "1").param("versionId", "2").param("replicas", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T090Rollback() throws Exception {
        mockMvc.perform(post("/api/deploy/action/rollback").param("deployId", "1").param("versionId", "1").param("replicas", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T100Scaleup() throws Exception {
        mockMvc.perform(post("/api/deploy/action/scaleup").param("deployId", "1").param("versionId", "1").param("replicas", "2"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T110Scaledown() throws Exception {
        mockMvc.perform(post("/api/deploy/action/scaledown").param("deployId", "1").param("versionId", "1").param("replicas", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T120Scaledown() throws Exception {
        mockMvc.perform(post("/api/deploy/action/scaledown").param("deployId", "1").param("versionId", "1").param("replicas", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    */

}
