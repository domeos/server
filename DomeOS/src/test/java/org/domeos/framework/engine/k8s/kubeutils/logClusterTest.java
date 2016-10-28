package org.domeos.framework.engine.k8s.kubeutils;

import io.fabric8.kubernetes.api.model.Container;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.extensions.Job;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import io.fabric8.kubernetes.client.dsl.LogWatch;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.engine.k8s.util.JobUtils;
import org.domeos.framework.engine.k8s.util.KubeClientUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;
import java.io.PipedInputStream;

/**
 * Created by anningluo on 15-12-2.
 */
public class logClusterTest  {
    private static KubeUtils<KubernetesClient> client;
    private  static Job job;
    private static PodList podList;
    @BeforeClass
    public static void  setUp() throws K8sDriverException {
        ClusterContext.init();
        client = ClusterContext.createKubeClient();
        job = ClusterContext.createLogJob(1000000);
    }

    @Test
    public void testLog10LineForJob() throws K8sDriverException {
        // create job
        long createJobTimeout = 60 * 1000; // one minute
        podList = null;
        try {
            boolean isCreated = JobUtils.createJobUntilReadyFor(client, job, createJobTimeout);
        }  catch (IOException e) {
            e.printStackTrace();
            Assert.assertTrue("io error error in create job:" + e.getMessage(), false);
        } catch (KubernetesClientException e) {
            e.printStackTrace();
            Assert.assertTrue("kubeclient internal error in create job:" + e.getMessage(), false);
        }

        // log pod
        System.out.println("podlist =\n" + podList);
        final int maxLog = 10;
        try {
            do {
                Thread.sleep(500);
                podList = client.listPod(KubeClientUtils.getLabels(job));
            } while (podList.getItems().size() == 0);
            Pod pod = podList.getItems().get(0);
            Container container1 = KubeClientUtils.getContainers(pod).get(0);
            try (
                 LogWatch watch = client.getClient().pods().withName(KubeClientUtils.getPodName(pod)).tailingLines(10).watchLog()) {
                PipedInputStream pipedInputStream = (PipedInputStream) watch.getOutput();
                Receiver receiver = new Receiver();
                receiver.setIn(pipedInputStream);
                receiver.start();

            } catch (KubernetesClientException e) {
                e.printStackTrace();
                Assert.assertTrue("log failed with kube internal error:" + e.getMessage(), false);
            }
        }  catch (IOException e) {
            e.printStackTrace();
            Assert.assertTrue("log failed with IOException:" + e.getMessage(), false);
        } catch (KubernetesClientException e) {
            e.printStackTrace();
            Assert.assertTrue("log failed with kube internal error:" + e.getMessage(), false);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // **************************************************
    }

    private class Receiver extends Thread {

        private PipedInputStream in;


        public PipedInputStream getIn() {
            return in;
        }

        public void setIn(PipedInputStream in) {
            this.in = in;
        }

        @Override
        public void run(){
//        readMessageOnce() ;
            readMessageContinued() ;
        }

        public void readMessageOnce(){
            byte[] buf = new byte[2048];
            try {
                int len = in.read(buf);
                System.out.println(new String(buf,0,len));
                in.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        public void readMessageContinued() {
            int total=0;
            while(true) {
                byte[] buf = new byte[1024];
                try {
                    int len = in.read(buf);
                    total += len;
                    System.out.println(new String(buf,0,len));
                    if (len == 0)
                        break;
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            try {
                in.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    @AfterClass
    public static void tearDown() {
        if (client == null || podList == null) {
            return;
        }
        try {
            client.deleteJob(job.getMetadata().getName());
            if (podList != null)
                client.deletePod(podList.getItems().get(0).getMetadata().getName());
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
