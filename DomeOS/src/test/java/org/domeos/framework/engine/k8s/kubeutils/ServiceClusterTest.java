package org.domeos.framework.engine.k8s.kubeutils;

import io.fabric8.kubernetes.api.model.*;
import org.apache.log4j.Logger;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.RCBriefStatus;
import org.domeos.framework.engine.k8s.util.RCUtils;
import org.domeos.framework.engine.k8s.util.ServiceUtils;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.junit.runners.Parameterized;

import java.util.*;

import static junit.framework.Assert.assertNotNull;
import static junit.framework.TestCase.fail;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assume.assumeNotNull;
import static org.junit.Assume.assumeTrue;

/**
 * Created by anningluo on 2015/12/10.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
@RunWith(Parameterized.class)
public class ServiceClusterTest {
    private static KubeUtils client;
    private Service svc;
    private ReplicationController rc;
    private Logger logger = Logger.getLogger(ServiceClusterTest.class);
    private static boolean isSVCCreate = false;

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        ClusterContext.init();
        ReplicationController rc0 = ClusterContext.createCentosReplicationController("test-svc-of-centos-rc", 3);
        Service svc0= ClusterContext.createSVCWith(RCUtils.getName(rc0) + "-" + ClusterContext.getRandStr(2),
                RCUtils.getSelector(rc0));
        rc0.getMetadata().setName(RCUtils.getName(rc0) + "-" + UUID.randomUUID());
        return Arrays.asList(new Object[][]{
                {rc0, svc0}
        });
    }

    @BeforeClass
    public static void setUpClass() throws K8sDriverException {
        ClusterContext.init();
        assumeTrue(ClusterContext.hasCluster());
        client = ClusterContext.createKubeClient();
    }

    public ServiceClusterTest(ReplicationController rc, Service svc) {
        String rcName = rc.getMetadata().getName();
        this.svc = svc;
        this.rc = rc;
        System.out.println("!!!!!!!!service name=" + ServiceUtils.getName(svc));
    }

    @Test
    public void t000CreateSVC() {
        System.out.println("!!!!!!!!service name=" + ServiceUtils.getName(svc));
        assumeNotNull(client);
        boolean success = initRC();
        System.out.println("!!!!!!!!service name=" + ServiceUtils.getName(svc));
        assertTrue("create related rc failed", success);
        try {
            Service tmpSVC = client.createService(svc);
            assertNotNull(tmpSVC);
            assertEquals(ServiceUtils.getName(tmpSVC), ServiceUtils.getName(svc));
            assertEquals(ServiceUtils.getSelector(tmpSVC), ServiceUtils.getSelector(svc));
        } catch (Exception e) {
            fail("create service failed, svc=\n" + svc + "\nmessage=" + e.getMessage());
        }
        System.out.println("!!!!!!!!service name=" + ServiceUtils.getName(svc));
        isSVCCreate = true;
    }

    @Test
    public void t010CheckEndpoint() {
        System.out.println("!!!!!!!!service name=" + ServiceUtils.getName(svc));
        assumeNotNull(client);
        assumeNotNull(svc);
        try {
            Service tmpSVC = client.serviceInfo(ServiceUtils.getName(svc));
            assertNotNull(tmpSVC);
            assertEquals(ServiceUtils.getName(tmpSVC), ServiceUtils.getName(svc));
            assertEquals(ServiceUtils.getSelector(tmpSVC), ServiceUtils.getSelector(svc));
            Endpoints endpoints = client.endpointsInfo(ServiceUtils.getName(svc));
            assertNotNull(endpoints);
            PodList podList = client.listPod(ServiceUtils.getSelector(svc));
            assertNotNull(podList);
            Set<String> podIPSet = new HashSet<String>();
            Set<String> extraIPSet = new HashSet<>();
            for (Pod pod : podList.getItems()) {
                podIPSet.add(pod.getStatus().getPodIP());
            }
            for (EndpointSubset subset : endpoints.getSubsets()) {
                for (EndpointAddress address : subset.getAddresses()) {
                    if (!podIPSet.contains(address.getIp())) {
                        extraIPSet.add(address.getIp());
                    }
                    podIPSet.remove(address.getIp());
                }
            }
            assertTrue("endpoints is not match podlist, with\npodIPSet=" + podIPSet
                    + "\nextraIPSet=" + extraIPSet,
                    podIPSet.isEmpty() && extraIPSet.isEmpty());
        } catch (Exception expect) {
            fail("check endpoint failed, svc=\n" + svc + "\nmessage=" + expect.getMessage());
        }
    }

    @Test
    public void t020deleteSVC() {
        System.out.println("!!!!!!!!service name=" + ServiceUtils.getName(svc));
        assumeTrue(isSVCCreate);
        try {
            boolean isSuccess = client.deleteService(ServiceUtils.getName(svc));
            assertTrue(isSuccess);
        } catch (Exception e) {
            fail("delete service failed\nsvc=" + svc + "\nmessage=" + e.getMessage());
        }
        deleteRC();
        isSVCCreate = false;
    }

    private boolean deleteRC() {
        if (!isSVCCreate) {
            return false;
        }
        boolean isDelete = false;
        try {
            isDelete = client.deleteReplicationController(RCUtils.getName(rc));
        } catch (Exception e) {
            logger.error("delete rc failed.\nmessage=" + e.getMessage() + "\nrc=" + rc + "\n" + e.getStackTrace());
            return false;
        }
        return isDelete;
    }


    private boolean initRC() {
        try {
            ReplicationController tmpRC = client.createReplicationController(rc);
            RCBriefStatus rcStatus = RCBriefStatus.Unknow;
            PodList podList = null;
            while (rcStatus != RCBriefStatus.SuccessRunning) {
                tmpRC = client.replicationControllerInfo(RCUtils.getName(rc));
                podList = client.listPod(RCUtils.getSelector(rc));
                if (tmpRC == null || podList == null) {
                    return false;
                }
                rcStatus = RCUtils.getStatus(tmpRC, podList);
                if (rcStatus == RCBriefStatus.Unknow) {
                    return false;
                }
                System.out.println("!!!!!!!!!RC status=" + rcStatus);
                Thread.sleep(500);
            }
        } catch (Exception e) {
            logger.error("create rc failed.\nmessage=" + e.getMessage() + "\nrc=" + rc + "\n" + e.getStackTrace());
            return false;
        }
        return true;
    }
}
