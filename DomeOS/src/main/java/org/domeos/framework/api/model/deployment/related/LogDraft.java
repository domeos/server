package org.domeos.framework.api.model.deployment.related;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;
import org.domeos.client.kubernetesclient.definitions.v1.EmptyDirVolumeSource;
import org.domeos.client.kubernetesclient.definitions.v1.EnvVar;
import org.domeos.client.kubernetesclient.definitions.v1.Volume;
import org.domeos.client.kubernetesclient.definitions.v1.VolumeMount;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by zhenfengchen on 15-12-23.
 * Notice:
 *     volumeMounts need to be set
 */
public class LogDraft {
    final static String FLUME_MOUNT_PATH_PREFIX = "/opt/outlog/logdir";
    private String kafkaBrokers;   // kafka broker lists
    private ContainerDraft flumeDraft;
    private List<LogItemDraft> logItemDrafts;

    public String getKafkaBrokers() {
        return kafkaBrokers;
    }

    public void setKafkaBrokers(String kafkaBrokers) {
        this.kafkaBrokers = kafkaBrokers;
    }

    public List<LogItemDraft> getLogItemDrafts() {
        return logItemDrafts;
    }

    public void setLogItemDrafts(List<LogItemDraft> logItemDrafts) {
        this.logItemDrafts = logItemDrafts;
    }

    public ContainerDraft getFlumeDraft() {
        return flumeDraft;
    }

    public void setFlumeDraft(ContainerDraft flumeDraft) {
        this.flumeDraft = flumeDraft;
        if  (this.flumeDraft != null) {
            if (this.flumeDraft.getMem() <0 ) {
                this.flumeDraft.setMem(1024.0); // 1G
            }
            if (this.flumeDraft.getCpu() < 0) {
                this.flumeDraft.setCpu(0.5);
            }
        }
    }

