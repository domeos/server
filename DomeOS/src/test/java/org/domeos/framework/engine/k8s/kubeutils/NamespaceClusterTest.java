package org.domeos.framework.engine.k8s.kubeutils;



import io.fabric8.kubernetes.api.model.NamespaceList;
import io.fabric8.kubernetes.client.KubernetesClientException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.util.KubeUtils;

import java.io.IOException;

/**
 * Created by anningluo on 2015/12/16.
 */
public class NamespaceClusterTest {

    public static void main(String[] args) throws K8sDriverException {
        ClusterContext.init();
        KubeUtils client = ClusterContext.createKubeClient();
        NamespaceList namespaceList = null;
        try {
            namespaceList = client.listAllNamespace();
        } catch (KubernetesClientException | IOException e) {
            e.printStackTrace();
        }
        System.out.println("namespaceList=" + namespaceList);
    }
}
