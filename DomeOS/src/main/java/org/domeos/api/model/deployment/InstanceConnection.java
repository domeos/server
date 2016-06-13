package org.domeos.api.model.deployment;

import org.domeos.framework.engine.websocket.Connection;
import org.domeos.framework.api.model.ci.ContainerLogHandler;
import org.domeos.exception.JobLogException;
import org.domeos.exception.JobNotFoundException;
import org.domeos.framework.engine.k8s.NodeWrapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.websocket.Session;

/**
 * Created by feiliu206363 on 2015/12/21.
 */
public class InstanceConnection implements Connection {
    private int clusterId;
    private String namespace;
    private String podName;
    private String containerName;
    private Session session;
    private Logger logger = LoggerFactory.getLogger(InstanceConnection.class);

    private WatchContainerLog watchContainerLog;

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getPodName() {
        return podName;
    }

    public void setPodName(String podName) {
        this.podName = podName;
    }

    public String getContainerName() {
        return containerName;
    }

    public void setContainerName(String containerName) {
        this.containerName = containerName;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    @Override
    public void sendMessage() throws Exception {
        watchContainerLog = new WatchContainerLog(clusterId, namespace, podName, containerName);
        watchContainerLog.run();
    }

    @Override
    public void stopMessage() {
        watchContainerLog.stopRun();
    }


    public class WatchContainerLog implements Runnable {
        private NodeWrapper nodeWrapper;
        private ContainerLogHandler handler;
        private String podName;
        private String containerName;

        public WatchContainerLog(int clusterId, String namespace, String podName, String containerName) throws Exception {
            this.nodeWrapper = new NodeWrapper().init(clusterId, namespace);
            this.handler = new ContainerLogHandler(session);
            this.podName = podName;
            this.containerName = containerName;
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
                nodeWrapper.fetchContainerLogs(podName, containerName, handler);
            } catch (JobNotFoundException | JobLogException e) {
                logger.warn("get exception when get container log, message is " + e.getMessage());
            }
        }
    }
}
