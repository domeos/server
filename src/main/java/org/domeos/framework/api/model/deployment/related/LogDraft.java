package org.domeos.framework.api.model.deployment.related;

import io.fabric8.kubernetes.api.model.*;
import org.domeos.util.StringUtils;

import org.domeos.framework.api.consolemodel.deployment.ContainerDraft;


import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    public static List<VolumeMount> formatOriginalContainerVolumeMount(List<LogItemDraft> logItemDrafts, int idxSuffix) {
        List<VolumeMount> volumeMounts = new ArrayList<>();
        Set<String> mountPathSet = new HashSet<>();
        for (LogItemDraft logItemDraft : logItemDrafts) {
            if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                String mountPath = LogItemDraft.getLogParentPath(logItemDraft.getLogPath());
                if (!mountPathSet.contains(mountPath)) {
                    mountPathSet.add(mountPath);
                    VolumeMount volumeMount = new VolumeMount();
                    volumeMount.setName("data" + idxSuffix);
                    volumeMount.setMountPath(mountPath);
                    volumeMounts.add(volumeMount);
                    idxSuffix++;
                }
            }
        }
        return volumeMounts;
    }

    /**
     * corresponding volumemount so that the flume container can access the log file
     * @param logDraft
     * @return
     */
    @Deprecated
    public static List<VolumeMount> formatFlumeContainerVolumeMount(LogDraft logDraft) {
        List<VolumeMount> volumeMounts = new ArrayList<>();
        Set<String> mountPathSet = new HashSet<>();
        int idxSuffix = 1;
        for (LogItemDraft logItemDraft : logDraft.getLogItemDrafts()) {
            if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                String mountPath = LogItemDraft.getLogParentPath(logItemDraft.getLogPath());
                if (!mountPathSet.contains(mountPath)) {
                    mountPathSet.add(mountPath);
                    VolumeMount volumeMount = new VolumeMount();
                    volumeMount.setName("data" + idxSuffix);
                    volumeMount.setMountPath(FLUME_MOUNT_PATH_PREFIX + idxSuffix);
                    volumeMounts.add(volumeMount);
                    idxSuffix++;
                }
            }
        }
        return volumeMounts;
    }

    public static List<VolumeMount> formatFlumeContainerVolumeMount(List<ContainerDraft> containerDrafts) {
        List<VolumeMount> volumeMounts = new ArrayList<>();
        Set<String> mountPathSet = new HashSet<>();
        int idxSuffix = 1;
        for (ContainerDraft containerDraft : containerDrafts) {
            for (LogItemDraft logItemDraft : containerDraft.getLogItemDrafts()) {
                if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                    String mountPath = LogItemDraft.getLogParentPath(logItemDraft.getLogPath());
                    if (!mountPathSet.contains(mountPath)) {
                        mountPathSet.add(mountPath);
                        VolumeMount volumeMount = new VolumeMount();
                        volumeMount.setName("data" + idxSuffix);
                        volumeMount.setMountPath(FLUME_MOUNT_PATH_PREFIX + idxSuffix);
                        volumeMounts.add(volumeMount);
                        idxSuffix++;
                    }
                }
            }
        }
        return volumeMounts;
    }

    @Deprecated
    public static List<Volume> formatPodVolume(LogDraft logDraft) {
        List<Volume> volumes = new ArrayList<>();
        Set<String> mountPathSet = new HashSet<>();
        int idxSuffix = 1;
        for (LogItemDraft logItemDraft : logDraft.getLogItemDrafts()) {
            if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                String mountPath = LogItemDraft.getLogParentPath(logItemDraft.getLogPath());
                if (!mountPathSet.contains(mountPath)) {
                    mountPathSet.add(mountPath);
                    Volume volume = new VolumeBuilder()
                            .withName("data" + idxSuffix)
                            .withEmptyDir(new EmptyDirVolumeSource())
                            .build();
                    volumes.add(volume);
                    idxSuffix++;
                }
            }
        }
        return volumes;
    }

    public static List<Volume> formatPodVolume(List<ContainerDraft> containerDrafts) {
        List<Volume> volumes = new ArrayList<>();
        Set<String> mountPathSet = new HashSet<>();
        int idxSuffix = 1;
        for (ContainerDraft containerDraft : containerDrafts) {
            for (LogItemDraft logItemDraft : containerDraft.getLogItemDrafts()) {
                if (logItemDraft.isAutoCollect() || logItemDraft.isAutoDelete()) {
                    String mountPath = LogItemDraft.getLogParentPath(logItemDraft.getLogPath());
                    if (!mountPathSet.contains(mountPath)) {
                        mountPathSet.add(mountPath);
                        Volume volume = new Volume();
                        volume.setName("data" + idxSuffix);
                        volume.setEmptyDir(new EmptyDirVolumeSource());
                        volumes.add(volume);
                        idxSuffix++;
                    }
                }
            }
        }
        return volumes;
    }

    public static List<EnvVar> formatContainerLogEnv(String kafkaBrokers, List<ContainerDraft> containerDrafts) {
        List<EnvVar> envs = new ArrayList<>();
        int idxFlumeSuffix=1;
        int idxCleanSuffix=1;
        List<String> mountPathList = new ArrayList<>();
        for ( ContainerDraft containerDraft : containerDrafts) {
            for (LogItemDraft logItemDraft : containerDraft.getLogItemDrafts()) {
                int idxSuffix;
                String mountPath = LogItemDraft.getLogParentPath(logItemDraft.getLogPath());
                // idxSuffix starts from 1
                if (mountPathList.contains(mountPath)) {
                    idxSuffix = mountPathList.indexOf(mountPath) + 1;
                } else {
                    mountPathList.add(mountPath);
                    idxSuffix = mountPathList.size();
                }
                if (logItemDraft.isAutoCollect()) {
                    String logFileName = FLUME_MOUNT_PATH_PREFIX + idxSuffix
                            + "/" + LogItemDraft.getLogFileName(logItemDraft.getLogPath());
                    EnvVar tmpEnv = new EnvVarBuilder()
                            .withName(String.format("DOMEOS_FLUME_LOGFILE%d", idxFlumeSuffix))
                            .withValue(logFileName)
                            .build();
                    envs.add(tmpEnv);
                    tmpEnv = new EnvVarBuilder()
                            .withName(String.format("DOMEOS_FLUME_TOPIC%d", idxFlumeSuffix))
                            .withValue(logItemDraft.getLogTopic())
                            .build();
                    envs.add(tmpEnv);
                    if (!StringUtils.isBlank(logItemDraft.getProcessCmd())) {
                        tmpEnv = new EnvVarBuilder()
                                .withName(String.format("DOMEOS_FLUME_MORECMD%d", idxFlumeSuffix))
                                .withValue(logItemDraft.getProcessCmd())
                                .build();
                        envs.add(tmpEnv);
                    }
                    idxFlumeSuffix++;
                }
                if (logItemDraft.isAutoDelete()) {
                    String logFileName = FLUME_MOUNT_PATH_PREFIX + idxSuffix
                            + "/" + LogItemDraft.getLogFileName(logItemDraft.getLogPath());
                    EnvVar tmpEnv = new EnvVarBuilder()
                            .withName(String.format("DOMEOS_CLEAN_LOGFILE%d", idxCleanSuffix))
                            .withValue(logFileName)
                            .build();
                    envs.add(tmpEnv);
                    tmpEnv = new EnvVarBuilder()
                            .withName(String.format("DOMEOS_CLEAN_EXPIRETIME%d", idxCleanSuffix))
                            .withValue(Long.toString(logItemDraft.getLogExpired()*60))
                            .build();
                    // HOUR to minute
                    envs.add(tmpEnv);
                    idxCleanSuffix++;
                }
            }
        }
        if (idxFlumeSuffix > 1) {
            EnvVar tmpEnv = new EnvVarBuilder()
                    .withName("DOMEOS_FLUME_LOG_COUNT")
                    .withValue(Integer.toString(idxFlumeSuffix-1))
                    .build();
            envs.add(tmpEnv);
            // kafka
            tmpEnv = new EnvVarBuilder()
                    .withName("DOMEOS_FLUME_BROKER")
                    .withValue(kafkaBrokers)
                    .build();
            envs.add(tmpEnv);
        }
        if (idxCleanSuffix > 1) {
            // delete log count
            EnvVar tmpEnv = new EnvVarBuilder()
                    .withName("DOMEOS_CLEAN_LOG_COUNT")
                    .withValue(Integer.toString(idxCleanSuffix-1))
                    .build();
            envs.add(tmpEnv);
        }
        return envs;
    }

    @Deprecated
    public static List<EnvVar> formatLogDraftEnv(LogDraft logDraft) {
        List<EnvVar> envs = new ArrayList<>();
        if (logDraft.isAutoCollect()) {
            // collect log count
            EnvVar tmpEnv = new EnvVarBuilder()
                    .withName("DOMEOS_FLUME_LOG_COUNT")
                    .withValue(Integer.toString(logDraft.autoCollectLogCount()))
                    .build();
            envs.add(tmpEnv);
            // kafka
            tmpEnv = new EnvVarBuilder()
                    .withName("DOMEOS_FLUME_BROKER")
                    .withValue(logDraft.getKafkaBrokers())
                    .build();
            envs.add(tmpEnv);
        }
        if (logDraft.isAutoDelete()) {
            // delete log count
            EnvVar tmpEnv = new EnvVarBuilder()
                    .withName("DOMEOS_CLEAN_LOG_COUNT")
                    .withValue(Integer.toString(logDraft.autoDeleteLogCount()))
                    .build();
            envs.add(tmpEnv);
        }
        int idxFlumeSuffix=1;
        int idxCleanSuffix=1;
        List<String> mountPathList = new ArrayList<>();
        for (LogItemDraft logItemDraft : logDraft.getLogItemDrafts()) {
            int idxSuffix;
            String mountPath = LogItemDraft.getLogParentPath(logItemDraft.getLogPath());
            // idxSuffix starts from 1
            if (mountPathList.contains(mountPath)) {
                idxSuffix = mountPathList.indexOf(mountPath) + 1;
            } else {
                mountPathList.add(mountPath);
                idxSuffix = mountPathList.size();
            }
            if (logItemDraft.isAutoCollect()) {
                String logFileName = FLUME_MOUNT_PATH_PREFIX + idxSuffix
                    + "/" + LogItemDraft.getLogFileName(logItemDraft.getLogPath());
                EnvVar tmpEnv = new EnvVarBuilder()
                        .withName(String.format("DOMEOS_FLUME_LOGFILE%d", idxFlumeSuffix))
                        .withValue(logFileName)
                        .build();
                envs.add(tmpEnv);
                tmpEnv = new EnvVarBuilder()
                        .withName(String.format("DOMEOS_FLUME_TOPIC%d", idxFlumeSuffix))
                        .withValue(logItemDraft.getLogTopic())
                        .build();
                envs.add(tmpEnv);
                if (!StringUtils.isBlank(logItemDraft.getProcessCmd())) {
                    tmpEnv = new EnvVarBuilder()
                            .withName(String.format("DOMEOS_FLUME_MORECMD%d", idxFlumeSuffix))
                            .withValue(logItemDraft.getProcessCmd())
                            .build();
                    envs.add(tmpEnv);
                }
                idxFlumeSuffix++;
            }
            if (logItemDraft.isAutoDelete()) {
                String logFileName = FLUME_MOUNT_PATH_PREFIX + idxSuffix
                    + "/" + LogItemDraft.getLogFileName(logItemDraft.getLogPath());
                EnvVar tmpEnv = new EnvVarBuilder()
                        .withName(String.format("DOMEOS_CLEAN_LOGFILE%d", idxCleanSuffix))
                        .withValue(logFileName)
                        .build();
                envs.add(tmpEnv);
                tmpEnv = new EnvVarBuilder()
                        .withName(String.format("DOMEOS_CLEAN_EXPIRETIME%d", idxCleanSuffix))
                        .withValue(Long.toString(logItemDraft.getLogExpired()*60))
                        .build();
                // HOUR to minute
                envs.add(tmpEnv);
                idxCleanSuffix++;
            }
        }
//        tmpEnv = new EnvVar();
//        tmpEnv.putName("DOMEOS_FLUME_CHANNEL_DIR").putValue("/log");
//        envs.add(tmpEnv);
        return envs;
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
