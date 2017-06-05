package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import io.fabric8.kubernetes.api.model.Job;
import org.domeos.exception.K8sDriverException;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.engine.k8s.util.Fabric8KubeUtils;
import org.domeos.framework.engine.k8s.util.KubeUtils;
import org.domeos.framework.engine.k8s.util.PodUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Created by anningluo on 2015/12/27.
 */
@Component
public class BuildStatusManager {

    @Autowired
    ProjectBiz projectBiz;

    @Autowired
    GlobalBiz globalBiz;

    @Autowired
    ImageBiz imageBiz;

    private ExecutorService executors = Executors.newCachedThreadPool();
    private ScheduledExecutorService monitorExecutor = Executors.newSingleThreadScheduledExecutor();
    // in milliseconds
    private long checkPeriod = 10 * 1000;
    private long checkDelay = 0;
    private AtomicLong preparingExpireTime = new AtomicLong(10 * 60 * 1000);
    private String namespace = "default";
    private Cluster cluster = null;
    private static Logger logger = LoggerFactory.getLogger(BuildStatusManager.class);

    @PostConstruct
    public void init() {
        try {
            monitorExecutor.scheduleAtFixedRate(new BuildChecker(),
                    checkDelay, checkPeriod, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            logger.error("start build monitor thread failed");
        }
    }

    public long getCheckPeriod() {
        return checkPeriod;
    }

    public void setCheckPeriod(long checkPeriod) {
        this.checkPeriod = checkPeriod;
    }

    public long getCheckDelay() {
        return checkDelay;
    }

    public void setCheckDelay(long checkDelay) {
        this.checkDelay = checkDelay;
    }

    public long getPreparingExpireTime() {
        return preparingExpireTime.get();
    }

    public void setPreparingExpireTime(long preparingExpireTime) {
        this.preparingExpireTime.set(preparingExpireTime);
    }

    private KubeUtils getClient() {
        if (cluster == null) {
            synchronized (this) {
                if (cluster == null) {
                    CiCluster ciCluster = globalBiz.getCiCluster();
                    if (ciCluster == null) {
                        return null;
                    }
                    cluster = ciCluster.buildCluster();
                    namespace = ciCluster.getNamespace();
                }
            }
        }

        // TODO: when we have different cluster type, should add more op here
        try {
            return Fabric8KubeUtils.buildKubeUtils(cluster, namespace);
        } catch (K8sDriverException e) {
            logger.error("generate k8s client error, message is " + e);
            return null;
        }
    }

    private boolean deleteJob(KubeUtils client, String jobName)
            throws IOException, K8sDriverException {
        Job job = client.jobInfo(jobName);
        if (job == null) {
            return true;
        }
        Map<String, String> jobSelector;
        client.deleteJob(jobName);
        jobSelector = job.getSpec().getSelector().getMatchLabels();
        if (jobSelector == null) {
            jobSelector = new HashMap<>();
            jobSelector.put("build", jobName);
        }
        PodList podList = client.listPod(jobSelector);
        int count = 0;
        int maxCount = 10;
        while (podList != null && podList.getItems() != null && podList.getItems().size() != 0) {
            if (count >= maxCount) {
                return false;
            }
            for (Pod pod : podList.getItems()) {
                client.deletePod(PodUtils.getName(pod));
            }
            podList = client.listPod(jobSelector);
            count++;
        }
        return true;
    }

    public Map<String, String> getBuildJobSelector(String jobName) {
        Map<String, String> selector = new HashMap<>();
        selector.put("build", jobName);
        return selector;
    }

    private class BuildChecker implements Runnable {
        @Override
        public void run() {
            try {
                if (projectBiz == null || globalBiz == null) {
                    return;
                }
                List<BuildHistory> buildInfoList = projectBiz.getUnGCBuildHistory();
                if (buildInfoList != null && buildInfoList.size() > 0) {
                    for (BuildHistory buildInfo : buildInfoList) {
                        switch (BuildState.valueOf(buildInfo.getState())) {
                            case Success:
                            case Fail:
                                if (buildInfo.getIsGC() == 1) {
                                    // ** gc has been did, don't do it again
                                    continue;
                                }
                                executors.submit(new TerminatedChecker(buildInfo));
                                break;
                            case Preparing:
                                executors.submit(new PrepareChecker(buildInfo));
                                break;
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("check build failed with message=" + e.getMessage());
            }
        }
    }

    private class TerminatedChecker implements Runnable {
        BuildHistory info;

        public TerminatedChecker(BuildHistory info) {
            this.info = info;
        }

        @Override
        public void run() {
            try {
                String jobName = info.getTaskName();
                KubeUtils client = getClient();
                if (client == null) {
                    return;
                }
                if (deleteJob(client, jobName)) {
                    info.setIsGC(1);
                } else {
                    info.setIsGC(0);
                }
                projectBiz.updateBuildGCInfoById(info);
            } catch (Exception e) {
                logger.warn("exception when check build job terminated status, with message="
                        + e.getMessage() + "\n" + Arrays.toString(e.getStackTrace()));
            }
        }
    }

    private class PrepareChecker implements Runnable {
        BuildHistory info;

        public PrepareChecker(BuildHistory info) {
            this.info = info;
        }

        @Override
        public void run() {
            try {
                long createTime = info.getCreateTime();
                if (createTime + preparingExpireTime.get() < System.currentTimeMillis()) {
                    // expired
                    KubeUtils client = getClient();
                    if (deleteJob(client, info.getTaskName())) {
                        info.setIsGC(1);
                    } else {
                        info.setIsGC(0);
                    }
                    info.setState(BuildState.Fail.name());
                    info.setMessage("build failed for expired");
                    projectBiz.updateBuildGCInfoById(info);
                }
            } catch (Exception e) {
                logger.warn("exception when check build job terminated status, with message="
                        + e.getMessage() + "\n" + Arrays.toString(e.getStackTrace()));
            }
        }
    }

}
