package org.domeos.framework.engine.k8s.kubeutils;

import io.fabric8.kubernetes.api.model.Secret;
import org.apache.log4j.Logger;

import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.junit.runners.Parameterized;

import java.util.Arrays;
import java.util.Collection;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeNotNull;
import static org.junit.Assume.assumeTrue;

/**
 * Created by baokangwang on 2016/6/27.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
@RunWith(Parameterized.class)
public class secretClusterTest {

    private static KubeUtils client;
    private static Secret secret;
    private static Logger logger = Logger.getLogger(secretClusterTest.class);

    @Parameterized.Parameters
    public static Collection<Object[]> data() {
        ClusterContext.init();
        return Arrays.asList(new Object[][] {
                {ClusterContext.createSecret("harbortest")},
        });
    }

    public secretClusterTest(Secret secret) {
        this.secret = secret;
    }

    @BeforeClass
    public static void setUpClass() throws Exception {
        System.out.println("call setUpClass");
        assumeTrue(ClusterContext.hasCluster());
        ClusterContext.init();
        client = ClusterContext.createKubeClient();
    }

    @Test
    public void t000CreateSecret() {
        assumeNotNull(client);
        try {
            Secret secretTmp = client.createSecret(secret);
            Assert.assertNotNull(secretTmp);
        } catch (Exception e) {
            logger.debug("message:" + e.getMessage() + "\n" + e.getStackTrace());
            Assert.fail(e.getMessage());
        }
    }

    @Test
    public void t001GetSecret() {
        assumeNotNull(client);
        try {
            Secret secretTmp = client.secretInfo("harbortest");
            Assert.assertNotNull(secretTmp);
        } catch (Exception e) {
            logger.debug("message:" + e.getMessage() + "\n" + e.getStackTrace());
            Assert.fail(e.getMessage());
        }
    }

    @Test
    public void t002DeleteSecret() {
        assumeNotNull(client);
        assumeNotNull(secret);
        try {
            boolean ret = client.deleteSecret("harbortest");
            assertTrue(ret);
        } catch (Exception e) {
            logger.debug("message:" + e.getMessage() + "\n" + e.getStackTrace());
            fail(e.getMessage());
        }
    }

}
