package org.domeos.framework.api.model.deployment.related;

import org.domeos.util.StringUtils;

/**
 */
public class LogItemDraft {
    private String logPath;               // absolute log path
    private String logTopic;              // kafka topic which we want to send log to
    private boolean autoCollect = false;  // auto collect log to kafka
    private boolean autoDelete = false;   // auto delete old log periodically
    private long logExpired = 0;          // unit in hours
    private String processCmd = null;

    public String checkLegality() {
        String logPathLegality = checkLogPathLegality();
        if (!StringUtils.isBlank(logPathLegality)) {
            return logPathLegality;
        }
        String processCmdLegality = checkProcessCmdLegality();
        if (!StringUtils.isBlank(processCmdLegality)) {
            return processCmdLegality;
        }
        if (autoCollect) {
            if (StringUtils.isBlank(logTopic)) {
                return "logTopic is empty while autoCollect is true";
            }
        }
        if (autoDelete) {
            if (logExpired == 0) {
                return "logExpired not set";
            }
        }
        return "";
    }

    private String checkProcessCmdLegality() {
        if (StringUtils.isBlank(processCmd)) {
            return "";
        }
        // TODO
        return "";
    }

    private String checkLogPathLegality() {
        if (StringUtils.isBlank(logPath)) {
            return "logPath is empty";
        }
        if (!logPath.startsWith("/")) {
            return "logPath should be an absolute path";
        }
        if (logPath.endsWith("/")) {
            return "logPath should not be directory";
        }
        String []tmps = logPath.split("/");
        if (tmps.length <= 2) {
            return "logPath in root path, should be like /xx/yy.log";
        }
        return "";
    }

    /**
     * Get log parent path
     * @param logPath absolute log path, such as /opt/logs/domeos.log
     * @return /opt/logs
     */
    public static String getLogParentPath(String logPath) {
        String []tmps = logPath.split("/");
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i < tmps.length - 1; i++) {
            sb.append("/");
            sb.append(tmps[i]);
        }
        return sb.toString();
    }

    /**
     * Get log name
     * @param logPath absolute log path, such as /opt/logs/domeos.log
     * @return domeos.log
     */
    public static String getLogFileName(String logPath) {
        String [] tmps = logPath.split("/");
        return tmps[tmps.length - 1];
    }

    public String getLogPath() {
        return logPath;
    }

    public void setLogPath(String logPath) {
        this.logPath = logPath;
    }

    public boolean isAutoCollect() {
        return autoCollect;
    }

    public void setAutoCollect(boolean autoCollect) {
        this.autoCollect = autoCollect;
    }

    public String getLogTopic() {
        return logTopic;
    }

    public void setLogTopic(String logTopic) {
        this.logTopic = logTopic;
    }

    public String getProcessCmd() {
        return processCmd;
    }

    public void setProcessCmd(String processCmd) {
        this.processCmd = processCmd;
    }

    public boolean isAutoDelete() {
        return autoDelete;
    }

    public void setAutoDelete(boolean autoDelete) {
        this.autoDelete = autoDelete;
    }

    public long getLogExpired() {
        return logExpired;
    }

    public void setLogExpired(long logExpired) {
        this.logExpired = logExpired;
    }
}
