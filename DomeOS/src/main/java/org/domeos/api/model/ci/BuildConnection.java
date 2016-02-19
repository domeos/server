package org.domeos.api.model.ci;

import org.domeos.exception.JobLogException;
import org.domeos.exception.JobNotFoundException;
import org.domeos.job.JobWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.Session;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
public class BuildConnection implements Connection {
    private int buildId;
    private Session session;
    private Logger logger = LoggerFactory.getLogger(BuildConnection.class);
    private WatchBuildLog watchBuildLog;


    public int getBuildId() {
        return buildId;
    }

    public void setBuildId(int buildId) {
        this.buildId = buildId;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    @Override
    public void sendMessage() throws Exception {
        watchBuildLog = new WatchBuildLog();
        watchBuildLog.run();
    }

    @Override
    public void stopMessage() {
        watchBuildLog.stopRun();
    }

    public class WatchBuildLog implements Runnable {
        private JobWrapper jobWrapper;
        private ContainerLogHandler handler;

        public WatchBuildLog() throws Exception {
            this.jobWrapper = new JobWrapper().init();
            this.handler = new ContainerLogHandler(session);
        }

        public ContainerLogHandler getHandler() {
            return handler;
        }

        public void setHandler(ContainerLogHandler handler) {
            this.handler = handler;
        }

        public void stopRun() {
            if (handler != null) {
                handler.setStop(true);
            }
        }

        @Override
        public void run() {
            try {
                jobWrapper.fetchJobLogs(buildId, handler);
            } catch (JobNotFoundException | JobLogException e) {
                logger.warn("get exception when get container log, message is " + e.getMessage());
            }
        }
    }
}
