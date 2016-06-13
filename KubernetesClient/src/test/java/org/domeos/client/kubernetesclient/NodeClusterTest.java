package org.domeos.client.kubernetesclient;

import org.domeos.client.kubernetesclient.definitions.v1.Node;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.NodeUtils;

import java.io.IOException;

/**
 * Created by anningluo on 2015/12/24.
 */
public class NodeClusterTest {
    public static void main(String[] args) throws KubeResponseException, IOException, KubeInternalErrorException {
        ClusterContext.init();
        KubeClient client = ClusterContext.createKubeClient();
        Node node = client.nodeInfo("bx-42-197");
        System.out.println(NodeUtils.isReady(node));

        System.out.println(NodeUtils.getStatus(node));
    }
}
