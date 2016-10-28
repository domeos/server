package org.domeos.framework.engine.k8s.kubeutils;

import io.fabric8.kubernetes.api.model.Node;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.NodeUtils;

import java.io.IOException;

/**
 * Created by anningluo on 2015/12/24.
 */
public class NodeClusterTest {
    public static void main(String[] args) throws IOException, K8sDriverException {
        ClusterContext.init();
        KubeUtils client = ClusterContext.createKubeClient();
        Node node = client.nodeInfo("bx-42-198");
        System.out.println(NodeUtils.isReady(node));

        System.out.println(NodeUtils.getStatus(node));
    }
}