    /**
     * if a container sets log path, then we need to mount the log path
     * so that the flume container can access the log file
     * @return
     */
    public static VolumeMount[] formatOriginalContainerVolumeMount(LogDraft logDraft) {
        List<VolumeMount> volumeMounts = new ArrayList<>();
        int idxSuffix = 1;
        for (LogItemDraft logItemDraft : logDraft.getLogItemDrafts()) {
            if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                VolumeMount volumeMount = new VolumeMount();
                volumeMount.setName("data" + idxSuffix);
                volumeMount.setMountPath(LogItemDraft.getLogParentPath(logItemDraft.getLogPath()));
                volumeMounts.add(volumeMount);
                idxSuffix++;
            }
        }
        return volumeMounts.toArray(new VolumeMount[]{});
    }

    /**
     * corresponding volumemount so that the flume container can access the log file
     * @param logDraft
     * @return
     */
    public static VolumeMount[] formatFlumeContainerVolumeMount(LogDraft logDraft) {
        List<VolumeMount> volumeMounts = new ArrayList<>();
        int idxSuffix = 1;
        for (LogItemDraft logItemDraft : logDraft.getLogItemDrafts()) {
            if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                VolumeMount volumeMount = new VolumeMount();
                volumeMount.setName("data" + idxSuffix);
                volumeMount.setMountPath(FLUME_MOUNT_PATH_PREFIX + idxSuffix);
                volumeMounts.add(volumeMount);
                idxSuffix++;
            }
        }
        return volumeMounts.toArray(new VolumeMount[]{});
    }

    public static Volume[] formatPodVolume(LogDraft logDraft) {
        List<Volume> volumes = new ArrayList<>();
        int idxSuffix = 1;
        for (LogItemDraft logItemDraft : logDraft.getLogItemDrafts()) {
            if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                Volume volume = new Volume();
                volume.setName("data" + idxSuffix);
                volume.setEmptyDir(new EmptyDirVolumeSource());
                volumes.add(volume);
                idxSuffix++;
            }
        }
        return volumes.toArray(new Volume[]{});
    }

    public static EnvVar[] formatEnv(LogDraft logDraft) {
        List<EnvVar> envs = new ArrayList<>();
        if (logDraft.isAutoCollect()) {
            // collect log count
            EnvVar tmpEnv = new EnvVar();
            tmpEnv.putName("DOMEOS_FLUME_LOG_COUNT").putValue(Integer.toString(logDraft.autoCollectLogCount()));
            envs.add(tmpEnv);
            // kafka
            tmpEnv = new EnvVar();
            tmpEnv.putName("DOMEOS_FLUME_BROKER").putValue(logDraft.getKafkaBrokers());
            envs.add(tmpEnv);
        }
        if (logDraft.isAutoDelete()) {
            // delete log count
            EnvVar tmpEnv = new EnvVar();
            tmpEnv.putName("DOMEOS_CLEAN_LOG_COUNT").putValue(Integer.toString(logDraft.autoDeleteLogCount()));
            envs.add(tmpEnv);
        }
        int idxSuffix = 1;
        int idxFlumeSuffix=1;
        int idxCleanSuffix=1;
        for (LogItemDraft logItemDraft : logDraft.getLogItemDrafts()) {
            if (logItemDraft.isAutoCollect()) {
                EnvVar tmpEnv = new EnvVar();
                String logFileName = FLUME_MOUNT_PATH_PREFIX + idxSuffix
                    + "/" + LogItemDraft.getLogFileName(logItemDraft.getLogPath());
                tmpEnv.putName(String.format("DOMEOS_FLUME_LOGFILE%d", idxFlumeSuffix)).putValue(logFileName);
                envs.add(tmpEnv);
                tmpEnv = new EnvVar();
                tmpEnv.putName(String.format("DOMEOS_FLUME_TOPIC%d", idxFlumeSuffix)).putValue(
                    logItemDraft.getLogTopic());
                envs.add(tmpEnv);
                if (!StringUtils.isBlank(logItemDraft.getProcessCmd())) {
                    tmpEnv = new EnvVar();
                    tmpEnv.putName(String.format("DOMEOS_FLUME_MORECMD%d", idxFlumeSuffix)).putValue(
                        logItemDraft.getProcessCmd());
                    envs.add(tmpEnv);
                }
                idxFlumeSuffix++;
            }
            if (logItemDraft.isAutoDelete()) {
                EnvVar tmpEnv = new EnvVar();
                String logFileName = FLUME_MOUNT_PATH_PREFIX + idxSuffix
                    + "/" + LogItemDraft.getLogFileName(logItemDraft.getLogPath());
                tmpEnv.putName(String.format("DOMEOS_CLEAN_LOGFILE%d", idxCleanSuffix)).putValue(logFileName);
                envs.add(tmpEnv);
                tmpEnv = new EnvVar();
                // HOUR to minute
                tmpEnv.putName(String.format("DOMEOS_CLEAN_EXPIRETIME%d", idxCleanSuffix)).putValue(
                    Long.toString(logItemDraft.getLogExpired()*60));
                envs.add(tmpEnv);
                idxCleanSuffix++;
            }
            idxSuffix++;
        }
//        tmpEnv = new EnvVar();
//        tmpEnv.putName("DOMEOS_FLUME_CHANNEL_DIR").putValue("/log");
//        envs.add(tmpEnv);
        return envs.toArray(new EnvVar[]{});
    }

    private int autoCollectLogCount() {
        int count = 0;
        for (LogItemDraft logItemDraft: logItemDrafts) {
            if (logItemDraft.isAutoCollect()) {
                count++;
            }
        }
        return count;
    }

    private int autoDeleteLogCount() {
        int count = 0;
        for (LogItemDraft logItemDraft: logItemDrafts) {
            if (logItemDraft.isAutoDelete()) {
                count++;
            }
        }
        return count;
    }

    public boolean needFlumeContainer() {
        if (logItemDrafts == null) {
            return false;
        }
        for (LogItemDraft logItemDraft: logItemDrafts) {
            if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                return true;
            }
        }
        return false;
    }

    private boolean isAutoCollect() {
        for (LogItemDraft logItemDraft: logItemDrafts) {
            if (logItemDraft.isAutoCollect()) {
                return true;
            }
        }
        return false;
    }

    private boolean isAutoDelete() {
        for (LogItemDraft logItemDraft: logItemDrafts) {
            if (logItemDraft.isAutoDelete()) {
                return true;
            }
        }
        return false;
    }

    // only check logItemDraft legality when create a version of deployment
    public String checkLegality() {
        if (logItemDrafts != null && logItemDrafts.size() > 0) {
            for (LogItemDraft logItemDraft: logItemDrafts) {
                String logItemLegality = logItemDraft.checkLegality();
                if (!StringUtils.isBlank(logItemLegality)) {
                    return logItemLegality;
                }
            }
            return "";
        }
        return "";
    }

    // check flume container legality when start deployment
    public String checkContainerLegality() {
        if (logItemDrafts != null && logItemDrafts.size() > 0) {
            boolean collectLogFlag = isAutoCollect();
            if (collectLogFlag) {
                // if autoCollect, need to set kafkaBrokers
                if (StringUtils.isBlank(kafkaBrokers)) {
                    return "kafkaBrokers is empty";
                } else if (flumeDraft == null) {
                    return "flumeDraft is empty";
                } else if (StringUtils.isBlank(flumeDraft.checkLegality())) {
                    return flumeDraft.checkLegality();
                }
                return "";
            }
            boolean deleteLogFlag = isAutoDelete();
            if (deleteLogFlag) {
                // only need flumeDraft
                if (flumeDraft == null) {
                    return "flumeDraft is empty";
                } else if (StringUtils.isBlank(flumeDraft.checkLegality())) {
                    return flumeDraft.checkLegality();
                }
                return "";
            }
            return "";
        }
        return "";
    }
}
