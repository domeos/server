package org.domeos.client.kubernetesclient;

import org.apache.log4j.Logger;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodBriefStatus;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.junit.runners.Parameterized;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.UUID;

import static org.hamcrest.CoreMatchers.*;
import static org.junit.Assume.*;
import static org.junit.Assert.*;

/**
 * Created by anningluo on 2015/12/10.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
@RunWith(Parameterized.class)
public class PodClusterTest {
    private static KubeClient client;
    private static Logger logger = Logger.getLogger(PodClusterTest.class);

    private static Pod pod;
    private static boolean isPodReady = false;
    private static long runtimePredict = -1;
    // private static long count = 0;
    // private static long classCount = 0;

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        ClusterContext.init();
        assumeNotNull(ClusterContext.hasCluster());
        Pod pod0 = ClusterContext.createLogPod("log-test-" + UUID.randomUUID(), 30);
        pod0.getSpec().setRestartPolicy("Never");
        Pod pod1 = ClusterContext.createLogPod("log-test-" + UUID.randomUUID(), 1000000);
        pod1.getSpec().setRestartPolicy("Never");
        return Arrays.asList(new Object[][] {
                {pod0, 30},
                {pod1, 1000000}
        });
    }

    public PodClusterTest(Pod pod, long runtimePredict) {
        PodClusterTest.pod = pod;
        PodClusterTest.runtimePredict = runtimePredict;
    }

    @BeforeClass
    public static void setUpClass() {
        assumeNotNull(ClusterContext.hasCluster());
        client = ClusterContext.createKubeClient();
    }

    @Test
    public void t000CreatePod() {
        assumeNotNull(client);
        assumeNotNull(pod);
        Pod tmpPod = null;
        try {
            tmpPod = client.createPod(pod);
            assertNotNull(tmpPod);
            assertEquals(PodUtils.getName(pod), PodUtils.getName(tmpPod));
            assertEquals(PodUtils.getLabel(pod), PodUtils.getLabel(tmpPod));
        } catch (Exception e) {
            fail(getExceptionMessage(e, pod));
        }
    }

    @Test(timeout = 120000)
    public void t010CheckPodStatus() {
        assumeNotNull(client);
        assumeNotNull(pod);
        Pod tmpPod = null;
        PodBriefStatus podStatus = PodBriefStatus.Unknow;
        try {
            while (podStatus != PodBriefStatus.SuccessRunning
                    && podStatus != PodBriefStatus.SuccessTerminated) {
                tmpPod = client.podInfo(PodUtils.getName(pod));
                assertNotNull(tmpPod);
                assertEquals(PodUtils.getName(pod), PodUtils.getName(tmpPod));
                assertEquals(PodUtils.getLabel(pod), PodUtils.getLabel(tmpPod));
                podStatus = PodUtils.getStatus(tmpPod);
                assertNotEquals(podStatus, PodBriefStatus.Unknow);
                System.out.println("pod status=" + PodUtils.getStatus(tmpPod));
                assertThat(podStatus,
                        allOf(not(PodBriefStatus.Unknow), not(PodBriefStatus.FailedTerminated)));
            }
            isPodReady = true;
            System.out.println("isPodReady=" + isPodReady);
        } catch (Exception e) {
            fail(getExceptionMessage(e, pod));
        }
    }

    @Test(timeout = 60000)
    public void t020SuccessTerminal() {
        System.out.println("isPodReady=" + isPodReady);
        assumeTrue(isPodReady);
        assumeTrue("skip with runtimePredict=" + runtimePredict, runtimePredict < 60000);
        Pod tmpPod = null;
        try {
            while (!PodUtils.isTerminal(tmpPod)) {
                System.out.println("podStatus=" + PodUtils.getStatus(tmpPod));
                Thread.sleep(500);
                tmpPod = client.podInfo(PodUtils.getName(pod));
                assertNotNull(tmpPod);
                assertNotEquals(PodUtils.getStatus(tmpPod), PodBriefStatus.Unknow);
            }
        } catch (Exception e) {
            fail(getExceptionMessage(e, tmpPod));
        }
    }

    @Test
    public void t030DeletePod() {
        assumeTrue(isPodReady);
        try {
            boolean isSuc = client.deletePod(PodUtils.getName(pod));
            assertTrue(isSuc);
            isPodReady = false;
        } catch (Exception e) {
            fail(getExceptionMessage(e, pod));
        }
    }

    @AfterClass
    public static void tearDown() throws KubeResponseException, IOException, KubeInternalErrorException {
        assumeNotNull(client);
        client.deletePod(PodUtils.getName(pod));
    }

    public static String getExceptionMessage(Exception e, Object obj) {
        return "message=" + e.getMessage() + "\n" + e.getStackTrace() + "Pod=\n" + obj;
    }
    public static String getExceptionMessage(Exception e) {
        return "message=" + e.getMessage() + "\n" + e.getStackTrace();
    }
}
