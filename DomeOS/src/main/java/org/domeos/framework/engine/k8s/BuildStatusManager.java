package org.domeos.framework.engine.k8s;

import org.apache.log4j.Logger;
import org.domeos.client.kubernetesclient.KubeClient;
import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.definitions.v1beta1.Job;
import org.domeos.client.kubernetesclient.exception.KubeInternalErrorException;
import org.domeos.client.kubernetesclient.exception.KubeResponseException;
import org.domeos.client.kubernetesclient.util.PodUtils;
import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.model.image.BaseImageCustom;
import org.domeos.framework.api.biz.global.GlobalBiz;
import org.springframework.beans.factory.annotation.Autowired;

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
public class BuildStatusManager {
    /*
    private static BuildStatusManager INSTANCE;
    public static BuildStatusManager getInstance() {
        return INSTANCE;
    }
    */

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
    private String apiServer = null;
    private static Logger logger = Logger.getLogger(BuildStatusManager.class);

    public void init() {
        try {
            monitorExecutor.scheduleAtFixedRate(new BuildChecker(),
                    checkDelay, checkPeriod, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            logger.fatal("start build monitor thread failed");
        }
        // INSTANCE = new BuildStatusManager();
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

    public KubeClient getKubeClient() {
        if (apiServer == null) {
            synchronized (this) {
                if (apiServer == null) {
                    CiCluster cluster = globalBiz.getCiCluster();
                    if (cluster == null) {
                        return null;
                    }
                    apiServer = cluster.getHost();
                    namespace = cluster.getNamespace();
                }
            }
        }
        return new KubeClient(apiServer, namespace);
    }

    public boolean deleteJob(KubeClient client, String jobName)
            throws KubeResponseException, IOException, KubeInternalErrorException {
        Job job = client.jobInfo(jobName);
        Map<String, String> jobSelector = null;
        if (job != null) {
            client.deleteJob(jobName);
            jobSelector = job.getSpec().getSelector().getMatchLabels();
        }
        if (jobSelector == null) {
            jobSelector = new HashMap<>();
            jobSelector.put("build", jobName);
        }
        PodList podList = client.listPod(jobSelector);
        int count = 0;
        int maxCount = 10;
        while (podList != null && podList.getItems() != null && podList.getItems().length != 0) {
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
        Map<String, String> selector = new HashMap<String, String>();
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
                List<BaseImageCustom> customList = imageBiz.getUnGcBaseImageCustom();
                if (customList != null && customList.size() > 0) {
                    for (BaseImageCustom baseImageCustom : customList) {
                        BuildState statusType = BuildState.valueOf(baseImageCustom.getState());
                        switch (statusType) {
                            case Success:
                            case Fail:
                                if (baseImageCustom.getIsGC() == 1) {
                                    continue;
                                }
                                executors.submit(new BaseImageTerminatedChecker(baseImageCustom));
                                break;
                            case Preparing:
                            case Building:
                                executors.submit(new BaseImagePrepareChecker(baseImageCustom));
                                break;
                        }
                    }
                }
            } catch (Exception e) {
                logger.warn("check build failed with message=" + e.getMessage());
            }
        }
    }

    private class TerminatedChecker implements Runnable{
        BuildHistory info;
        public TerminatedChecker(BuildHistory info) {
            this.info = info;
        }
        @Override
        public void run() {
            try {
                String jobName = info.getTaskName();
                KubeClient client = getKubeClient();
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

    private class BaseImageTerminatedChecker implements Runnable{
        BaseImageCustom info;
        public BaseImageTerminatedChecker(BaseImageCustom info) {
            this.info = info;
        }
        @Override
        public void run() {
            try {
                KubeClient client = getKubeClient();
                if (client == null) {
                    return;
                }
                if (deleteJob(client, info.getTaskName())) {
                    imageBiz.updateBaseImageCustomGC(info.getId(), 1);
                } else {
                    imageBiz.updateBaseImageCustomGC(info.getId(), 1);
                }
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
                    KubeClient client = getKubeClient();
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

    private class BaseImagePrepareChecker implements Runnable {
        BaseImageCustom info;
        public BaseImagePrepareChecker(BaseImageCustom info) {
            this.info = info;
        }
        @Override
        public void run() {
            try {
                long createTime = info.getCreateTime();
                if (createTime + preparingExpireTime.get() < System.currentTimeMillis()) {
                    // expired
                    KubeClient client = getKubeClient();
                    if (deleteJob(client, info.getTaskName())) {
                        imageBiz.updateBaseImageCustomGC(info.getId(), 1);
                    } else {
                        imageBiz.updateBaseImageCustomGC(info.getId(), 0);
                    }
                    info.setState(BuildState.Fail.name());
                    info.setMessage("build failed for expired");
                }
            } catch (Exception e) {
                logger.warn("exception when check build job terminated status, with message="
                        + e.getMessage() + "\n" + Arrays.toString(e.getStackTrace()));
            }
        }
    }
}
