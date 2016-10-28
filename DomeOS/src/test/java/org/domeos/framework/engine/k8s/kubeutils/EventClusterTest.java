package org.domeos.framework.engine.k8s.kubeutils;

import io.fabric8.kubernetes.api.model.EventList;
import io.fabric8.kubernetes.api.model.Pod;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.PodBriefStatus;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;

import java.util.UUID;

import static org.junit.Assert.*;
import static org.junit.Assume.assumeNotNull;
import static org.junit.Assume.assumeTrue;

/**
 * Created by anningluo on 2015/12/11.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class EventClusterTest {
    private static KubeUtils client;
    private static Pod pod;

    @BeforeClass
    public static void setUpClass() throws K8sDriverException {
        assumeTrue(ClusterContext.hasCluster());
        ClusterContext.init();
        client = ClusterContext.createKubeClient();
        // this pod will restart frequently to create mount of event
        pod = ClusterContext.createLogPod("centos-for-log-" + UUID.randomUUID(), 10);
        pod.getSpec().setRestartPolicy("Always");
    }

    @Test
    public void t000GetPodEvent() {
        assumeNotNull(client);
        boolean isSuccess = initPod();
        assertTrue("create pod failed, pod=\n" + pod, isSuccess);
        try {
            EventList eventList = client.listEvent(PodUtils.getLabel(pod));
            assertNotNull(eventList);
            assertNotEquals(eventList.getItems().size(), 0);
            System.out.println("event List=\n" + eventList);
        } catch (Exception e) {
            fail("list event failed");
        }
    }

//    @Test
//    public void t001WatchEvent() {
//        assumeNotNull(client);
//        try {
//            client.watchEvent(null, new TimeoutResponseHandler<Event>() {
//                int count;
//                @Override
//                public boolean handleResponse(Event unit) throws IOException, ClientProtocolException {
//                    System.out.println("one event occur" + unit.toString());
//                    count++;
//                    return count < 3;
//                }
//                @Override
//                public long getTimeout() {
//                    return 3000;
//                }
//                @Override
//                public boolean handleTimeout() {
//                    return count < 3;
//                }
//            });
//        }  catch (IOException e) {
//            e.printStackTrace();
//            fail("io exception occur:" + e);
//        } catch (KubernetesClientException e) {
//            e.printStackTrace();
//            fail("internal error occur:" + e);
//        }
//    }

    @AfterClass
    public static void tearDown() {
        try {
            client.deletePod(PodUtils.getName(pod));
        } catch (Exception e) {
            System.out.println("delete pod failed\npod=\n" + pod);
        }
    }

    private boolean initPod() {
        try {
            Pod tmpPod = client.createPod(pod);
            PodBriefStatus podStatus = PodUtils.getStatus(tmpPod);
            while (podStatus != PodBriefStatus.SuccessRunning) {
                tmpPod = client.podInfo(PodUtils.getName(pod));
                if (tmpPod == null) {
                    return false;
                }
                podStatus = PodUtils.getStatus(tmpPod);
                if (podStatus == PodBriefStatus.Unknow) {
                    return false;
                }
                if (podStatus == PodBriefStatus.SuccessTerminated) {
                    return true;
                }
                Thread.sleep(500);
            }
        } catch (Exception e) {
            System.out.println("create pod failed\npod=\n" + pod);
            return false;
        }
        return true;
    }
}
