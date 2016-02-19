package org.domeos.client.kubernetesclient;

import junit.framework.TestCase;
import org.apache.http.client.ClientProtocolException;
import org.domeos.client.kubernetesclient.definitions.v1.Container;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.KubeClientUtils;
import org.domeos.client.kubernetesclient.util.TimeoutResponseHandler;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

/**
 * Created by anningluo on 15-12-2.
 */
public class logClusterTest extends TestCase {
    private KubeClient client;
    private Job job;
    private PodList podList;
    @Before
    public void setUp() {
        ClusterContext.init();
        client = ClusterContext.createKubeClient();
        job = ClusterContext.createLogJob(1000000);
    }
    @Test
    public void testLog10LineForJob() {
        // create job
        long createJobTimeout = 60 * 1000; // one minute
        podList = null;
//        try {
//            boolean isCreated = JobUtils.createJobUntilReadyFor(client, job, createJobTimeout);
//        } catch (KubeResponseException e) {
//            e.printStackTrace();
//            Assert.assertTrue("rest client response error in create job:" + e.getMessage(), false);
//        } catch (IOException e) {
//            e.printStackTrace();
//            Assert.assertTrue("io error error in create job:" + e.getMessage(), false);
//        } catch (KubeInternalErrorException e) {
//            e.printStackTrace();
//            Assert.assertTrue("kubeclient internal error in create job:" + e.getMessage(), false);
//        }

        // log pod
        System.out.println("podlist =\n" + podList);
        final int maxLog = 10;
        try {
            do {
                Thread.sleep(500);
                podList = client.listPod(KubeClientUtils.getLabels(job));
            } while (podList.getItems().length == 0);
            Pod pod = podList.getItems()[0];
            Container container1 = KubeClientUtils.getContainers(pod)[0];
            client.tailfLog(KubeClientUtils.getPodName(pod),
                    KubeClientUtils.getContainerName(container1),
                    false, new TimeoutResponseHandler<String>() {
                private int count = 0;

                @Override
                public boolean handleResponse(String log) throws IOException, ClientProtocolException {
                    System.out.println("[LOG]" + log);
                    count++;
                    return count < maxLog;
                }
                @Override
                public void handleNomalOver() {
                    Assert.assertEquals(count, maxLog);
                }
                @Override
                public void handleNotFound() {
                    Assert.assertTrue("no log resource can be found", false);
                }
            });
        } catch (KubeResponseException e) {
            e.printStackTrace();
            Assert.assertTrue("log failed with response exception:" + e.getMessage(), false);
        } catch (IOException e) {
            e.printStackTrace();
            Assert.assertTrue("log failed with IOException:" + e.getMessage(), false);
        } catch (KubeInternalErrorException e) {
            e.printStackTrace();
            Assert.assertTrue("log failed with kube internal error:" + e.getMessage(), false);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // **************************************************
        return;
    }
    @After
    public void tearDown() {
        if (client == null || podList == null) {
            return;
        }
        try {
            client.deleteJob(job.getMetadata().getName());
            if (podList != null)
                client.deletePod(podList.getItems()[0].getMetadata().getName());
        } catch (Exception e) {
            System.out.print("Delete job failed, message=" + e.getMessage());
            e.printStackTrace();
        }
    }
    /*
    public static void main(String[] args) {
        ClusterContext.init();
        KubeClient client = ClusterContext.createKubeClient();


        // specify job
        Job job = new Job();
        job.putMetadata(new ObjectMeta())
           .putSpec(new JobSpec());
        job.getMetadata().putName("test-log-anl1");
        job.getSpec().putTemplate(new PodTemplateSpec());
        job.getSpec().getTemplate()
                .putMetadata(new ObjectMeta())
                .putSpec(new PodSpec());
        Map<String, String> labels = new HashMap<>();
        labels.put("test", "log-anl1");
        labels.put("app", "centos-block");
        job.getSpec().getTemplate().getMetadata()
                .putLabels(labels);
        job.getSpec().getTemplate().putSpec(new PodSpec());
        Container[] container = new Container[]{new Container()};
        container[0].setName("centos-block-test-anl");
        container[0].setImage("10.11.150.76:5000/centos-block:0.1");
        container[0].setCommand(new String[] {"/bin/bash"});
        container[0].setArgs(new String[] {"-c", "for i in `seq 0 1000000`; do echo \"count $i\"; sleep 1; done"});
        job.getSpec().getTemplate().getSpec()
                .putContainers(container)
                .putRestartPolicy("OnFailure");

        //**************************** first check pod ready
        System.out.println("job=\n" + job);
        PodList podList = null;
        try {
            job = client.createJob(job);
            Map<String, String> selector = KubeClientUtils.getLabels(job);
            podList = client.listPod(selector);
            client.watchPod(podList, selector, new UnitInputStreamResponseHandler<Pod>() {
                @Override
                public void handleResponse(UnitInputStream<Pod> input) throws ClientProtocolException, IOException {
                    if (input == null) {
                        System.out.println("input is null");
                        return;
                    }
                    Pod pod = null;
                    System.out.println("==== Start watch pod ====");
                    do {
                        pod = input.read();
                        if (pod == null) {
                            System.out.println("Watch terminate. But is not ready util now");
                            break;
                        }
                        System.out.println("[Status]" + KubeClientUtils.getStatus(pod));
                    } while(KubeClientUtils.getStatus(pod) != PodBriefStatus.SuccessRunning);
                    System.out.println("==== check status done ====");
                    return;
                }
            });

            // ******************** second read log
            System.out.println("podlist =\n" + podList);
            Pod pod = podList.getItems()[0];
            Container container1 = KubeClientUtils.getContainers(pod)[0];
            client.tailfLog(KubeClientUtils.getPodName(pod),
                    KubeClientUtils.getContainerName(container1),
                    true, new UnitInputStreamResponseHandler<String>() {
                        @Override
                        public void handleResponse(UnitInputStream<String> stream)
                                throws IOException, ClientProtocolException{
                            if (stream == null) {
                                System.out.println("[LOGSTREAM] null. 404!!!");
                            }
                            String logLine = null;
                            int count = 0;
                            do {
                                try {
                                    logLine = stream.read();
                                    System.out.println("[LOGSTREAM]" + logLine);
                                } catch (IOException e) {
                                    e.printStackTrace();
                                }
                                count ++;
                                // just read 10 lines and exit early
                                if (count == 10) {
                                    break;
                                }
                            } while(logLine != null);
                            return;
                        }
                    });
            // **************************************************
            /*
            do {
                logLine = logStream.read();
                System.out.println("[log]" + logLine);
            } while (logLine != null);
            */
            /*
            pod = podList.getItems()[0];
            String podName = KubeClientUtils.getPodName(pod);
            String containerName = KubeClientUtils.getContainers(pod)[0].getName();
            String startTime = KubeClientUtils.getPodStartTime(pod);
            String[] logLines = null;
            for (int i = 0; i != 10; i++) {
                logLines = client.readLogSince(
                        podName,
                        containerName,
                        startTime);
                for (String logLine : logLines) {
                    System.out.println("[log]" + logLines);
                }
                startTime = KubeClientUtils.translateStartTimeToRFC3339(logLines[logLines.length - 1]);
            }
            */
                /*
                Pod event= client.tailLog(podList.getItems()[0].getMetadata().getName(),
                        job.getSpec().getTemplate().getSpec().getContainers()[0].getName(),
                        10, true);
                System.out.print("[log]\n" + event.getStatus());
                */
    /*
        } catch (KubeInternalErrorException e) {
            System.out.println("[ERROR]" + e.getMessage());
            e.printStackTrace();
        } catch (IOException e) {
            System.out.println("[ERROR]" + e.getMessage());
            e.printStackTrace();
        } catch (KubeResponseException e) {
            System.out.println("[ERROR]" + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.out.println("[ERROR]" + e.getMessage());
            e.printStackTrace();
        }
        try {
            client.deleteJob(job.getMetadata().getName());
            if (podList != null)
                client.deletePod(podList.getItems()[0].getMetadata().getName());
        } catch (Exception e) {
            System.out.print("Delete job failed, message=" + e.getMessage());
            e.printStackTrace();
        }
    }
    */
}
