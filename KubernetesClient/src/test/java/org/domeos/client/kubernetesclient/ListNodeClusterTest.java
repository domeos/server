package org.domeos.client.kubernetesclient;

import org.apache.log4j.PropertyConfigurator;
import org.domeos.client.kubernetesclient.definitions.v1.Node;
import org.domeos.client.kubernetesclient.definitions.v1.NodeList;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Created by anningluo on 15-11-26.
 */
public class ListNodeClusterTest {
    public static void main(String[] args) {
        Properties properties = new Properties();
        properties.put("log4j.rootLogger", "INFO, stdout");
        properties.put("log4j.logger.org.domeos.client", "DEBUG");
        properties.put("log4j.appender.stdout", "org.apache.log4j.ConsoleAppender");
        properties.put("log4j.appender.stdout.layout", "org.apache.log4j.PatternLayout");
        properties.put("log4j.appender.stdout.layout.ConversionPattern", "%5p [%c] %m%n");
        PropertyConfigurator.configure(properties);
        // init
        KubeClientContext context = new KubeClientContext();
        context.setPretty(false);
        context.setNamespace("default");
        KubeClient client = new KubeClient("10.16.42.200:8080", context);
        //
        NodeList nodes = null;
        Node nodeInfo = null;
        Map<String, String> newLabel = new HashMap<>();
        newLabel.put("test-anl6", "ttttt");
        try {
            nodes = client.listNode(newLabel);
            if (nodes == null) {
                System.out.println("nodes is null");
            } else {
                nodeInfo = client.nodeInfo(nodes.getItems()[0].getMetadata().getName());
                nodeInfo = client.labelNode(nodeInfo.getMetadata().getName(), newLabel);
            }
        } catch (IOException e) {
            e.printStackTrace();
        } catch (KubeResponseException e) {
            System.out.println("response error");
            e.printStackTrace();
        } catch (KubeInternalErrorException e) {
            System.out.println("internal error");
            e.printStackTrace();
        }
        System.out.println("parser body");
        System.out.println(nodes.toString());
    }
}
