package org.domeos.service.development.impl;

import org.apache.log4j.PropertyConfigurator;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.KubeClientContext;
import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobSpec;
import org.domeos.client.kubernetesclient.util.KubeClientUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.Random;

/**
 * Created by anningluo on 15-12-1.
 */
public class ClusterContext {
    public static String namespace = "default";
    public static boolean pretty = false;
    public static String apiServer = "10.16.42.200:8080";
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
        // properties.put("log4j.logger.org.domeos.client", "DEBUG");
        properties.put("log4j.logger.org.domeos.api.service.deployment.impl.updater", "DEBUG");
        properties.put("log4j.appender.stdout", "org.apache.log4j.ConsoleAppender");
        properties.put("log4j.appender.stdout.layout", "org.apache.log4j.PatternLayout");
        properties.put("log4j.appender.stdout.layout.ConversionPattern", "%5p [%c] %m%n");
        PropertyConfigurator.configure(properties);
        // set labels
        label = new HashMap<String, String>();
        label.put("user", "anl");
        label.put("type", "test");
        isInit = true;
    }
    public static boolean isTestCluster() {
        return isTestCluster;
    }
    public static Map<String, String> getDefaultLabel() {
        Map<String, String> result = new HashMap<String, String>(label);
        result.put("id", String.valueOf(Math.abs(rand.nextLong())));
        return result;
    }
    public static Map<String, String> getDefaultLabel(String appName) {
        Map<String, String> result = getDefaultLabel();
        result.put("app", appName);
        return result;
    }
    public static KubeClient createKubeClient() {
        KubeClientContext context = new KubeClientContext();
        context.setNamespace(namespace);
        context.setPretty(pretty);
        return new KubeClient(apiServer, context);
    }
    public static Job createCentosJob(Map<String, String> label) {
        // specify job
        Job job = new Job();
        job.putMetadata(new ObjectMeta())
                .putSpec(new JobSpec());
        job.getMetadata().putName("test-log-anl1");
        job.getSpec().putTemplate(new PodTemplateSpec());
        job.getSpec().getTemplate()
                .putMetadata(new ObjectMeta())
                .putSpec(new PodSpec());
        job.getSpec().getTemplate().getMetadata()
                .putLabels(label);
        job.getSpec().getTemplate().putSpec(new PodSpec());
        Container[] container = new Container[]{new Container()};
        container[0].setName("centos-block-test-anl");
        container[0].setImage("10.11.150.76:5000/centos-block:0.1");
        job.getSpec().getTemplate().getSpec()
                .putContainers(container)
                .putRestartPolicy("OnFailure");
        return job;
    }
    public static Job createCentosJob() {
        return createCentosJob(getDefaultLabel());
    }
    public static Job createLogJob(int maxLogNumber) {
        Job job = createCentosJob();
        Container container = KubeClientUtils.getPodSpec(job).getContainers()[0];
        container.setCommand(new String[]{"/bin/bash"});
        container.setArgs(new String[]{"-c", "for i in `seq 0 " + maxLogNumber +
                "`; do echo \"count $i\"; sleep 1; done"});
        return job;
    }
    public static Job createLogJob() {
        return createLogJob(1000);
    }
    public static ReplicationController createCentosReplicationController(String name, int replicas) {
        ReplicationController result = new ReplicationController();
        // meta
        ObjectMeta meta = new ObjectMeta();
        meta.setName(name);
        result.setMetadata(meta);
        // pod template spec
        Map<String, String> label = getDefaultLabel("centos-block");
        PodTemplateSpec templateSpec = new PodTemplateSpec();
        templateSpec.putMetadata(new ObjectMeta()).getMetadata().setLabels(label);
        templateSpec.putSpec(createCentosPodSpec(name));
        // rc spec
        ReplicationControllerSpec spec = new ReplicationControllerSpec();
        spec.putReplicas(replicas).putTemplate(templateSpec);
        result.putSpec(spec);
        return result;
    }

    public static PodSpec createCentosPodSpec(String name) {
        // set container
        Container[] containers = new Container[]{new Container()};
        containers[0].setName(name);
        containers[0].setImage("10.11.150.76:5000/centos-block:0.1");

        // set pod spec
        PodSpec podSpec = new PodSpec();
        podSpec.setContainers(containers);
        return podSpec;
    }

    public static PodSpec createLogPodSpec(String name, long maxLogNumber) {
        PodSpec podSpec = createCentosPodSpec(name);
        Container container = podSpec.getContainers()[0];
        container.setCommand(new String[]{"/bin/bash"});
        container.setArgs(new String[]{"-c", "for i in `seq 0 " + maxLogNumber +
                "`; do echo \"count $i\"; sleep 1; done"});
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
        svcSpec.setPorts(new ServicePort[] {svcPort});
        svc.setSpec(svcSpec);

        return svc;
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
