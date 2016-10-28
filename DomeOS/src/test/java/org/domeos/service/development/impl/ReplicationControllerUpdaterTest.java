package org.domeos.service.development.impl;

import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.ReplicationController;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.kubeutils.ClusterContext;
import org.domeos.framework.engine.k8s.model.UpdatePhase;
import org.domeos.framework.engine.k8s.model.UpdateStatus;
import org.domeos.framework.engine.k8s.updater.ReplicationControllerUpdater;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.RCBriefStatus;
import org.domeos.framework.engine.k8s.util.RCUtils;
import org.domeos.global.GlobalConstant;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.UUID;

import static org.junit.Assume.assumeNotNull;
import static org.junit.Assume.assumeTrue;
import static org.springframework.test.util.AssertionErrors.fail;

/**
 * Created by anningluo on 2015/12/15.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ReplicationControllerUpdaterTest {
    private static ReplicationController oldRC;
    private static ReplicationController newRC;
    private static KubeUtils<KubernetesClient> client = null;
    private static boolean isCreate = false;
    private static Logger logger = LoggerFactory.getLogger(ReplicationControllerUpdaterTest.class);

    @BeforeClass
    public static void setUp() throws K8sDriverException {
        ClusterContext.init();
        client = ClusterContext.createKubeClient();
        oldRC = ClusterContext.createCentosReplicationController("test-updater1-" + UUID.randomUUID(), 3);
        oldRC.getSpec().getTemplate().getMetadata().getLabels().put(GlobalConstant.VERSION_STR, "old");
        newRC = ClusterContext.createCentosReplicationController("test-updater2-" + UUID.randomUUID(), 5);
        newRC.getSpec().getTemplate().getMetadata().getLabels().put(GlobalConstant.VERSION_STR, "new");
        RCBriefStatus status = RCBriefStatus.Unknow;
        // create rc
        long startTime = System.currentTimeMillis();
        long timeout = 60000;
        try {
            ReplicationController tmpRC;
            while (status != RCBriefStatus.SuccessRunning) {
                tmpRC = client.replicationControllerInfo(RCUtils.getName(oldRC));
                // tmpRC = client.replicationControllerInfo("");
                // client.replaceReplicationController(null, null);
                PodList podList = client.listPod(RCUtils.getSelector(oldRC));
                status = RCUtils.getStatus(tmpRC, podList);
                if (status == RCBriefStatus.Unknow) {
                    break;
                }
                if (timeout < System.currentTimeMillis() - startTime) {
                    break;
                }
                Thread.sleep(500);
            }
            isCreate = status == RCBriefStatus.SuccessRunning;
        } catch (KubernetesClientException | IOException e) {
            logger.info("create rc failed");
            isCreate = false;
        } catch (InterruptedException e) {
            isCreate = false;
        }
    }

    @Test(timeout = 300000)
    public void t000RollingUpdate() {
        assumeNotNull(client);
        assumeTrue(isCreate);
        ReplicationControllerUpdater updater = ReplicationControllerUpdater.RollingUpdater(client, oldRC, newRC);
        updater.start();
        UpdateStatus status;
        while (true) {
            status = updater.getStatus();
            status.getPhase();
            logger.info("update status now is " + status.getPhase().toString());
            if (status.getPhase() == UpdatePhase.Failed) {
                String message = "update failed with message=" + status.getReason()
                        + ", stop at oldPodNumber=" + status.getOldReplicaCount()
                        + ", newPodNumber=" + status.getNewReplicaCount();
                fail(message);
                break;
            } else if (status.getPhase() == UpdatePhase.Succeed) {
                logger.info("update success");
                break;
            }

            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                logger.warn("thread is interrupted, but continue");
            }
        }
        updater.close();
    }

    @AfterClass
    public static void tearDown() throws K8sDriverException {
        assumeTrue(client != null);
        try {
            client.deleteReplicationController(RCUtils.getName(oldRC));
            client.deleteReplicationController(RCUtils.getName(newRC));
        } catch (KubernetesClientException | IOException e) {
            logger.error("delete rc failed");
        }
    }
}
