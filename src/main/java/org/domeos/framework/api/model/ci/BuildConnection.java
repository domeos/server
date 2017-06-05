package org.domeos.framework.api.model.ci;

import io.fabric8.kubernetes.client.dsl.LogWatch;
import org.domeos.exception.JobLogException;
import org.domeos.exception.JobNotFoundException;
import org.domeos.framework.engine.k8s.JobWrapper;
import org.domeos.framework.engine.model.JobType;
import org.domeos.framework.engine.websocket.Connection;
import org.domeos.global.ClientConfigure;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.io.PipedInputStream;
import java.util.concurrent.Callable;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
public class BuildConnection implements Connection {
    private WatchBuildLog watchBuildLog;
    private int buildId;
    private WebSocketSession session;
    private Logger logger = LoggerFactory.getLogger(BuildConnection.class);
    private JobType jobType;

    public int getBuildId() {
        return buildId;
    }

    public void setBuildId(int buildId) {
        this.buildId = buildId;
    }

    public WebSocketSession getSession() {
        return session;
    }

    public BuildConnection setSession(WebSocketSession session) {
        this.session = session;
        return this;
    }

    public JobType getJobType() {
        return jobType;
    }

    public void setJobType(JobType jobType) {
        this.jobType = jobType;
    }

    @Override
    public void sendMessage() throws Exception {
        watchBuildLog = new WatchBuildLog();
        ClientConfigure.executorService.submit(new WatchBuildLogTask(watchBuildLog));
    }

    @Override
    public void stopMessage() {
        watchBuildLog.stopRun();
    }

    private class WatchBuildLog {
        private JobWrapper jobWrapper;
        private LogWatch logWatch;
        private PipedInputStream pipedInputStream;

        public WatchBuildLog() throws Exception {
            this.jobWrapper = new JobWrapper().init();
        }

        private void startRun() {
            try {
                logWatch = jobWrapper.fetchJobLogs(buildId, jobType);
                pipedInputStream = (PipedInputStream) logWatch.getOutput();
                readMessageContinued();
            } catch (JobNotFoundException | JobLogException e) {
                logger.warn("get exception when get container log, message is " + e.getMessage());
            }
        }

        private void stopRun() {
            try {
                pipedInputStream.close();
                logWatch.close();
            } catch (IOException ignored) {
            }
        }

        private void readMessageContinued() {
            try {
                while (true) {
                    byte[] buf = new byte[1024];
                    int len = pipedInputStream.read(buf);
                    session.sendMessage(new TextMessage(new String(buf, 0, len)));
                    if (len == 0) {
                        stopRun();
                    }
                }
            } catch (IOException e) {
                logger.warn("get exception when send container log, message is " + e.getMessage());
                stopRun();
            }
        }
    }

    private class WatchBuildLogTask implements Callable<WatchBuildLog> {
        private WatchBuildLog watchBuildLog;

        public WatchBuildLogTask(WatchBuildLog watchBuildLog) {
            this.watchBuildLog = watchBuildLog;
        }

        public WatchBuildLog call() throws Exception {
            watchBuildLog.startRun();
            return null;
        }
    }

}
