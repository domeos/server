package org.domeos.client.kubernetesclient;

import org.domeos.client.kubernetesclient.definitions.v1.NamespaceList;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;

import java.io.IOException;

/**
 * Created by anningluo on 2015/12/16.
 */
public class NamespaceClusterTest {

    public static void main(String[] args) {
        ClusterContext.init();
        KubeClient client = ClusterContext.createKubeClient();
        NamespaceList namespaceList = null;
        try {
            namespaceList = client.listAllNamespace();
        } catch (KubeResponseException | IOException | KubeInternalErrorException e) {
            e.printStackTrace();
        }
        System.out.println("namespaceList=" + namespaceList);
    }
}
