package org.domeos.client.kubernetesclient.util;

import org.domeos.client.kubernetesclient.definitions.v1.*;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.client.kubernetesclient.definitions.v1beta1.JobCondition;
import org.domeos.client.kubernetesclient.unitstream.ClosableUnitInputStream;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;


/**
 * Created by anningluo on 15-12-2.
 */
public class KubeClientUtils {
    /*
    public static boolean isPodReady(PodStatus podStatus) {
        if (podStatus == null || podStatus.getPhase() == null
                || podStatus.getConditions() == null || podStatus.getContainerStatuses() == null) {
            return false;
        }
        if (!podStatus.getPhase().equals("Running")) {
            return false;
        }
        for (PodCondition condition : podStatus.getConditions()) {
            if (condition.getType().equals("Ready") && condition.getStatus().equals("False")) {
                    return false;
            }
        }
        // check container
        for (ContainerStatus containerStatus : podStatus.getContainerStatuses()) {
            if (!containerStatus.getReady()) {
                return false;
            }
        }
        return true;
    }
    public static boolean isPodReady(Pod pod) {
        if (pod == null) {
            return false;
        }
        return isPodReady(pod.getStatus());
    }
    public static boolean isAllPodReady(PodList podList) {
        if (podList == null) {
            return false;
        }
        for (Pod pod : podList.getItems()) {
            if (!isPodReady(pod)) {
                return false;
            }
        }
        return true;
    }
    */
    public static boolean isContainerReady(ContainerStatus containerStatus) {
        if (containerStatus == null) {
            return false;
        }
        return containerStatus.getReady();
    }
    public static String getPodName(Pod pod) {
        return pod.getMetadata().getName();
    }
    public static String getContainerName(Container container) {
        return container.getName();
    }
    public static Container[] getContainers(Pod pod) {
        return pod.getSpec().getContainers();
    }
    public static Container[] getContainers(PodList podList) {
        List<Container> containerList = new LinkedList<Container>();
        for (Pod pod : podList.getItems()) {
            Collections.addAll(containerList, pod.getSpec().getContainers());
        }
        return (Container[]) containerList.toArray();
    }
    public static Pod[] getPods(PodList podList) {
        return podList.getItems();
    }
    public static String getPodStartTime(Pod pod) {
        // return translateStartTimeToRFC3339(pod.getStatus().getStartTime());
        return pod.getStatus().getStartTime();
    }
    public static String translateStartTimeToRFC3339(String startTime) throws ParseException {
        SimpleDateFormat srcParser = new SimpleDateFormat("YYYY-MM-DD'T'HH:mm:ss'Z'");
        SimpleDateFormat dstFormater = new SimpleDateFormat("YYYY-MM-DD'T'HH:mm:ssXXX");
        Date date = srcParser.parse(startTime);
        return dstFormater.format(date);
    }
    public static <T> LinkedList<T> getAllUnit(ClosableUnitInputStream<T> stream) throws IOException {
        LinkedList<T> list = new LinkedList<T>();
        T entity = stream.read();
        while(entity != null) {
            list.add(entity);
            entity = stream.read();
        }
        stream.close();
        return list;
    }
    /*
    public static PodBriefStatus getPodStatus(PodStatus podStatus) {
        if (podStatus == null || podStatus.getPhase() == null
                || podStatus.getConditions() == null || podStatus.getContainerStatuses() == null) {
            return PodBriefStatus.Unknow;
        }
        switch (podStatus.getPhase()) {
            case "Pending":
                return PodBriefStatus.Pending;
            case "Running":
                if (isPodReady(podStatus)) {
                    return PodBriefStatus.SuccessRunning;
                } else {
                    return PodBriefStatus.Running;
                }
            case "Succeeded":
                return PodBriefStatus.SuccessTerminated;
            case "Failed":
                return PodBriefStatus.FailedTerminated;
            default:
                return PodBriefStatus.Unknow;
        }
    }
    public static PodBriefStatus getPodStatus(Pod pod) {
        return getPodStatus(pod.getStatus());
    }
    */
    public static boolean isJobComplete(Job job) {
        if (job == null) {
            return false;
        }
        for (JobCondition condition : job.getStatus().getConditions()) {
            if (condition.getType() == "Complete" && condition.getStatus() == "True") {
                return true;
            }
        }
        return false;
    }
    public static boolean isAllPodSuccessInJob(Job job) {
        if (job == null || job.getStatus() == null) {
            return false;
        }
        return job.getStatus().getFailed() == 0;
    }
    public static Map<String, String> getLabels(Job job) {
        return job.getSpec().getTemplate().getMetadata().getLabels();
    }
    public static PodSpec getPodSpec(Job job) {
        return job.getSpec().getTemplate().getSpec();
    }
}
