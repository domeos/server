package org.domeos.client;

import org.domeos.client.kubernetesclient.ReplicationControllerClusterTest;
import org.junit.runner.JUnitCore;

/**
 * Created by anningluo on 15-12-9.
 */
public class TestRunner {
    public static void main(String[] args) {
        JUnitCore.runClasses(ReplicationControllerClusterTest.class);
    }
}
