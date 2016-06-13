package org.domeos.client.kubernetesclient;

import org.domeos.client.kubernetesclient.definitions.v1.EventList;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.util.PodBriefStatus;
import org.domeos.client.kubernetesclient.util.PodUtils;
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
    private static KubeClient client;
    private static Pod pod;

    @BeforeClass
    public static void setUpClass() {
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
            assertNotEquals(eventList.getItems().length, 0);
            System.out.println("event List=\n" + eventList);
        } catch (Exception e) {
            fail("list event failed");
        }
    }

    @AfterClass
    public static void tearDown() {
        try {
            client.deletePod(PodUtils.getName(pod));
        } catch (Exception e) {
            System.out.println("delete pod failed\npod=\n" + pod);
        }
    }

    public boolean initPod() {
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
