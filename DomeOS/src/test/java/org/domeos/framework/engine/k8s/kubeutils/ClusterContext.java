package org.domeos.framework.engine.k8s.kubeutils;

import io.fabric8.kubernetes.api.model.*;
import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.api.model.extensions.Job;
import io.fabric8.kubernetes.api.model.extensions.JobBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import okhttp3.TlsVersion;
import org.apache.log4j.PropertyConfigurator;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeClientUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;

import java.util.*;

/**
 * Created by anningluo on 15-12-1.
 */
public class ClusterContext {
    public static String namespace = "default";
    public static boolean pretty = false;
//    public static String apiServer = "10.16.42.200:8080";
//    public static String user;
//    public static String pass;
    public static String apiServer = "http://10.16.42.200:8080";
    public static String user = "admin";
    public static String pass = "admin";
    public static Map<String, String> label;
    public static Random rand = new Random();
    public static boolean isInit = false;
    private static boolean isTestCluster = true;

    public static boolean hasCluster() {
        return apiServer != null && !apiServer.isEmpty()
                && namespace != null && !namespace.isEmpty();
    }
    public static void init() {
        if (isInit) {
            return;
        }
        // set log properties
        Properties properties = new Properties();
        properties.put("log4j.rootLogger", "INFO,DEBUG, stdout");
        properties.put("log4j.logger.org.domeos.client", "DEBUG");
        properties.put("log4j.appender.stdout", "org.apache.log4j.ConsoleAppender");
        properties.put("log4j.appender.stdout.layout", "org.apache.log4j.PatternLayout");
        properties.put("log4j.appender.stdout.layout.ConversionPattern", "%5p [%c] %m%n");
        PropertyConfigurator.configure(properties);
        // set labels
        label = new HashMap<>();
        label.put("user", "anl");
        label.put("type", "test");
        isInit = true;
    }
    public static boolean isTestCluster() {
        return isTestCluster;
    }
    public static Map<String, String> getDefaultLabel() {
        Map<String, String> result = new HashMap<>(label);
        result.put("id", String.valueOf(Math.abs(rand.nextLong())));
        return result;
    }
    public static Map<String, String> getDefaultLabel(String appName) {
        Map<String, String> result = getDefaultLabel();
        result.put("app", appName);
        return result;
    }
    public static KubeUtils<KubernetesClient> createKubeClient() throws K8sDriverException {
        Config config = new ConfigBuilder()
//                .withApiVersion("v1beta1")
                .withNamespace(namespace)
                .withMasterUrl(apiServer)
                .removeFromTlsVersions(TlsVersion.TLS_1_0)
                .removeFromTlsVersions(TlsVersion.TLS_1_1)
                .removeFromTlsVersions(TlsVersion.TLS_1_2)
                .build();
        return Fabric8KubeUtils.buildKubeUtils(config);
    }
    public static Job createCentosJob(Map<String, String> label) {
        // specify job

        List<Container> containers = new ArrayList<>();
        containers.add( new ContainerBuilder()
                .withName("centos-block-test-anl")
                .withImage("10.11.150.76:5000/centos-block:0.1")
                .build() );
        Job job = new JobBuilder()
                .withNewMetadata()
                .withName("test-log-anl1")
                .endMetadata()
                .withNewSpec()
                .withNewTemplate()
                .withNewMetadata()
                .withLabels(label)
                .endMetadata()
                .withNewSpec()
                .withContainers(containers)
                .withRestartPolicy("OnFailure")
                .endSpec()
                .endTemplate()
                .endSpec()
                .build();
        return job;
    }
    public static Job createCentosJob() {
        return createCentosJob(getDefaultLabel());
    }
    public static Job createLogJob(int maxLogNumber) {
        Job job = createCentosJob();
        Container container = KubeClientUtils.getPodSpec(job).getContainers().get(0);
        List<String> commands = new ArrayList<>(1);
        commands.add("/bin/bash");
        container.setCommand(commands);
        List<String> args = new ArrayList<>(Arrays.asList("-c", "for i in `seq 0 " + maxLogNumber +
                "`; do echo \"count $i\"; sleep 1; done"));
        container.setArgs(args);
        return job;
    }
    public static Job createLogJob() {
        return createLogJob(1000);
    }
    public static ReplicationController createCentosReplicationController(String name, int replicas) {
        Map<String, String> label = getDefaultLabel("centos-block");
        return new ReplicationControllerBuilder()
                .withNewMetadata()
                .withName(name)
                .endMetadata()
                .withNewSpec()
                .withReplicas(replicas)
                .withNewTemplate()
                .withNewMetadata()
                .withLabels(label)
                .endMetadata()
                .endTemplate()
                .endSpec()
                .build();
    }

    public static PodSpec createCentosPodSpec(String name) {
        // set container
        Container[] containers = new Container[]{new Container()};
        containers[0].setName(name);
        containers[0].setImage("10.11.150.76:5000/centos-block:0.1");

        // set pod spec
        PodSpec podSpec = new PodSpec();
        podSpec.setContainers(Arrays.asList(containers));
        return podSpec;
    }

    public static PodSpec createLogPodSpec(String name, long maxLogNumber) {
        PodSpec podSpec = createCentosPodSpec(name);
        Container container = podSpec.getContainers().get(0);
        container.setCommand(Arrays.asList("/bin/bash"));
        container.setArgs(Arrays.asList("-c", "for i in `seq 0 " + maxLogNumber +
                "`; do echo \"count $i\"; sleep 1; done"));
        return podSpec;
    }

    public static Pod createLogPod(String name, long maxLogNumber) {
        Pod pod = new Pod();
        pod.setSpec(createLogPodSpec(name, maxLogNumber));
        ObjectMeta meta = new ObjectMeta();
        meta.setName(name);
        meta.setLabels(getDefaultLabel("centos-block"));
        pod.setMetadata(meta);
        return pod;
    }

    public static Service createSVCWith(String name, Map<String, String> selector) {
        Service svc = new Service();
        // meta
        ObjectMeta meta = new ObjectMeta();
        meta.setName(name);
        svc.setMetadata(meta);
        // spec
        ServiceSpec svcSpec = new ServiceSpec();
        svcSpec.setSelector(selector);
        ServicePort svcPort = new ServicePort();
        svcPort.setName("porta");
        svcPort.setPort(rand.nextInt() % 1000 + 6000);
        svcSpec.setPorts(Arrays.asList(svcPort));
        svc.setSpec(svcSpec);

        return svc;
    }

    public static Secret createSecret(String name) {
        Secret result = new SecretBuilder()
                .withNewMetadata()
                .withName(name)
                .endMetadata()
                .build();
        // meta
        ObjectMeta meta = new ObjectMeta();
        meta.setName(name);
        result.setMetadata(meta);
        // data
        result.setData(new HashMap<String, String>(){{
            put(".dockerconfigjson", "eyJhdXRocyI6eyJhYWEuYmJiLmNvbSI6eyJhdXRoIjoiWVdSdGFXNDZTR0Z5WW05eU1USXpORFU9IiwiZW1haWwiOiIifX19");
        }});
        // type
        result.setType("kubernetes.io/dockerconfigjson");
        return result;
    }

    public static String getRandStr(int length) {
        String result = "";
        for (int i = 0; i != (length + 3)/4; i++) {
            int tmp = rand.nextInt();
            result += String.format("%x", tmp);
        }
        return result.substring(0, length);
    }
    public static String getRandStr() {
        return getRandStr(8);
    }
}
