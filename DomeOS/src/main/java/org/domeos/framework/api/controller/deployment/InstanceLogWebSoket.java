package org.domeos.framework.api.controller.deployment;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.engine.websocket.WebSocketConnectPool;
import org.domeos.api.model.deployment.InstanceConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.server.standard.SpringConfigurator;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

/**
 * Created by feiliu206363 on 2015/12/21.
 */
@ServerEndpoint(value = "/api/deploy/instance/log/realtime", configurator = SpringConfigurator.class)
public class InstanceLogWebSoket {
    private Logger logger = LoggerFactory.getLogger(InstanceLogWebSoket.class);
    private InstanceConnection connection = new InstanceConnection();

    @OnOpen
    public void onOpen(Session session) {
        if (!StringUtils.isBlank(session.getQueryString())) {
            String[] queryString = session.getQueryString().split("&");
            int clusterId = 0;
            String namespace = null, podName = null, containerName = null;
            for (String param : queryString) {
                String kv[] = param.split("=");
                if ("clusterid".equals(kv[0].toLowerCase())) {
                    clusterId = Integer.valueOf(kv[1]);
                }
                if ("namespace".equals(kv[0].toLowerCase())) {
                    namespace = kv[1];
                }
                if ("instancename".equals(kv[0].toLowerCase())) {
                    podName = kv[1];
                }
                if ("containername".equals(kv[0].toLowerCase())) {
                    containerName = kv[1];
                }
            }
            if (clusterId > 0) {
                connection.setClusterId(clusterId);
                connection.setSession(session);
                connection.setNamespace(namespace);
                connection.setPodName(podName);
                connection.setContainerName(containerName);
                try {
                    WebSocketConnectPool.INSTANCE.addConnection(connection);
                } catch (Exception e) {
                    try {
                        session.getBasicRemote().sendText(e.getMessage());
                        logger.error("send build log realtime message error, " + e.getMessage());
                    } catch (IOException e1) {
                        logger.error("send build log realtime message error, " + e.getMessage());
                    }
                }
            } else {
                try {
                    session.getBasicRemote().sendText("parameter error, project id or build id is null");
                } catch (IOException e) {
                    logger.error("send build log realtime message error, " + e.getMessage());
                }
            }
        }
        logger.info("open connection, query string is " + session.getQueryString());
    }

    @OnClose
    public void onClose() {
        WebSocketConnectPool.INSTANCE.removeConnection(connection);
    }

    @OnMessage
    public void onMessage(String message, Session session) {
    }

    @OnError
    public void onError(Throwable t) {
        logger.warn("build message pass error, message is " + t.getMessage());
        WebSocketConnectPool.INSTANCE.removeConnection(connection);
    }
}
