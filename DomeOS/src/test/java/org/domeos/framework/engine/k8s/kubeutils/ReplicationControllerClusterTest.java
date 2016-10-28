package org.domeos.framework.engine.k8s.kubeutils;

import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.ReplicationController;
import org.apache.log4j.Logger;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.RCBriefStatus;
import org.domeos.framework.engine.k8s.util.RCUtils;
import org.junit.*;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.junit.runners.Parameterized;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.UUID;

import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assume.assumeNotNull;
import static org.junit.Assume.assumeTrue;

/**
 * Created by anningluo on 15-12-9.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
@RunWith(Parameterized.class)
public class ReplicationControllerClusterTest {
    private static KubeUtils client;
    private static ReplicationController rc;
    private static Logger logger = Logger.getLogger(ReplicationControllerClusterTest.class);
    private static boolean isRCReady = false;

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        ClusterContext.init();
        return Arrays.asList(new Object[][] {
                {ClusterContext.createCentosReplicationController("centos-test-" + UUID.randomUUID(), 3)},
        });
    }

    public ReplicationControllerClusterTest(ReplicationController rc) {
        this.rc = rc;
    }

    @BeforeClass
    public static void setUpClass() throws Exception {
        System.out.println("call setUpClass");
        assumeTrue(ClusterContext.hasCluster());
        ClusterContext.init();
        client = ClusterContext.createKubeClient();
    }

    @Test
    public void t000CreateRC() {
        assumeNotNull(client);
        try {
            ReplicationController rcTmp = client.createReplicationController(rc);
            Assert.assertNotNull(rcTmp);
            Assert.assertEquals(RCUtils.getSelector(rcTmp), RCUtils.getSelector(rc));
        } catch (Exception e) {
            logger.debug("message:" + e.getMessage() + "\n" + e.getStackTrace());
            Assert.fail(e.getMessage());
        }
    }

    @Test(timeout = 120000)
    public void t010CheckRCStatus() {
        assumeNotNull(client);
        RCBriefStatus rcStatus = RCBriefStatus.Unknow;
        try {
            while (rcStatus != RCBriefStatus.SuccessRunning) {
                ReplicationController rcTmp = client.replicationControllerInfo(RCUtils.getName(rc));
                assertNotNull(rcTmp);
                PodList podList = client.listPod(RCUtils.getSelector(rc));
                assertNotNull(podList);
                rcStatus = RCUtils.getStatus(rcTmp, podList);
                assertNotEquals("==== status failed ====\nrc=\n" + rcTmp + "\npodList=\n" + podList,
                        rcStatus, RCBriefStatus.Unknow);
            }
            assertEquals(rcStatus, RCBriefStatus.SuccessRunning);
            isRCReady = true;
        } catch (Exception e) {
            logger.debug("message:" + e.getMessage() + "\n" + e.getStackTrace());
            fail(e.getMessage());
        }
    }

    @Test
    public void t020GetRC() {
        assumeNotNull(client);
        assumeNotNull(rc);
        try {
            ReplicationController rcTmp = client.replicationControllerInfo(RCUtils.getName(rc));
            assertEquals(RCUtils.getSelector(rcTmp), RCUtils.getSelector(rc));
            assertEquals(RCUtils.getName(rcTmp), RCUtils.getName(rc));
        } catch (Exception e){
            logger.debug("message:" + e.getMessage() + "\n" + e.getStackTrace());
            fail(e.getMessage());
        }
    }

    @Test
    public void t030DeleteRC() {
        assumeNotNull(client);
        assumeNotNull(rc);
        try {
            boolean ret = client.deleteReplicationController(RCUtils.getName(rc));
            assertTrue(ret);
        } catch (Exception e) {
            logger.debug("message:" + e.getMessage() + "\n" + e.getStackTrace());
            fail(e.getMessage());
        }
    }

    @AfterClass
    public static void tearDownClass() throws IOException, K8sDriverException {
        System.out.println("call tear down class");
        assumeNotNull(rc);
        assumeNotNull(client);
        assumeNotNull(client.replicationControllerInfo(RCUtils.getName(rc)));
        client.deleteReplicationController(RCUtils.getName(rc));
    }
}
