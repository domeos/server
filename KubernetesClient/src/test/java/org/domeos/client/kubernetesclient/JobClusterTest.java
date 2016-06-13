package org.domeos.client.kubernetesclient;

import junit.framework.TestCase;
import org.junit.Before;
import org.junit.Test;

/**
 * Created by anningluo on 15-12-1.
 */
public class JobClusterTest extends TestCase {
    @Before
    public void setUp() {
        ClusterContext.init();
        KubeClient client = ClusterContext.createKubeClient();
    }
    @Test
    public void test(){

    }
    /*
    public static void main(String[] args) {
        ClusterContext.init();
        KubeClient client = ClusterContext.createKubeClient();

        // specify job
        Job job = new Job();
        ObjectMeta metaData = new ObjectMeta();
        ObjectMeta podMetaData = new ObjectMeta();
        JobSpec jobSpec = new JobSpec();
        PodTemplateSpec podTempSpec = new PodTemplateSpec();
        PodSpec podSpec = new PodSpec();
        Map<String, String> labels = new HashMap<>();
        labels.put("test", "job-anl0");
        labels.put("app", "centos-block");
        Container[] container = new Container[]{new Container()};
        container[0].setName("centos-block-test-anl");
        container[0].setImage("10.11.150.76:5000/centos-block:0.1");
        podSpec.setContainers(container);
        podSpec.setRestartPolicy("OnFailure");
        podMetaData.setLabels(labels);
        podTempSpec.setMetadata(podMetaData);
        podTempSpec.setSpec(podSpec);
        jobSpec.setTemplate(podTempSpec);
        metaData.setName("test-job");
        // job.setKind("Job");
        // job.setApiVersion(KubeAPIVersion.v1beta1.toString());
        job.setMetadata(metaData);
        job.setSpec(jobSpec);

        System.out.println(job);
        try {
            client.createJob(job);
            client.getJob(job.getMetadata().getName());
            client.deleteJob(job.getMetadata().getName());
        } catch (KubeInternalErrorException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (KubeResponseException e) {
            e.printStackTrace();
        }
    }
    */
}
