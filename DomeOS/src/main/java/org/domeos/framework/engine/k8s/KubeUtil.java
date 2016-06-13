package org.domeos.framework.engine.k8s;

import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.definitions.v1.Service;
import org.domeos.client.kubernetesclient.definitions.v1.ServiceList;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.exception.TimeoutException;

import java.io.IOException;
import java.util.Map;

/**
 * Created by anningluo on 2016/1/20.
 */
public class KubeUtil {
    private KubeClient client;

    public KubeUtil(KubeClient client) {
        this.client = client;
    }

    public KubeUtil(String apiServer) {
        client = new KubeClient(apiServer);
    }

    public void deleteService(Map<String, String> selector)
            throws KubeResponseException, KubeInternalErrorException, TimeoutException, IOException {
        deleteService(selector, 400, 2000);
    }

    public void deleteService(Map<String, String> selector, long interBreak /* in millisecond */,
                long timeout /* in millisecond */)
            throws KubeResponseException, IOException, KubeInternalErrorException, TimeoutException {
        long startTimePoint = System.currentTimeMillis();
        ServiceList serviceList = client.listService(selector);
        while (serviceList != null && serviceList.getItems() != null
                && serviceList.getItems().length != 0) {
            if (System.currentTimeMillis() - startTimePoint > timeout) {
                throw new TimeoutException("time out when try to delete service with selector="
                        + selector);
            }
            for (Service service : serviceList.getItems()) {
                client.deleteService(service.getMetadata().getName());
            }
            try {
                Thread.sleep(interBreak);
            } catch (InterruptedException e) {
                // ignore and continue
            }
            serviceList = client.listService(selector);
        }
    }

    public void clearNotRunningPod(PodList podList)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        if (podList == null || podList.getItems() == null || podList.getItems().length == 0) {
            return;
        }
        for (Pod pod : podList.getItems()) {
            switch (PodUtils.getStatus(pod)) {
                case Terminating:
                case SuccessTerminated:
                case FailedTerminated:
                    // do clear
                    client.deletePod(pod.getMetadata().getName());
            }
        }
    }

    // in millisecond
    public void clearNotRunningPodAndWait(Map<String, String> selector, long interBreak, long timeout)
            throws KubeResponseException, IOException, KubeInternalErrorException, TimeoutException {
        PodList podList = client.listPod(selector);
        long startTimePoint = System.currentTimeMillis();
        while (podList != null) {
            if (System.currentTimeMillis() - startTimePoint > timeout) {
                throw new TimeoutException("try to delete not running pod failed");
            }
            clearNotRunningPod(podList);
            // ** wait
            try {
                Thread.sleep(interBreak);
            } catch (InterruptedException e) {
                // ignore and continue
            }
            podList  = client.listPod(selector);
        }
    }
}
