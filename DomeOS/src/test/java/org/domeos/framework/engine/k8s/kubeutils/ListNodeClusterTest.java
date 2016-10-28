package org.domeos.framework.engine.k8s.kubeutils;

import io.fabric8.kubernetes.api.model.Node;
import io.fabric8.kubernetes.api.model.NodeList;
import io.fabric8.kubernetes.client.KubernetesClientException;
import org.apache.log4j.PropertyConfigurator;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.util.KubeUtils;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Created by anningluo on 15-11-26.
 */
public class ListNodeClusterTest {
    public static void main(String[] args) throws K8sDriverException {
        Properties properties = new Properties();
        properties.put("log4j.rootLogger", "INFO, stdout");
        properties.put("log4j.logger.org.domeos.client", "DEBUG");
        properties.put("log4j.appender.stdout", "org.apache.log4j.ConsoleAppender");
        properties.put("log4j.appender.stdout.layout", "org.apache.log4j.PatternLayout");
        properties.put("log4j.appender.stdout.layout.ConversionPattern", "%5p [%c] %m%n");
        PropertyConfigurator.configure(properties);
        // init
        KubeUtils client = ClusterContext.createKubeClient();
        //
        NodeList nodes = null;
        Node nodeInfo = null;
        Map<String, String> newLabel = new HashMap<>();
        newLabel.put("test-anl6", "ttttt");
        try {
            nodes = client.listNode();
            if (nodes == null) {
                System.out.println("nodes is null");
            } else {
                nodeInfo = client.nodeInfo(nodes.getItems().get(0).getMetadata().getName());
                nodeInfo = client.labelNode(nodeInfo.getMetadata().getName(), newLabel);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (KubernetesClientException e) {
            System.out.println("internal error");
            e.printStackTrace();
        }
        System.out.println("parser body");
        System.out.println(nodes.toString());
    }
}
